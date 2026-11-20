-- =============================================================================
-- BRIKKA Phase 1 — initial schema
--
-- Design:       docs/superpowers/specs/2026-10-07-brikka-schema-design.md
-- Requirements: docs/requirements/v1.5/10_데이터요구사항.md (data), 11_비기능요건.md (security)
--
-- Sections
--   0  Schemas
--   1  Enum types
--   2  Core helpers (actor, today, access)
--   3  Organization & users           (운영사 · 사용자)
--   4  Assets                         (건물 · 유닛)
--   5  Parties                        (임대인 · 임차인 · 중개사)
--   6  Charge configuration           (청구항목 · 검침 설정)
--   7  Contracts                      (계약)
--   8  History                        (이력)
--   9  Month close                    (월 마감)
--   10 Settlement                     (관리비 정산)
--   11 Invoices                       (청구서 · 청구 건 · 추가 청구)
--   12 Bank import                    (은행 거래내역)
--   13 Payments                       (입금 · 수납 배분 · 이월 · 환불 · 연체료)
--   14 Ledger                         (원장)
--   15 Documents                      (문서)
--   16 Notifications                  (발송 내역)
--   17 Security log & label tables    (private)
--   18 Trigger functions
--   19 Authorization & history helpers
--   20 Seed rows (system actor, permissions, labels)
--   21 Triggers
--   22 Views
--   23 Row level security
--   24 Grants
--
-- Not in this file: write RPCs (public.<verb_object>), pg_cron jobs, storage buckets
-- and storage policies, PAY-12 / DASH-1 / REP-1 aggregate views, seed data.
--
-- Error codes (SQLSTATE): BK001 forbidden · BK002 period_locked · BK003 building_non_operating
--   BK004 stale_plan · BK005 invariant_violation · BK006 invalid_state_transition
--   BK007 reason_required · BK008 duplicate
-- =============================================================================


-- =============================================================================
-- 0. Schemas
-- =============================================================================

create schema if not exists private;
comment on schema private is 'Internal helpers, trigger functions, permission matrix, security log. Not exposed through PostgREST.';
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;


-- =============================================================================
-- 1. Enum types  (labels: docs/glossary.md, private.enum_label)
-- =============================================================================

create type public.operator_kind as enum ('production', 'test');
create type public.operator_status as enum ('active', 'suspended');
create type public.account_status as enum ('active', 'blocked');
create type public.member_role as enum ('super_admin', 'admin', 'owner', 'tenant_contact');

create type public.building_type as enum (
  'office', 'neighborhood_retail', 'knowledge_industry_center', 'mixed_retail', 'logistics_warehouse', 'other');
create type public.hvac_type as enum ('central', 'ehp', 'ghp', 'district_heating', 'individual', 'other');
create type public.building_operating_status as enum ('operating', 'non_operating');
create type public.billing_month_ref as enum ('prev', 'current');
create type public.due_month_ref as enum ('current', 'next');
create type public.unit_usage as enum ('office', 'neighborhood_retail', 'storage', 'other');
create type public.non_operating_reason as enum ('owner_use', 'construction');
create type public.unit_status as enum ('vacant', 'occupied', 'non_operating');

create type public.owner_kind as enum ('individual', 'corporation', 'sole_proprietor');
create type public.tenant_kind as enum ('corporation', 'sole_proprietor');

create type public.contract_status as enum ('pending', 'active', 'ended', 'voided');
create type public.contract_type as enum ('fixed_term', 'auto_renew');
create type public.termination_type as enum ('expiry', 'mutual', 'breach');
create type public.hvac_ownership as enum ('tenant_installed', 'tenant_inherited', 'landlord_installed');
create type public.parking_type as enum ('ground', 'underground', 'mechanical');
create type public.parking_fee_type as enum ('free', 'monthly');
create type public.rent_change_status as enum ('scheduled', 'applied');

create type public.standard_charge_code as enum (
  'rent', 'fixed_mgmt_fee', 'electricity', 'power_fund', 'tv_license', 'water', 'gas', 'parking',
  'traffic_levy', 'septic_cleaning', 'elevator_maintenance', 'cleaning', 'security', 'disinfection',
  'facility_maintenance', 'safety_inspection', 'repair', 'misc', 'late_fee');
create type public.calc_method as enum ('fixed', 'settlement', 'none');
create type public.issuance_doc as enum ('tax_invoice', 'exempt_invoice', 'statement');
create type public.recurrence as enum ('monthly', 'bimonthly', 'quarterly', 'semiannual', 'annual');
create type public.allocation_basis as enum ('usage', 'area', 'usage_plus_area', 'manual');
create type public.evidence_doc as enum ('bill', 'statement', 'contract', 'tally');

create type public.invoice_kind as enum ('regular', 'move_out', 'late_fee');
create type public.invoice_status as enum ('valid', 'cancelled');
create type public.line_source as enum ('fixed', 'prorated', 'settlement', 'adhoc', 'late_fee', 'manual');
create type public.payment_status as enum ('paid', 'partial', 'not_due', 'overdue', 'overpaid', 'cancelled');

create type public.payment_method as enum ('bank_transfer', 'card', 'cash', 'deposit_offset', 'virtual_account');
create type public.deposit_reg_method as enum ('manual', 'bank_match', 'pg_auto');
create type public.match_basis as enum ('alias', 'manual');
create type public.deposit_status as enum ('valid', 'void');
create type public.allocation_status as enum ('valid', 'cancelled', 'moved');
create type public.carryover_status as enum ('valid', 'cancelled');
create type public.late_fee_method as enum ('full', 'half', 'manual', 'waive_all');
create type public.refund_kind as enum ('overpayment', 'misdeposit');
create type public.bank_row_status as enum ('auto_matched', 'unmatched', 'confirmed', 'ignored', 'misdeposit');

create type public.ledger_txn_type as enum (
  'charge', 'charge_cancel', 'reduction', 'payment', 'payment_cancel', 'refund',
  'deposit_received', 'deposit_deducted', 'deposit_returned');
create type public.ledger_account as enum ('receivable', 'security_deposit');
create type public.ledger_side as enum ('debit', 'credit');

create type public.settlement_status as enum ('draft', 'confirmed');
create type public.close_status as enum ('closed', 'cancelled');

create type public.document_category as enum (
  'lease_contract', 'business_id', 'deposit', 'billing', 'repair_request', 'facility',
  'building_docs', 'tenant_comm', 'report', 'other');

create type public.history_target as enum (
  'building', 'unit', 'contract', 'charge', 'payment', 'settlement', 'charge_item',
  'building_fee_setting', 'user', 'document', 'month_close');
create type public.history_change as enum (
  'create', 'update', 'delete', 'status_change', 'void_deposit', 'cancel_invoice', 'reduction',
  'reallocation', 'deactivate', 'multiplier_adjust', 'close', 'close_cancel');

create type public.notification_kind as enum (
  'invite', 'password_reset', 'welcome', 'invoice', 'payment_reminder', 'arrears_notice',
  'invoice_reissue', 'owner_report');
create type public.notification_channel as enum ('email', 'alimtalk');
create type public.notification_mode as enum ('auto', 'manual');
create type public.notification_status as enum ('pending', 'sent', 'failed');

create type public.security_event as enum (
  'login_success', 'login_failure', 'account_locked', 'role_changed', 'assignment_changed',
  'account_blocked', 'account_unblocked', 'sensitive_download', 'data_export',
  'month_close_cancelled', 'operator_switched');


-- =============================================================================
-- 2. Core helpers
--    plpgsql bodies are resolved at call time, so these can precede the tables
--    they read. All are SECURITY DEFINER so RLS policies can call them.
-- =============================================================================

-- The only definition of business "today". current_date is UTC on Supabase.
create function private.today_kst() returns date
language sql stable set search_path = ''
as $$ select (now() at time zone 'Asia/Seoul')::date $$;

-- Fixed account recorded as the actor of scheduled jobs ("admin_system", §3.6).
create function private.system_actor_id() returns uuid
language sql immutable set search_path = ''
as $$ select '00000000-0000-0000-0000-000000000001'::uuid $$;

create function private.current_user_id() returns uuid
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  select ua.id into v_id
  from public.user_account ua
  where ua.auth_user_id = auth.uid() and ua.status = 'active';
  return v_id;
end;
$$;

-- Actor for created_by / updated_by defaults: the caller, or admin_system for jobs.
create function private.actor_id() returns uuid
language plpgsql stable security definer set search_path = ''
as $$
begin
  return coalesce(private.current_user_id(), private.system_actor_id());
end;
$$;

-- Operator the caller is working in: requires an active account, an active
-- membership in that operator, and an active operator.
create function private.current_operator_id() returns uuid
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_id uuid;
begin
  select ua.active_operator_id into v_id
  from public.user_account ua
  join public.operator_membership m
    on m.user_id = ua.id and m.operator_id = ua.active_operator_id and m.is_active
  join public.operator o
    on o.id = ua.active_operator_id and o.status = 'active'
  where ua.auth_user_id = auth.uid() and ua.status = 'active';
  return v_id;
end;
$$;

create function private.current_member_role() returns public.member_role
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_role public.member_role;
begin
  select m.role into v_role
  from public.user_account ua
  join public.operator_membership m
    on m.user_id = ua.id and m.operator_id = ua.active_operator_id and m.is_active
  join public.operator o
    on o.id = ua.active_operator_id and o.status = 'active'
  where ua.auth_user_id = auth.uid() and ua.status = 'active';
  return v_role;
end;
$$;

create function private.is_super_admin() returns boolean
language plpgsql stable security definer set search_path = ''
as $$
begin
  return coalesce(private.current_member_role() = 'super_admin', false);
end;
$$;

create function private.is_system_operator() returns boolean
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_flag boolean;
begin
  select ua.is_system_operator into v_flag
  from public.user_account ua
  where ua.auth_user_id = auth.uid() and ua.status = 'active';
  return coalesce(v_flag, false);
end;
$$;

-- Operators the caller belongs to (for the operator table itself).
create function private.my_operator_ids() returns setof uuid
language plpgsql stable security definer set search_path = ''
as $$
begin
  return query
    select m.operator_id
    from public.user_account ua
    join public.operator_membership m on m.user_id = ua.id and m.is_active
    where ua.auth_user_id = auth.uid() and ua.status = 'active';
end;
$$;

-- Buildings the caller may see in the current operator: all for a super admin,
-- assigned ones for an admin, none for anyone else (§7.3.3).
-- Policies use `building_id in (select private.accessible_building_ids())`
-- so the set is computed once per statement.
create function private.accessible_building_ids() returns setof uuid
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_operator uuid := private.current_operator_id();
  v_role public.member_role := private.current_member_role();
  v_user uuid := private.current_user_id();
begin
  if v_operator is null then
    return;
  end if;
  if v_role = 'super_admin' then
    return query select b.id from public.building b where b.operator_id = v_operator;
  elsif v_role = 'admin' then
    return query
      select ba.building_id from public.building_assignment ba
      where ba.operator_id = v_operator and ba.user_id = v_user;
  end if;
end;
$$;

create function private.can_access_building(p_building_id uuid) returns boolean
language plpgsql stable security definer set search_path = ''
as $$
begin
  return exists (select 1 from private.accessible_building_ids() x where x = p_building_id);
end;
$$;

create function private.is_month_closed(p_building_id uuid, p_date date) returns boolean
language plpgsql stable security definer set search_path = ''
as $$
begin
  return exists (
    select 1 from public.month_close mc
    where mc.building_id = p_building_id
      and mc.month = date_trunc('month', p_date)::date
      and mc.status = 'closed');
end;
$$;

create function private.assert_month_open(p_building_id uuid, p_date date) returns void
language plpgsql stable security definer set search_path = ''
as $$
begin
  if private.is_month_closed(p_building_id, p_date) then
    raise exception using
      errcode = 'BK002', message = 'period_locked',
      detail = format('building %s, month %s is closed', p_building_id, to_char(p_date, 'YYYY-MM'));
  end if;
end;
$$;


-- =============================================================================
-- 3. Organization & users
-- =============================================================================

create table public.operator (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  kind                  public.operator_kind not null,
  business_reg_no       text,
  representative        text,
  address               text,
  phone                 text,
  logo_path             text,
  google_login_enabled  boolean not null default false,
  status                public.operator_status not null default 'active',
  created_at            timestamptz not null default now(),
  created_by            uuid not null default private.actor_id(),
  updated_at            timestamptz not null default now(),
  updated_by            uuid not null default private.actor_id()
);
comment on table public.operator is '운영사. The RLS boundary. Never deleted; kind (실운영/검증용) is immutable.';

create table public.user_account (
  id                  uuid primary key default gen_random_uuid(),
  auth_user_id        uuid unique references auth.users (id),
  email               text,
  name                text not null,
  company_name        text,
  phone               text,
  avatar_path         text,
  is_system_operator  boolean not null default false,
  active_operator_id  uuid references public.operator (id),
  status              public.account_status not null default 'active',
  last_login_at       timestamptz,
  created_at          timestamptz not null default now(),
  created_by          uuid not null default private.actor_id() references public.user_account (id),
  updated_at          timestamptz not null default now(),
  updated_by          uuid not null default private.actor_id() references public.user_account (id),
  constraint user_account_login_needs_email check (auth_user_id is null or email is not null)
);
comment on table public.user_account is '사용자 계정. Owners and tenant contacts have rows without auth_user_id (no login in Phase 1). Never deleted.';
create unique index user_account_email_key on public.user_account (lower(email)) where email is not null;

alter table public.operator
  add foreign key (created_by) references public.user_account (id),
  add foreign key (updated_by) references public.user_account (id);

create table public.operator_membership (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null references public.operator (id),
  user_id      uuid not null references public.user_account (id),
  role         public.member_role not null,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  created_by   uuid not null default private.actor_id() references public.user_account (id),
  updated_at   timestamptz not null default now(),
  updated_by   uuid not null default private.actor_id() references public.user_account (id),
  constraint operator_membership_operator_user_key unique (operator_id, user_id)
);
comment on table public.operator_membership is 'User × operator × role. A person may belong to several operators (§7.2.4).';
create unique index operator_membership_one_super_admin
  on public.operator_membership (operator_id) where role = 'super_admin' and is_active;
create index operator_membership_user_idx on public.operator_membership (user_id);


-- =============================================================================
-- 4. Assets
-- =============================================================================

create table public.building (
  id                           uuid primary key default gen_random_uuid(),
  operator_id                  uuid not null references public.operator (id),
  name                         text not null,
  alias                        text not null,
  building_type                public.building_type not null,
  address                      text not null,
  operating_status             public.building_operating_status not null default 'operating',
  operating_status_reason      text,
  operating_status_changed_at  timestamptz,
  built_on                     date,
  use_approved_on              date,
  thumbnail_path               text,
  gross_floor_area             numeric(12,2) check (gross_floor_area >= 0),
  leasable_area                numeric(12,2) check (leasable_area >= 0),
  parking_ground               smallint not null default 0 check (parking_ground >= 0),
  parking_underground          smallint not null default 0 check (parking_underground >= 0),
  parking_mechanical           smallint not null default 0 check (parking_mechanical >= 0),
  hvac_types                   public.hvac_type[] not null default '{}',
  rent_account_bank            text,
  rent_account_no              text,
  rent_account_holder          text,
  fee_account_bank             text,
  fee_account_no               text,
  fee_account_holder           text,
  lien_bank                    text,
  lien_branch                  text,
  lien_phone                   text,
  lien_max_amount              bigint check (lien_max_amount >= 0),
  lien_actual_amount           bigint check (lien_actual_amount >= 0),
  billing_month_ref            public.billing_month_ref not null,
  billing_day                  smallint not null check (billing_day between 1 and 28),
  due_month_ref                public.due_month_ref not null,
  due_day                      smallint check (due_day between 1 and 28),
  created_at                   timestamptz not null default now(),
  created_by                   uuid not null default private.actor_id() references public.user_account (id),
  updated_at                   timestamptz not null default now(),
  updated_by                   uuid not null default private.actor_id() references public.user_account (id),
  constraint building_operator_id_key unique (operator_id, id),
  constraint building_alias_key unique (operator_id, alias),
  -- due date (due_day NULL = last day of month) must fall after the billing date (§3.5)
  constraint building_due_after_billing check (
    (case due_month_ref when 'current' then 0 else 100 end) + coalesce(due_day, 99)
    > (case billing_month_ref when 'prev' then -100 else 0 end) + billing_day),
  constraint building_non_operating_needs_reason check (
    operating_status = 'operating' or operating_status_reason is not null)
);
comment on table public.building is '건물. billing_* = 청구일, due_* = 납부마감일 (one per building, §3.5).';
comment on column public.building.name is '건물고유이름';
comment on column public.building.alias is '건물별칭 (unique per operator; used in 계약고유이름)';
comment on column public.building.due_day is '납부마감일 day; NULL = 말일';

create table public.building_assignment (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null,
  building_id  uuid not null,
  user_id      uuid not null,
  created_at   timestamptz not null default now(),
  created_by   uuid not null default private.actor_id() references public.user_account (id),
  constraint building_assignment_key unique (building_id, user_id),
  foreign key (operator_id, building_id) references public.building (operator_id, id),
  foreign key (operator_id, user_id) references public.operator_membership (operator_id, user_id)
);
comment on table public.building_assignment is '관리자 담당 건물 = 건물관리자. Admin role only (checked by RPC).';
create index building_assignment_user_idx on public.building_assignment (user_id);

create table public.building_wing (
  id            uuid primary key default gen_random_uuid(),
  operator_id   uuid not null,
  building_id   uuid not null,
  name          text not null,
  floors_above  smallint not null default 0 check (floors_above >= 0),
  floors_below  smallint not null default 0 check (floors_below >= 0),
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  created_by    uuid not null default private.actor_id() references public.user_account (id),
  updated_at    timestamptz not null default now(),
  updated_by    uuid not null default private.actor_id() references public.user_account (id),
  constraint building_wing_name_key unique (building_id, name),
  foreign key (operator_id, building_id) references public.building (operator_id, id)
);
comment on table public.building_wing is '동 (at least one per building, checked by RPC).';

create table public.management_contract (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null,
  building_id  uuid not null unique,
  starts_on    date not null,
  ends_on      date not null,
  created_at   timestamptz not null default now(),
  created_by   uuid not null default private.actor_id() references public.user_account (id),
  updated_at   timestamptz not null default now(),
  updated_by   uuid not null default private.actor_id() references public.user_account (id),
  check (ends_on >= starts_on),
  foreign key (operator_id, building_id) references public.building (operator_id, id)
);
comment on table public.management_contract is '위탁운영계약 (0..1 per building). Fee / operating model deliberately absent (Phase 2).';

create table public.common_facility (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null,
  building_id  uuid not null,
  name         text not null,
  created_at   timestamptz not null default now(),
  created_by   uuid not null default private.actor_id() references public.user_account (id),
  constraint common_facility_name_key unique (building_id, name),
  foreign key (operator_id, building_id) references public.building (operator_id, id)
);
comment on table public.common_facility is '공용시설';

create table public.unit (
  id                    uuid primary key default gen_random_uuid(),
  operator_id           uuid not null,
  building_id           uuid not null,
  code                  text not null,
  usage                 public.unit_usage,
  floor                 text,
  leased_area           numeric(12,2) check (leased_area >= 0),
  exclusive_area        numeric(12,2) check (exclusive_area >= 0),
  non_operating_reason  public.non_operating_reason,
  memo                  text,
  sort_order            integer not null default 0,
  created_at            timestamptz not null default now(),
  created_by            uuid not null default private.actor_id() references public.user_account (id),
  updated_at            timestamptz not null default now(),
  updated_by            uuid not null default private.actor_id() references public.user_account (id),
  constraint unit_scope_key unique (operator_id, building_id, id),
  constraint unit_code_key unique (building_id, code),
  foreign key (operator_id, building_id) references public.building (operator_id, id)
);
comment on table public.unit is '유닛. Occupancy is derived (unit_status_v); only 비운영중 is stored, as non_operating_reason.';
comment on column public.unit.code is '유닛고유번호';
comment on column public.unit.sort_order is 'Tie-breaker for settlement rounding remainder (§4.1.8).';


-- =============================================================================
-- 5. Parties
-- =============================================================================

create table public.owner (
  id                uuid primary key default gen_random_uuid(),
  operator_id       uuid not null references public.operator (id),
  name              text not null,
  kind              public.owner_kind not null,
  trade_name        text,
  business_reg_no   text,
  representative    text,
  address           text,
  phone             text,
  email             text,
  user_account_id   uuid references public.user_account (id),
  created_at        timestamptz not null default now(),
  created_by        uuid not null default private.actor_id() references public.user_account (id),
  updated_at        timestamptz not null default now(),
  updated_by        uuid not null default private.actor_id() references public.user_account (id),
  constraint owner_operator_id_key unique (operator_id, id)
);
comment on table public.owner is '임대인. Visible operator-wide to admins (design D5).';
comment on column public.owner.business_reg_no is '사업자등록번호. Unique per operator when present (design D4); immutable.';
create unique index owner_reg_no_key on public.owner (operator_id, business_reg_no) where business_reg_no is not null;

create table public.building_ownership (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null,
  building_id  uuid not null,
  owner_id     uuid not null,
  share_pct    numeric(5,2) not null check (share_pct > 0 and share_pct <= 100),
  created_at   timestamptz not null default now(),
  created_by   uuid not null default private.actor_id() references public.user_account (id),
  updated_at   timestamptz not null default now(),
  updated_by   uuid not null default private.actor_id() references public.user_account (id),
  constraint building_ownership_key unique (building_id, owner_id),
  foreign key (operator_id, building_id) references public.building (operator_id, id),
  foreign key (operator_id, owner_id) references public.owner (operator_id, id)
);
comment on table public.building_ownership is '건물 소유 (지분 %). Shares total 100 per building (checked by RPC).';
create index building_ownership_owner_idx on public.building_ownership (owner_id);

create table public.tenant (
  id                uuid primary key default gen_random_uuid(),
  operator_id       uuid not null references public.operator (id),
  kind              public.tenant_kind not null,
  trade_name        text not null,
  business_reg_no   text not null,
  representative    text,
  address           text,
  business_type     text,
  business_item     text,
  combine_invoices  boolean not null default false,
  created_at        timestamptz not null default now(),
  created_by        uuid not null default private.actor_id() references public.user_account (id),
  updated_at        timestamptz not null default now(),
  updated_by        uuid not null default private.actor_id() references public.user_account (id),
  constraint tenant_operator_id_key unique (operator_id, id),
  constraint tenant_reg_no_key unique (operator_id, business_reg_no)
);
comment on table public.tenant is '임차인(사업자). Visible operator-wide to admins (design D5). No resident registration numbers.';
comment on column public.tenant.business_reg_no is '사업자등록번호. Unique per operator (design D4); immutable.';
comment on column public.tenant.combine_invoices is '청구서 합쳐 보내기';

create table public.tenant_payer_alias (
  id                uuid primary key default gen_random_uuid(),
  operator_id       uuid not null,
  tenant_id         uuid not null,
  alias_raw         text not null,
  alias_normalized  text not null,
  created_at        timestamptz not null default now(),
  created_by        uuid not null default private.actor_id() references public.user_account (id),
  constraint tenant_payer_alias_key unique (operator_id, alias_normalized),
  foreign key (operator_id, tenant_id) references public.tenant (operator_id, id)
);
comment on table public.tenant_payer_alias is '입금자명 별칭 (per business, §4.6.3). Unique per operator so auto-matching is never ambiguous.';
create index tenant_payer_alias_tenant_idx on public.tenant_payer_alias (tenant_id);

create table public.broker (
  id              uuid primary key default gen_random_uuid(),
  operator_id     uuid not null references public.operator (id),
  office_name     text not null,
  representative  text,
  reg_no          text not null,
  phone           text,
  address         text,
  created_at      timestamptz not null default now(),
  created_by      uuid not null default private.actor_id() references public.user_account (id),
  updated_at      timestamptz not null default now(),
  updated_by      uuid not null default private.actor_id() references public.user_account (id),
  constraint broker_operator_id_key unique (operator_id, id),
  constraint broker_reg_no_key unique (operator_id, reg_no)
);
comment on table public.broker is '중개사 (one row per office registration number, design D6).';


-- =============================================================================
-- 6. Charge configuration
-- =============================================================================

create table public.charge_item (
  id                 uuid primary key default gen_random_uuid(),
  operator_id        uuid not null,
  building_id        uuid not null,
  name               text not null,
  standard_code      public.standard_charge_code,
  calc_method        public.calc_method not null,
  issuance_doc       public.issuance_doc not null,
  recurrence         public.recurrence not null default 'monthly',
  priority           smallint not null check (priority between 1 and 99),
  allocation_basis   public.allocation_basis not null default 'area',
  reference_item_id  uuid,
  evidence_doc       public.evidence_doc not null default 'bill',
  issuer             text,
  is_active          boolean not null default true,
  created_at         timestamptz not null default now(),
  created_by         uuid not null default private.actor_id() references public.user_account (id),
  updated_at         timestamptz not null default now(),
  updated_by         uuid not null default private.actor_id() references public.user_account (id),
  constraint charge_item_scope_key unique (operator_id, building_id, id),
  constraint charge_item_name_key unique (building_id, name),
  constraint charge_item_priority_key unique (building_id, priority),
  constraint charge_item_standard_key unique (building_id, standard_code),
  -- 고정액 = rent and fixed management fee only; late fee has no method; everything else is 정산 (§3.2-2)
  constraint charge_item_calc_method check (case
    when standard_code in ('rent', 'fixed_mgmt_fee') then calc_method = 'fixed'
    when standard_code = 'late_fee' then calc_method = 'none'
    else calc_method = 'settlement' end),
  -- priority 99 is reserved for the late fee (§3.3)
  constraint charge_item_late_fee_priority check (coalesce(standard_code = 'late_fee', false) = (priority = 99)),
  constraint charge_item_reference_needs_usage check (reference_item_id is null or allocation_basis = 'usage'),
  constraint charge_item_reference_not_self check (reference_item_id is distinct from id),
  foreign key (operator_id, building_id) references public.building (operator_id, id)
);
alter table public.charge_item
  add foreign key (operator_id, building_id, reference_item_id)
  references public.charge_item (operator_id, building_id, id);
comment on table public.charge_item is '청구항목 = 건물 청구항목 설정 (per building, ≤ 99 by unique priority).';
comment on column public.charge_item.standard_code is '기준 항목 (19종). NULL = custom item. Cross-building aggregation uses this.';
comment on column public.charge_item.issuance_doc is '발행 문서. Decides VAT: tax_invoice 10%, others 0.';
comment on column public.charge_item.priority is '배분 우선순위 (1–98; 99 = 연체료)';
comment on column public.charge_item.reference_item_id is '참조 항목 (e.g. 전력기금 → 전기요금). Copies the referenced burden ratio.';

create table public.unit_meter_setting (
  operator_id                uuid not null,
  building_id                uuid not null,
  unit_id                    uuid not null,
  charge_item_id             uuid not null,
  has_meter                  boolean not null default false,
  meter_multiplier           numeric(10,4) not null default 1 check (meter_multiplier > 0),
  shares_meter_with_unit_id  uuid,
  created_at                 timestamptz not null default now(),
  created_by                 uuid not null default private.actor_id() references public.user_account (id),
  updated_at                 timestamptz not null default now(),
  updated_by                 uuid not null default private.actor_id() references public.user_account (id),
  primary key (unit_id, charge_item_id),
  constraint unit_meter_not_self check (shares_meter_with_unit_id is distinct from unit_id),
  constraint unit_meter_shared_has_no_meter check (not (has_meter and shares_meter_with_unit_id is not null)),
  foreign key (operator_id, building_id, unit_id) references public.unit (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id),
  foreign key (operator_id, building_id, shares_meter_with_unit_id) references public.unit (operator_id, building_id, id)
);
comment on table public.unit_meter_setting is '유닛 검침 설정. meter_multiplier = 계기배율 (physical; not the allocation multiplier).';


-- =============================================================================
-- 7. Contracts
--    Every child table carries building_id and references
--    contract (operator_id, building_id, id).
-- =============================================================================

create table public.contract (
  id                            uuid primary key default gen_random_uuid(),
  operator_id                   uuid not null,
  building_id                   uuid not null,
  unit_id                       uuid not null,
  tenant_id                     uuid not null,
  status                        public.contract_status not null default 'pending',
  contract_type                 public.contract_type not null,
  starts_on                     date not null,
  ends_on                       date not null,
  deposit_amount                bigint not null default 0 check (deposit_amount >= 0),
  deposit_return_due_on         date,
  refund_bank                   text,
  refund_account_no             text,
  refund_account_holder         text,
  free_parking_slots            smallint not null default 0 check (free_parking_slots >= 0),
  late_fee_rate                 numeric(5,2) not null default 8.00 check (late_fee_rate >= 0),
  has_rent_free                 boolean not null,
  rent_free_ends_on             date,
  previous_contract_id          uuid unique,
  settlement_payer_contract_id  uuid,
  broker_id                     uuid,
  broker_commission_rate        numeric(5,2) check (broker_commission_rate >= 0),
  termination_type              public.termination_type,
  terminated_on                 date,
  termination_reason            text,
  penalty_amount                bigint check (penalty_amount >= 0),
  restoration_cost              bigint check (restoration_cost >= 0),
  memo                          text,
  created_at                    timestamptz not null default now(),
  created_by                    uuid not null default private.actor_id() references public.user_account (id),
  updated_at                    timestamptz not null default now(),
  updated_by                    uuid not null default private.actor_id() references public.user_account (id),
  constraint contract_operator_id_key unique (operator_id, id),
  constraint contract_scope_key unique (operator_id, building_id, id),
  constraint contract_period check (ends_on >= starts_on),
  constraint contract_rent_free check (has_rent_free = (rent_free_ends_on is not null)),
  constraint contract_rent_free_after_start check (rent_free_ends_on is null or rent_free_ends_on >= starts_on),
  constraint contract_payer_not_self check (settlement_payer_contract_id is distinct from id),
  constraint contract_previous_not_self check (previous_contract_id is distinct from id),
  constraint contract_termination check ((termination_type is null) = (terminated_on is null)),
  foreign key (operator_id, building_id, unit_id) references public.unit (operator_id, building_id, id),
  foreign key (operator_id, tenant_id) references public.tenant (operator_id, id),
  foreign key (operator_id, broker_id) references public.broker (operator_id, id)
);
alter table public.contract
  add foreign key (operator_id, building_id, previous_contract_id)
    references public.contract (operator_id, building_id, id),
  add foreign key (operator_id, building_id, settlement_payer_contract_id)
    references public.contract (operator_id, building_id, id);
comment on table public.contract is '계약. One unit per contract; unit_id immutable. 계약고유이름 is derived (contract_display_name_v).';
comment on column public.contract.previous_contract_id is '기존 계약 (renewal link)';
comment on column public.contract.settlement_payer_contract_id is '정산액 대납 계약 (same building)';
comment on column public.contract.late_fee_rate is '연체이자율, annual %';
create unique index contract_one_active_per_unit on public.contract (unit_id) where status = 'active';
create index contract_tenant_idx on public.contract (tenant_id);
create index contract_building_status_idx on public.contract (building_id, status);

create table public.contract_rent_free_item (
  operator_id     uuid not null,
  building_id     uuid not null,
  contract_id     uuid not null,
  charge_item_id  uuid not null,
  created_at      timestamptz not null default now(),
  created_by      uuid not null default private.actor_id() references public.user_account (id),
  primary key (contract_id, charge_item_id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id)
);
comment on table public.contract_rent_free_item is '렌트프리 대상 항목';

create table public.contract_signatory (
  contract_id      uuid primary key,
  operator_id      uuid not null,
  building_id      uuid not null,
  trade_name       text,
  business_reg_no  text,
  representative   text,
  phone            text,
  email            text,
  address          text,
  created_at       timestamptz not null default now(),
  created_by       uuid not null default private.actor_id() references public.user_account (id),
  updated_at       timestamptz not null default now(),
  updated_by       uuid not null default private.actor_id() references public.user_account (id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.contract_signatory is '계약자 (0..1 per contract)';

create table public.contract_agent (
  contract_id  uuid primary key,
  operator_id  uuid not null,
  building_id  uuid not null,
  name         text not null,
  phone        text,
  email        text,
  address      text,
  created_at   timestamptz not null default now(),
  created_by   uuid not null default private.actor_id() references public.user_account (id),
  updated_at   timestamptz not null default now(),
  updated_by   uuid not null default private.actor_id() references public.user_account (id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.contract_agent is '대리인 (0..1 per contract)';

create table public.contract_contact (
  id               uuid primary key default gen_random_uuid(),
  operator_id      uuid not null,
  building_id      uuid not null,
  contract_id      uuid not null,
  name             text not null,
  title            text not null,
  phone            text not null,
  email            text not null,
  is_primary       boolean not null default false,
  user_account_id  uuid references public.user_account (id),
  masked_at        timestamptz,
  created_at       timestamptz not null default now(),
  created_by       uuid not null default private.actor_id() references public.user_account (id),
  updated_at       timestamptz not null default now(),
  updated_by       uuid not null default private.actor_id() references public.user_account (id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.contract_contact is '담당자 (per contract). Personal data: building-scoped; masked in place 5 years after contract end (§7.6.3).';
create unique index contract_contact_one_primary on public.contract_contact (contract_id) where is_primary;
create index contract_contact_contract_idx on public.contract_contact (contract_id);

create table public.contract_hvac_unit (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null,
  building_id  uuid not null,
  contract_id  uuid not null,
  kind         text not null,
  quantity     smallint not null check (quantity > 0),
  ownership    public.hvac_ownership not null,
  memo         text,
  created_at   timestamptz not null default now(),
  created_by   uuid not null default private.actor_id() references public.user_account (id),
  updated_at   timestamptz not null default now(),
  updated_by   uuid not null default private.actor_id() references public.user_account (id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.contract_hvac_unit is '냉난방기 (basis for removal / restoration on move-out)';
create index contract_hvac_unit_contract_idx on public.contract_hvac_unit (contract_id);

create table public.vehicle (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null,
  building_id  uuid not null,
  contract_id  uuid not null,
  plate_no     text not null,
  owner_name   text not null,
  owner_phone  text not null,
  model        text,
  parking_type public.parking_type,
  fee_type     public.parking_fee_type not null,
  released_at  timestamptz,
  created_at   timestamptz not null default now(),
  created_by   uuid not null default private.actor_id() references public.user_account (id),
  updated_at   timestamptz not null default now(),
  updated_by   uuid not null default private.actor_id() references public.user_account (id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.vehicle is '등록 차량. Plate unique per building among unreleased vehicles.';
create unique index vehicle_plate_key on public.vehicle (building_id, plate_no) where released_at is null;
create index vehicle_contract_idx on public.vehicle (contract_id);

create table public.rent_change_schedule (
  id                     uuid primary key default gen_random_uuid(),
  operator_id            uuid not null,
  building_id            uuid not null,
  contract_id            uuid not null,
  effective_on           date not null,
  new_rent_amount        bigint check (new_rent_amount >= 0),
  new_fixed_fee_amount   bigint check (new_fixed_fee_amount >= 0),
  memo                   text,
  status                 public.rent_change_status not null default 'scheduled',
  prev_rent_amount       bigint,
  prev_fixed_fee_amount  bigint,
  applied_at             timestamptz,
  created_at             timestamptz not null default now(),
  created_by             uuid not null default private.actor_id() references public.user_account (id),
  updated_at             timestamptz not null default now(),
  updated_by             uuid not null default private.actor_id() references public.user_account (id),
  constraint rent_change_key unique (contract_id, effective_on),
  constraint rent_change_has_amount check (new_rent_amount is not null or new_fixed_fee_amount is not null),
  constraint rent_change_applied check ((status = 'applied') = (applied_at is not null)),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.rent_change_schedule is '임대료 인상 예약. Amounts VAT-inclusive; NULL = unchanged. Invoice calculator must read scheduled rows inside the billing period, applied or not.';

create table public.recurring_charge (
  id                 uuid primary key default gen_random_uuid(),
  operator_id        uuid not null,
  building_id        uuid not null,
  contract_id        uuid not null,
  charge_item_id     uuid not null,
  amount_incl_vat    bigint not null check (amount_incl_vat >= 0),
  recurrence         public.recurrence not null default 'monthly',
  billing_starts_on  date not null,
  memo               text,
  created_at         timestamptz not null default now(),
  created_by         uuid not null default private.actor_id() references public.user_account (id),
  updated_at         timestamptz not null default now(),
  updated_by         uuid not null default private.actor_id() references public.user_account (id),
  constraint recurring_charge_scope_key unique (operator_id, contract_id, id),
  constraint recurring_charge_key unique (contract_id, charge_item_id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id)
);
comment on table public.recurring_charge is '청구 약정. Fixed-method items only (rent, fixed management fee). 0 = not billed.';
comment on column public.recurring_charge.amount_incl_vat is '약정액 (부가세 포함)';
comment on column public.recurring_charge.billing_starts_on is '기산일';


-- =============================================================================
-- 8. History (이력) — append-only
-- =============================================================================

create table public.history_header (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null references public.operator (id),
  building_id  uuid,
  occurred_at  timestamptz not null default now(),
  target_type  public.history_target not null,
  target_id    uuid not null,
  target_name  text not null,
  change_type  public.history_change not null,
  actor_id     uuid not null references public.user_account (id),
  reason       text,
  constraint history_header_operator_id_key unique (operator_id, id),
  foreign key (operator_id, building_id) references public.building (operator_id, id)
);
comment on table public.history_header is '이력 헤더. target_name is a snapshot (survives target deletion). Append-only.';
create index history_header_list_idx on public.history_header (operator_id, occurred_at desc);
create index history_header_target_idx on public.history_header (target_type, target_id);

create table public.history_detail (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null,
  building_id  uuid,
  header_id    uuid not null,
  field_label  text not null,
  before_text  text,
  after_text   text,
  foreign key (operator_id, header_id) references public.history_header (operator_id, id)
);
comment on table public.history_detail is '이력 상세. Values are display strings. Append-only.';
create index history_detail_header_idx on public.history_detail (header_id);

create table public.history_deletion (
  id           uuid primary key default gen_random_uuid(),
  operator_id  uuid not null,
  building_id  uuid,
  history_id   uuid not null unique,
  deleted_by   uuid not null default private.actor_id() references public.user_account (id),
  deleted_at   timestamptz not null default now(),
  reason       text not null check (btrim(reason) <> ''),
  foreign key (operator_id, history_id) references public.history_header (operator_id, id)
);
comment on table public.history_deletion is '이력 삭제 기록. Hides a history row from lists without deleting it. Super admin only.';


-- =============================================================================
-- 9. Month close (월 마감)
-- =============================================================================

create table public.month_close (
  id             uuid primary key default gen_random_uuid(),
  operator_id    uuid not null,
  building_id    uuid not null,
  month          date not null check (extract(day from month) = 1),
  status         public.close_status not null default 'closed',
  closed_at      timestamptz not null default now(),
  closed_by      uuid not null default private.actor_id() references public.user_account (id),
  cancelled_at   timestamptz,
  cancelled_by   uuid references public.user_account (id),
  cancel_reason  text,
  constraint month_close_scope_key unique (operator_id, building_id, id),
  constraint month_close_cancel check (
    (status = 'cancelled') = (cancelled_at is not null and cancelled_by is not null and cancel_reason is not null)),
  foreign key (operator_id, building_id) references public.building (operator_id, id)
);
comment on table public.month_close is '월 마감 (building × month). Close/cancel cycles are all kept; one closed row at a time.';
create unique index month_close_one_closed on public.month_close (building_id, month) where status = 'closed';


-- =============================================================================
-- 10. Settlement (관리비 정산, PAY-10)
-- =============================================================================

create table public.settlement_round (
  id            uuid primary key default gen_random_uuid(),
  operator_id   uuid not null,
  building_id   uuid not null,
  month         date not null check (extract(day from month) = 1),
  status        public.settlement_status not null default 'draft',
  confirmed_at  timestamptz,
  confirmed_by  uuid references public.user_account (id),
  created_at    timestamptz not null default now(),
  created_by    uuid not null default private.actor_id() references public.user_account (id),
  updated_at    timestamptz not null default now(),
  updated_by    uuid not null default private.actor_id() references public.user_account (id),
  constraint settlement_round_scope_key unique (operator_id, building_id, id),
  constraint settlement_round_key unique (building_id, month),
  constraint settlement_round_confirmed check (
    (status = 'confirmed') = (confirmed_at is not null and confirmed_by is not null)),
  foreign key (operator_id, building_id) references public.building (operator_id, id)
);
comment on table public.settlement_round is '정산 회차 (building × month). Back to draft only while no invoice line uses its results.';

create table public.settlement_round_item (
  id              uuid primary key default gen_random_uuid(),
  operator_id     uuid not null,
  building_id     uuid not null,
  round_id        uuid not null,
  charge_item_id  uuid not null,
  saved_at        timestamptz,
  saved_by        uuid references public.user_account (id),
  created_at      timestamptz not null default now(),
  created_by      uuid not null default private.actor_id() references public.user_account (id),
  constraint settlement_round_item_key unique (round_id, charge_item_id),
  foreign key (operator_id, building_id, round_id) references public.settlement_round (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id)
);
comment on table public.settlement_round_item is '회차 청구항목. saved_at drives the ✓ on each tab. No rows → round skipped.';

create table public.utility_bill (
  id              uuid primary key default gen_random_uuid(),
  operator_id     uuid not null,
  building_id     uuid not null,
  round_id        uuid not null,
  charge_item_id  uuid not null,
  period_start    date not null,
  period_end      date not null,
  total_usage     numeric(16,4) check (total_usage >= 0),
  supply_amount   bigint not null check (supply_amount >= 0),
  vat_amount      bigint not null check (vat_amount >= 0),
  created_at      timestamptz not null default now(),
  created_by      uuid not null default private.actor_id() references public.user_account (id),
  updated_at      timestamptz not null default now(),
  updated_by      uuid not null default private.actor_id() references public.user_account (id),
  constraint utility_bill_key unique (round_id, charge_item_id),
  constraint utility_bill_period check (period_end >= period_start),
  foreign key (operator_id, building_id, round_id) references public.settlement_round (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id)
);
comment on table public.utility_bill is '고지서. Total amount is derived. total_usage NULL for items without usage.';

create table public.meter_reading (
  id              uuid primary key default gen_random_uuid(),
  operator_id     uuid not null,
  building_id     uuid not null,
  unit_id         uuid not null,
  charge_item_id  uuid not null,
  round_id        uuid,
  reading_date    date not null,
  value           numeric(16,4) not null check (value >= 0),
  created_at      timestamptz not null default now(),
  created_by      uuid not null default private.actor_id() references public.user_account (id),
  foreign key (operator_id, building_id, unit_id) references public.unit (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id),
  foreign key (operator_id, building_id, round_id) references public.settlement_round (operator_id, building_id, id)
);
comment on table public.meter_reading is '검침 기록. Append-only original. Effective value = latest row per (round, unit, item); round NULL = baseline.';
create index meter_reading_lookup_idx on public.meter_reading (unit_id, charge_item_id, round_id, created_at desc);

create table public.allocation_adjustment (
  id              uuid primary key default gen_random_uuid(),
  operator_id     uuid not null,
  building_id     uuid not null,
  round_id        uuid not null,
  unit_id         uuid not null,
  charge_item_id  uuid not null,
  multiplier      numeric(10,4) not null check (multiplier >= 0),
  created_at      timestamptz not null default now(),
  created_by      uuid not null default private.actor_id() references public.user_account (id),
  foreign key (operator_id, building_id, round_id) references public.settlement_round (operator_id, building_id, id),
  foreign key (operator_id, building_id, unit_id) references public.unit (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id)
);
comment on table public.allocation_adjustment is '조정 기록 (배분배율). Append-only; latest row wins; 1.0 = released; 0 = pays no common share.';
create index allocation_adjustment_lookup_idx on public.allocation_adjustment (round_id, unit_id, charge_item_id, created_at desc);

create table public.manual_settlement_amount (
  id              uuid primary key default gen_random_uuid(),
  operator_id     uuid not null,
  building_id     uuid not null,
  round_id        uuid not null,
  charge_item_id  uuid not null,
  contract_id     uuid not null,
  supply_amount   bigint not null check (supply_amount >= 0),
  note            text,
  created_at      timestamptz not null default now(),
  created_by      uuid not null default private.actor_id() references public.user_account (id),
  updated_at      timestamptz not null default now(),
  updated_by      uuid not null default private.actor_id() references public.user_account (id),
  constraint manual_settlement_amount_key unique (round_id, charge_item_id, contract_id),
  foreign key (operator_id, building_id, round_id) references public.settlement_round (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.manual_settlement_amount is '직접 입력 금액 (allocation basis = manual, §4.1.3-2). Supply amount.';

create table public.proration_override (
  id               uuid primary key default gen_random_uuid(),
  operator_id      uuid not null,
  building_id      uuid not null,
  round_id         uuid not null,
  charge_item_id   uuid not null,
  contract_id      uuid not null,
  apply_start      date not null,
  apply_end        date not null,
  adjusted_supply  bigint check (adjusted_supply >= 0),
  adjusted_vat     bigint check (adjusted_vat >= 0),
  reason           text not null,
  created_at       timestamptz not null default now(),
  created_by       uuid not null default private.actor_id() references public.user_account (id),
  updated_at       timestamptz not null default now(),
  updated_by       uuid not null default private.actor_id() references public.user_account (id),
  constraint proration_override_key unique (round_id, charge_item_id, contract_id),
  constraint proration_override_period check (apply_end >= apply_start),
  constraint proration_override_amounts check ((adjusted_supply is null) = (adjusted_vat is null)),
  foreign key (operator_id, building_id, round_id) references public.settlement_round (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.proration_override is '일할 계산 (§4.1.9). Adjusted amounts NULL = use calculated value.';

create table public.settlement_result (
  id                      uuid primary key default gen_random_uuid(),
  operator_id             uuid not null,
  building_id             uuid not null,
  round_id                uuid not null,
  unit_id                 uuid not null,
  charge_item_id          uuid not null,
  contract_id             uuid,
  payer_contract_id       uuid,
  individual_usage        numeric(16,4) not null default 0 check (individual_usage >= 0),
  multiplier              numeric(10,4) not null check (multiplier >= 0),
  common_usage            numeric(16,4) not null default 0 check (common_usage >= 0),
  burden_ratio            numeric(20,12) not null check (burden_ratio >= 0),
  supply_amount           bigint not null check (supply_amount >= 0),
  vat_amount              bigint not null check (vat_amount >= 0),
  residual_supply         bigint not null default 0 check (residual_supply >= 0),
  residual_vat            bigint not null default 0 check (residual_vat >= 0),
  landlord_burden_supply  bigint not null default 0 check (landlord_burden_supply >= 0),
  landlord_burden_vat     bigint not null default 0 check (landlord_burden_vat >= 0),
  manual_amount           bigint check (manual_amount >= 0),
  manual_reason           text,
  is_vacant               boolean not null,
  config_snapshot         jsonb not null,
  created_at              timestamptz not null default now(),
  created_by              uuid not null default private.actor_id() references public.user_account (id),
  constraint settlement_result_scope_key unique (operator_id, building_id, id),
  constraint settlement_result_key unique (round_id, unit_id, charge_item_id),
  constraint settlement_result_manual check ((manual_amount is null) = (manual_reason is null)),
  constraint settlement_result_vacant check (not is_vacant or contract_id is null),
  foreign key (operator_id, building_id, round_id) references public.settlement_round (operator_id, building_id, id),
  foreign key (operator_id, building_id, unit_id) references public.unit (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, building_id, payer_contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.settlement_result is '산출 결과. Written only by confirm_settlement; never updated; deleted only when a round returns to draft.';
comment on column public.settlement_result.payer_contract_id is 'Resolved at confirmation from 정산액 대납 계약 (who was actually charged).';
comment on column public.settlement_result.config_snapshot is 'Basis, leased area, meter multiplier, shared-meter partner, reference item at confirmation.';


-- =============================================================================
-- 11. Invoices (청구서 · 청구 건 · 추가 청구)
-- =============================================================================

create table public.invoice (
  id                   uuid primary key default gen_random_uuid(),
  operator_id          uuid not null,
  building_id          uuid not null,
  contract_id          uuid not null,
  billing_month        date not null check (extract(day from billing_month) = 1),
  kind                 public.invoice_kind not null default 'regular',
  status               public.invoice_status not null default 'valid',
  issued_on            date not null,
  billing_date         date not null,
  due_date             date not null,
  original_invoice_id  uuid,
  email_requested      boolean not null default false,
  cancelled_at         timestamptz,
  cancelled_by         uuid references public.user_account (id),
  cancel_reason        text,
  created_at           timestamptz not null default now(),
  created_by           uuid not null default private.actor_id() references public.user_account (id),
  updated_at           timestamptz not null default now(),
  updated_by           uuid not null default private.actor_id() references public.user_account (id),
  constraint invoice_scope_key unique (operator_id, contract_id, id),
  constraint invoice_dates check (due_date >= billing_date),
  constraint invoice_cancel check (
    (status = 'cancelled') = (cancelled_at is not null and cancelled_by is not null and cancel_reason is not null)),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id)
);
alter table public.invoice
  add foreign key (operator_id, contract_id, original_invoice_id)
  references public.invoice (operator_id, contract_id, id);
comment on table public.invoice is '청구서 (contract × billing month). billing_date / due_date are frozen at issue (§3.5).';
-- Also makes batch issuance idempotent: a resumed batch cannot issue twice (§7.9.2).
create unique index invoice_one_valid_per_month
  on public.invoice (contract_id, billing_month) where status = 'valid' and kind <> 'late_fee';
create index invoice_building_month_idx on public.invoice (building_id, billing_month);

create table public.invoice_line (
  id                        uuid primary key default gen_random_uuid(),
  operator_id               uuid not null,
  building_id               uuid not null,
  invoice_id                uuid not null,
  contract_id               uuid not null,
  charge_item_id            uuid,
  name                      text not null,
  priority                  smallint not null check (priority between 1 and 99),
  issuance_doc              public.issuance_doc not null,
  source                    public.line_source not null,
  recurring_charge_id       uuid,
  settlement_result_id      uuid,
  adhoc_charge_id           uuid,
  proxy_source_contract_id  uuid,
  proration_days            smallint,
  proration_total_days      smallint,
  supply_amount             bigint not null check (supply_amount >= 0),
  vat_amount                bigint not null check (vat_amount >= 0),
  total_amount              bigint not null,
  rounding_cut              bigint check (rounding_cut >= 0),
  manual_reason             text,
  created_at                timestamptz not null default now(),
  created_by                uuid not null default private.actor_id() references public.user_account (id),
  constraint invoice_line_scope_key unique (operator_id, contract_id, id),
  constraint invoice_line_total check (total_amount = supply_amount + vat_amount),
  constraint invoice_line_vat check (issuance_doc = 'tax_invoice' or vat_amount = 0),
  constraint invoice_line_proration check (
    (proration_days is null) = (proration_total_days is null)
    and (proration_days is null or proration_days between 1 and proration_total_days)),
  constraint invoice_line_source_fixed check (source not in ('fixed', 'prorated') or recurring_charge_id is not null),
  constraint invoice_line_source_settlement check (source <> 'settlement' or settlement_result_id is not null),
  constraint invoice_line_source_adhoc check (source <> 'adhoc' or adhoc_charge_id is not null),
  constraint invoice_line_source_manual check (source <> 'manual' or manual_reason is not null),
  constraint invoice_line_proxy_not_self check (proxy_source_contract_id is distinct from contract_id),
  foreign key (operator_id, contract_id, invoice_id) references public.invoice (operator_id, contract_id, id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id),
  foreign key (operator_id, contract_id, recurring_charge_id) references public.recurring_charge (operator_id, contract_id, id),
  foreign key (operator_id, building_id, settlement_result_id) references public.settlement_result (operator_id, building_id, id),
  foreign key (operator_id, building_id, proxy_source_contract_id) references public.contract (operator_id, building_id, id)
);
comment on table public.invoice_line is '청구 건 (ledger unit). name / priority / issuance_doc are snapshots (design D10). Append-only.';
comment on column public.invoice_line.proxy_source_contract_id is '대납 출처 계약';
comment on column public.invoice_line.rounding_cut is '단수 절사액. NULL until the §4.7 rounding decision.';
create index invoice_line_invoice_idx on public.invoice_line (invoice_id);
create index invoice_line_contract_idx on public.invoice_line (contract_id);
create index invoice_line_settlement_result_idx on public.invoice_line (settlement_result_id) where settlement_result_id is not null;

create table public.adhoc_charge (
  id                uuid primary key default gen_random_uuid(),
  operator_id       uuid not null,
  building_id       uuid not null,
  contract_id       uuid not null,
  original_line_id  uuid,
  charge_item_id    uuid,
  name              text not null,
  issuance_doc      public.issuance_doc not null,
  amount_incl_vat   bigint not null check (amount_incl_vat > 0),
  reason            text not null check (btrim(reason) <> ''),
  created_at        timestamptz not null default now(),
  created_by        uuid not null default private.actor_id() references public.user_account (id),
  updated_at        timestamptz not null default now(),
  updated_by        uuid not null default private.actor_id() references public.user_account (id),
  constraint adhoc_charge_scope_key unique (operator_id, contract_id, id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, contract_id, original_line_id) references public.invoice_line (operator_id, contract_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id)
);
comment on table public.adhoc_charge is '추가 청구. "Placed" is derived: a line on a valid invoice references it. Deletable only while unplaced.';
create index adhoc_charge_contract_idx on public.adhoc_charge (contract_id);

alter table public.invoice_line
  add foreign key (operator_id, contract_id, adhoc_charge_id)
  references public.adhoc_charge (operator_id, contract_id, id);
create index invoice_line_adhoc_idx on public.invoice_line (adhoc_charge_id) where adhoc_charge_id is not null;


-- =============================================================================
-- 12. Bank import (은행 거래내역, PAY-13)
-- =============================================================================

create table public.bank_column_mapping (
  id            uuid primary key default gen_random_uuid(),
  operator_id   uuid not null references public.operator (id),
  bank_name     text not null,
  col_txn_at    text not null,
  col_txn_type  text,
  col_payer     text not null,
  col_amount    text not null,
  created_at    timestamptz not null default now(),
  created_by    uuid not null default private.actor_id() references public.user_account (id),
  updated_at    timestamptz not null default now(),
  updated_by    uuid not null default private.actor_id() references public.user_account (id),
  constraint bank_column_mapping_key unique (operator_id, bank_name)
);
comment on table public.bank_column_mapping is '컬럼 매핑 (by column name, per bank).';

create table public.bank_import (
  id                 uuid primary key default gen_random_uuid(),
  operator_id        uuid not null,
  building_id        uuid not null,
  bank_name          text not null,
  file_path          text,
  original_filename  text not null,
  uploaded_at        timestamptz not null default now(),
  uploaded_by        uuid not null default private.actor_id() references public.user_account (id),
  purged_at          timestamptz,
  constraint bank_import_scope_key unique (operator_id, building_id, id),
  constraint bank_import_purged check (purged_at is null or file_path is null),
  foreign key (operator_id, building_id) references public.building (operator_id, id)
);
comment on table public.bank_import is '은행 거래내역 업로드. File deleted after 90 days (§7.6.2); row kept.';

create table public.bank_import_row (
  id                 uuid primary key default gen_random_uuid(),
  operator_id        uuid not null,
  building_id        uuid not null,
  bank_import_id     uuid not null,
  txn_at             timestamptz not null,
  txn_type_text      text,
  payer_raw          text not null,
  payer_normalized   text not null,
  amount             bigint not null check (amount > 0),
  duplicate_seq      smallint not null default 0 check (duplicate_seq >= 0),
  status             public.bank_row_status not null,
  matched_tenant_id  uuid,
  needs_review       boolean not null default false,
  created_at         timestamptz not null default now(),
  created_by         uuid not null default private.actor_id() references public.user_account (id),
  updated_at         timestamptz not null default now(),
  updated_by         uuid not null default private.actor_id() references public.user_account (id),
  constraint bank_import_row_scope_key unique (operator_id, building_id, id),
  -- Dedupe across overlapping uploads (design D9). Identical rows inside one file
  -- get duplicate_seq 1, 2, … and needs_review = true.
  constraint bank_import_row_dedupe_key unique (building_id, txn_at, amount, payer_raw, duplicate_seq),
  constraint bank_import_row_matched check (status not in ('auto_matched', 'confirmed') or matched_tenant_id is not null),
  foreign key (operator_id, building_id, bank_import_id) references public.bank_import (operator_id, building_id, id),
  foreign key (operator_id, matched_tenant_id) references public.tenant (operator_id, id)
);
comment on table public.bank_import_row is '거래 행 (deposits only, amount > 0).';
create index bank_import_row_import_idx on public.bank_import_row (bank_import_id);
create index bank_import_row_status_idx on public.bank_import_row (building_id, status);


-- =============================================================================
-- 13. Payments (입금 · 이월 · 수납 배분 · 환불 · 연체료 정리)
-- =============================================================================

create table public.deposit (
  id                  uuid primary key default gen_random_uuid(),
  operator_id         uuid not null,
  building_id         uuid not null,
  tenant_id           uuid not null,
  deposited_at        timestamptz not null,
  amount              bigint not null check (amount > 0),
  method              public.payment_method not null,
  payer_name          text,
  memo                text,
  match_basis         public.match_basis,
  external_txn_no     text,
  reg_method          public.deposit_reg_method not null,
  registered_by       uuid not null default private.actor_id() references public.user_account (id),
  status              public.deposit_status not null default 'valid',
  voided_at           timestamptz,
  voided_by           uuid references public.user_account (id),
  void_reason         text,
  bank_import_row_id  uuid unique,
  created_at          timestamptz not null default now(),
  created_by          uuid not null default private.actor_id() references public.user_account (id),
  updated_at          timestamptz not null default now(),
  updated_by          uuid not null default private.actor_id() references public.user_account (id),
  constraint deposit_scope_key unique (operator_id, building_id, id),
  constraint deposit_void check (
    (status = 'void') = (voided_at is not null and voided_by is not null and void_reason is not null)),
  constraint deposit_bank_row check ((reg_method = 'bank_match') = (bank_import_row_id is not null)),
  foreign key (operator_id, building_id) references public.building (operator_id, id),
  foreign key (operator_id, tenant_id) references public.tenant (operator_id, id),
  foreign key (operator_id, building_id, bank_import_row_id) references public.bank_import_row (operator_id, building_id, id)
);
comment on table public.deposit is '입금. Belongs to the tenant (business), not a contract. amount / reg_method / registered_by immutable.';
create unique index deposit_external_txn_no_key on public.deposit (external_txn_no) where external_txn_no is not null;
create index deposit_tenant_idx on public.deposit (tenant_id, deposited_at);
create index deposit_building_idx on public.deposit (building_id, deposited_at);

create table public.carryover (
  id              uuid primary key default gen_random_uuid(),
  operator_id     uuid not null,
  building_id     uuid not null,
  contract_id     uuid not null,
  month_close_id  uuid not null,
  closed_month    date not null check (extract(day from closed_month) = 1),
  amount          bigint not null check (amount <> 0),
  status          public.carryover_status not null default 'valid',
  cancelled_at    timestamptz,
  created_at      timestamptz not null default now(),
  created_by      uuid not null default private.actor_id() references public.user_account (id),
  constraint carryover_scope_key unique (operator_id, contract_id, id),
  constraint carryover_cancel check ((status = 'cancelled') = (cancelled_at is not null)),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, building_id, month_close_id) references public.month_close (operator_id, building_id, id)
);
comment on table public.carryover is '전월 잔액 이월. amount > 0 = 전월 미납액, < 0 = 전월 과납액. No ledger entry (§4.3.6).';
create unique index carryover_one_valid on public.carryover (contract_id, closed_month) where status = 'valid';

create table public.carryover_bucket (
  id            uuid primary key default gen_random_uuid(),
  operator_id   uuid not null,
  building_id   uuid not null,
  contract_id   uuid not null,
  carryover_id  uuid not null,
  origin_month  date not null check (extract(day from origin_month) = 1),
  amount        bigint not null check (amount > 0),
  created_at    timestamptz not null default now(),
  created_by    uuid not null default private.actor_id() references public.user_account (id),
  constraint carryover_bucket_key unique (carryover_id, origin_month),
  foreign key (operator_id, contract_id, carryover_id) references public.carryover (operator_id, contract_id, id)
);
comment on table public.carryover_bucket is '생긴 달별 금액 (late-fee basis, §4.4). Append-only; payments reduce oldest buckets first (computed).';

create table public.payment_allocation (
  id                      uuid primary key default gen_random_uuid(),
  operator_id             uuid not null,
  building_id             uuid not null,
  deposit_id              uuid not null,
  contract_id             uuid not null,
  invoice_line_id         uuid,
  carryover_id            uuid,
  overpaid_month          date check (extract(day from overpaid_month) = 1),
  amount                  bigint not null check (amount > 0),
  status                  public.allocation_status not null default 'valid',
  replaces_allocation_id  uuid,
  status_changed_at       timestamptz,
  status_changed_by       uuid references public.user_account (id),
  created_at              timestamptz not null default now(),
  created_by              uuid not null default private.actor_id() references public.user_account (id),
  constraint payment_allocation_scope_key unique (operator_id, contract_id, id),
  constraint payment_allocation_one_target check (num_nonnulls(invoice_line_id, carryover_id) <= 1),
  -- no target = overpayment (과납), attributed to the billing month whose bill it exceeded
  constraint payment_allocation_overpaid_month check (
    (num_nonnulls(invoice_line_id, carryover_id) = 0) = (overpaid_month is not null)),
  constraint payment_allocation_status_change check ((status = 'valid') = (status_changed_at is null)),
  foreign key (operator_id, building_id, deposit_id) references public.deposit (operator_id, building_id, id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, contract_id, invoice_line_id) references public.invoice_line (operator_id, contract_id, id),
  foreign key (operator_id, contract_id, carryover_id) references public.carryover (operator_id, contract_id, id)
);
alter table public.payment_allocation
  add foreign key (operator_id, contract_id, replaces_allocation_id)
  references public.payment_allocation (operator_id, contract_id, id);
comment on table public.payment_allocation is '수납 배분. Valid allocations of a valid deposit sum to its amount (deferred check). Moves = status moved + replacement rows.';
create index payment_allocation_deposit_idx on public.payment_allocation (deposit_id);
create index payment_allocation_line_idx on public.payment_allocation (invoice_line_id) where invoice_line_id is not null;
create index payment_allocation_carryover_idx on public.payment_allocation (carryover_id) where carryover_id is not null;
create index payment_allocation_contract_idx on public.payment_allocation (contract_id);

create table public.refund (
  id                  uuid primary key default gen_random_uuid(),
  operator_id         uuid not null,
  building_id         uuid not null,
  kind                public.refund_kind not null,
  contract_id         uuid,
  bank_import_row_id  uuid,
  amount              bigint not null check (amount > 0),
  sent_on             date not null,
  bank                text not null,
  account_no          text not null,
  account_holder      text not null,
  processed_by        uuid not null default private.actor_id() references public.user_account (id),
  memo                text,
  created_at          timestamptz not null default now(),
  created_by          uuid not null default private.actor_id() references public.user_account (id),
  constraint refund_scope_key unique (operator_id, contract_id, id),
  constraint refund_overpayment check ((kind = 'overpayment') = (contract_id is not null)),
  constraint refund_misdeposit check ((kind = 'misdeposit') = (bank_import_row_id is not null)),
  foreign key (operator_id, building_id) references public.building (operator_id, id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, building_id, bank_import_row_id) references public.bank_import_row (operator_id, building_id, id)
);
comment on table public.refund is '환불. 과납 → contract + ledger refund entry; 오납 → bank row, no ledger (§4.3.5). Append-only.';

create table public.late_fee_settlement (
  id                uuid primary key default gen_random_uuid(),
  operator_id       uuid not null,
  building_id       uuid not null,
  contract_id       uuid not null,
  settled_through   date not null,
  method            public.late_fee_method not null,
  assessed_amount   bigint not null check (assessed_amount >= 0),
  waived_amount     bigint not null check (waived_amount >= 0),
  collected_amount  bigint not null check (collected_amount >= 0),
  invoice_line_id   uuid,
  created_at        timestamptz not null default now(),
  created_by        uuid not null default private.actor_id() references public.user_account (id),
  constraint late_fee_settlement_sum check (assessed_amount = waived_amount + collected_amount),
  constraint late_fee_settlement_line check ((method = 'waive_all') = (invoice_line_id is null)),
  constraint late_fee_settlement_waive_all check (method <> 'waive_all' or collected_amount = 0),
  constraint late_fee_settlement_full check (method <> 'full' or waived_amount = 0),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, contract_id, invoice_line_id) references public.invoice_line (operator_id, contract_id, id)
);
comment on table public.late_fee_settlement is '연체료 정리 (design D7). 연체료 정리일 = max(settled_through). "이번엔 안 함" creates no row. Append-only.';
create index late_fee_settlement_contract_idx on public.late_fee_settlement (contract_id, settled_through desc);


-- =============================================================================
-- 14. Ledger (원장) — append-only, period-locked
-- =============================================================================

create table public.ledger_entry (
  id                     uuid primary key default gen_random_uuid(),
  operator_id            uuid not null,
  building_id            uuid not null,
  contract_id            uuid not null,
  txn_date               date not null,
  txn_type               public.ledger_txn_type not null,
  account                public.ledger_account generated always as (
                           case when txn_type in ('deposit_received', 'deposit_deducted', 'deposit_returned')
                                then 'security_deposit'::public.ledger_account
                                else 'receivable'::public.ledger_account end) stored,
  side                   public.ledger_side generated always as (
                           case when txn_type in ('charge', 'payment_cancel', 'refund', 'deposit_deducted', 'deposit_returned')
                                then 'debit'::public.ledger_side
                                else 'credit'::public.ledger_side end) stored,
  charge_item_id         uuid,
  supply_amount          bigint not null check (supply_amount >= 0),
  vat_amount             bigint not null check (vat_amount >= 0),
  total_amount           bigint not null check (total_amount > 0),
  external_txn_no        text,
  memo                   text,
  invoice_line_id        uuid,
  payment_allocation_id  uuid,
  carryover_id           uuid,
  refund_id              uuid,
  reverses_entry_id      uuid unique,
  is_succession          boolean not null default false,
  history_id             uuid not null,
  created_at             timestamptz not null default now(),
  created_by             uuid not null default private.actor_id() references public.user_account (id),
  constraint ledger_entry_scope_key unique (operator_id, contract_id, id),
  constraint ledger_entry_total check (total_amount = supply_amount + vat_amount),
  constraint ledger_entry_deposit_no_vat check (
    txn_type not in ('deposit_received', 'deposit_deducted', 'deposit_returned') or vat_amount = 0),
  constraint ledger_entry_line_link check (
    txn_type not in ('charge', 'charge_cancel', 'reduction') or invoice_line_id is not null),
  constraint ledger_entry_payment_link check (
    txn_type not in ('payment', 'payment_cancel') or payment_allocation_id is not null),
  constraint ledger_entry_reversal_link check (
    txn_type not in ('charge_cancel', 'payment_cancel') or reverses_entry_id is not null),
  constraint ledger_entry_refund_link check (txn_type <> 'refund' or refund_id is not null),
  constraint ledger_entry_succession check (
    not is_succession or txn_type in ('deposit_received', 'deposit_returned')),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, building_id, charge_item_id) references public.charge_item (operator_id, building_id, id),
  foreign key (operator_id, contract_id, invoice_line_id) references public.invoice_line (operator_id, contract_id, id),
  foreign key (operator_id, contract_id, payment_allocation_id) references public.payment_allocation (operator_id, contract_id, id),
  foreign key (operator_id, contract_id, carryover_id) references public.carryover (operator_id, contract_id, id),
  foreign key (operator_id, contract_id, refund_id) references public.refund (operator_id, contract_id, id),
  foreign key (operator_id, history_id) references public.history_header (operator_id, id)
);
alter table public.ledger_entry
  add foreign key (operator_id, contract_id, reverses_entry_id)
  references public.ledger_entry (operator_id, contract_id, id);
comment on table public.ledger_entry is '원장 거래. Append-only; closed building × month (by txn_date) rejects inserts. Amounts ≥ 0, side gives direction.';
comment on column public.ledger_entry.account is '계정: 매출채권 / 임대보증금 (generated from txn_type)';
comment on column public.ledger_entry.side is '기입: 차변 / 대변 (generated from txn_type)';
create index ledger_entry_contract_idx on public.ledger_entry (contract_id, txn_date);
create index ledger_entry_building_idx on public.ledger_entry (building_id, txn_date);
create index ledger_entry_line_idx on public.ledger_entry (invoice_line_id) where invoice_line_id is not null;
create index ledger_entry_allocation_idx on public.ledger_entry (payment_allocation_id) where payment_allocation_id is not null;


-- =============================================================================
-- 15. Documents (문서)
-- =============================================================================

create table public.document (
  id                  uuid primary key default gen_random_uuid(),
  operator_id         uuid not null references public.operator (id),
  target_building_id  uuid,
  target_contract_id  uuid,
  target_tenant_id    uuid,
  target_owner_id     uuid,
  scope_building_id   uuid,
  title               text not null,
  category            public.document_category not null,
  memo                text,
  storage_path        text not null,
  original_filename   text not null,
  size_bytes          bigint not null check (size_bytes >= 0),
  mime_type           text not null,
  uploaded_by         uuid not null default private.actor_id() references public.user_account (id),
  uploaded_at         timestamptz not null default now(),
  deleted_at          timestamptz,
  deleted_by          uuid references public.user_account (id),
  delete_reason       text,
  updated_at          timestamptz not null default now(),
  updated_by          uuid not null default private.actor_id() references public.user_account (id),
  constraint document_one_target check (
    num_nonnulls(target_building_id, target_contract_id, target_tenant_id, target_owner_id) = 1),
  -- categories allowed per target (§3.1 자료 카테고리)
  constraint document_category_fits_target check (
    (target_building_id is null or category in ('building_docs', 'lease_contract', 'facility', 'report', 'other'))
    and ((target_contract_id is null and target_tenant_id is null)
         or category in ('lease_contract', 'business_id', 'deposit', 'billing', 'repair_request', 'tenant_comm', 'other'))
    and (target_owner_id is null or category in ('business_id', 'lease_contract', 'other'))),
  constraint document_deleted check (
    (deleted_at is null) = (deleted_by is null) and (deleted_at is null or delete_reason is not null)),
  -- files live under the operator's own prefix (§7.2.2 #3)
  constraint document_storage_prefix check (storage_path like operator_id::text || '/%'),
  foreign key (operator_id, target_building_id) references public.building (operator_id, id),
  foreign key (operator_id, target_contract_id) references public.contract (operator_id, id),
  foreign key (operator_id, target_tenant_id) references public.tenant (operator_id, id),
  foreign key (operator_id, target_owner_id) references public.owner (operator_id, id),
  foreign key (operator_id, scope_building_id) references public.building (operator_id, id)
);
comment on table public.document is '문서. Exactly one target (no unit documents). scope_building_id (set by trigger) drives RLS; NULL for tenant/owner documents.';
create index document_scope_idx on public.document (operator_id, scope_building_id);
create index document_contract_idx on public.document (target_contract_id) where target_contract_id is not null;
create index document_tenant_idx on public.document (target_tenant_id) where target_tenant_id is not null;


-- =============================================================================
-- 16. Notifications (발송 내역, NTF-6)
-- =============================================================================

create table public.notification_log (
  id               uuid primary key default gen_random_uuid(),
  operator_id      uuid not null references public.operator (id),
  kind             public.notification_kind not null,
  channel          public.notification_channel not null default 'email',
  mode             public.notification_mode not null,
  sender_id        uuid references public.user_account (id),
  recipient_name   text not null,
  recipient_email  text not null,
  subject          text not null,
  body_html        text not null,
  attachments      jsonb not null default '[]' check (jsonb_typeof(attachments) = 'array'),
  building_id      uuid,
  contract_id      uuid,
  invoice_id       uuid,
  user_id          uuid references public.user_account (id),
  status           public.notification_status not null default 'pending',
  failure_reason   text,
  sent_at          timestamptz,
  original_id      uuid references public.notification_log (id),
  created_at       timestamptz not null default now(),
  created_by       uuid not null default private.actor_id() references public.user_account (id),
  constraint notification_failed_reason check (status <> 'failed' or failure_reason is not null),
  constraint notification_sent_at check (status <> 'sent' or sent_at is not null),
  constraint notification_contract_scoped check (contract_id is null or building_id is not null),
  constraint notification_invoice_scoped check (invoice_id is null or contract_id is not null),
  foreign key (operator_id, building_id) references public.building (operator_id, id),
  foreign key (operator_id, building_id, contract_id) references public.contract (operator_id, building_id, id),
  foreign key (operator_id, contract_id, invoice_id) references public.invoice (operator_id, contract_id, id)
);
comment on table public.notification_log is '발송 내역. Recipient, subject, body, attachments as sent. Never deleted; only pending → sent | failed.';
create index notification_log_list_idx on public.notification_log (operator_id, created_at desc);
create index notification_log_invoice_idx on public.notification_log (invoice_id) where invoice_id is not null;


-- =============================================================================
-- 17. Security log & label tables (private)
-- =============================================================================

create table private.security_log (
  id           uuid primary key default gen_random_uuid(),
  occurred_at  timestamptz not null default now(),
  event        public.security_event not null,
  actor_id     uuid references public.user_account (id),
  operator_id  uuid references public.operator (id),
  ip           inet,
  target       text,
  detail       jsonb not null default '{}'
);
comment on table private.security_log is '보안 로그 (§7.7.2). Append-only; rows older than 365 days purged by private.purge_security_log().';
create index security_log_occurred_idx on private.security_log (occurred_at desc);

-- Korean labels used when history stores display strings (§3.6).
create table private.enum_label (
  enum_type  text not null,
  value      text not null,
  label_ko   text not null,
  primary key (enum_type, value)
);

create table private.field_label (
  table_name   text not null,
  column_name  text not null,
  label_ko     text not null,
  format       text not null default 'text' check (format in ('text', 'money', 'bool', 'enum', 'percent', 'area')),
  enum_type    text,
  primary key (table_name, column_name),
  check ((format = 'enum') = (enum_type is not null))
);

-- Permission matrix (§3.7). The single source of truth for who may call which write RPC.
create table private.action_permission (
  action            text primary key,
  super_admin_only  boolean not null,
  note              text
);


-- =============================================================================
-- 18. Trigger functions
-- =============================================================================

create function private.touch_updated() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  new.updated_at := now();
  new.updated_by := private.actor_id();
  return new;
end;
$$;

-- Append-only enforcement. Attached BEFORE UPDATE OR DELETE (row) and BEFORE TRUNCATE (statement).
create function private.forbid_mutation() returns trigger
language plpgsql set search_path = ''
as $$
begin
  raise exception using
    errcode = 'BK005', message = 'append_only',
    detail = format('%s on %s.%s is not allowed', tg_op, tg_table_schema, tg_table_name);
end;
$$;

-- Immutable columns: pass column names as trigger arguments.
create function private.forbid_column_change() returns trigger
language plpgsql set search_path = ''
as $$
declare
  v_col text;
begin
  foreach v_col in array tg_argv loop
    if (to_jsonb(old) -> v_col) is distinct from (to_jsonb(new) -> v_col) then
      raise exception using
        errcode = 'BK005', message = 'immutable_column',
        detail = format('%s.%s cannot be changed', tg_table_name, v_col);
    end if;
  end loop;
  return new;
end;
$$;

-- Period lock on the ledger (§6.12): month of txn_date, per building.
create function private.ledger_period_lock() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  perform private.assert_month_open(new.building_id, new.txn_date);
  return new;
end;
$$;

-- Recurring charges are for fixed-method items only (rent, fixed management fee).
create function private.check_recurring_charge_item() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.charge_item ci
    where ci.id = new.charge_item_id and ci.calc_method = 'fixed') then
    raise exception using errcode = 'BK005', message = 'recurring_charge_requires_fixed_item';
  end if;
  return new;
end;
$$;

-- Allocation guard (§4.3.1, §6.12):
--  * a line of a closed month can neither gain nor lose allocations;
--  * money received before an invoice was issued never pays that invoice
--    (except moves of an existing overpayment, which carry replaces_allocation_id);
--  * only status may change, and only from valid.
create function private.guard_allocation() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_month date;
  v_issued date;
  v_deposited date;
begin
  if tg_op = 'UPDATE' then
    if (to_jsonb(new) - array['status', 'status_changed_at', 'status_changed_by'])
       is distinct from (to_jsonb(old) - array['status', 'status_changed_at', 'status_changed_by']) then
      raise exception using errcode = 'BK005', message = 'allocation_only_status_may_change';
    end if;
    if old.status <> 'valid' and new.status is distinct from old.status then
      raise exception using errcode = 'BK006', message = 'allocation_status_is_final';
    end if;
    if old.invoice_line_id is not null and new.status is distinct from old.status then
      select i.billing_month into v_month
      from public.invoice_line l join public.invoice i on i.id = l.invoice_id
      where l.id = old.invoice_line_id;
      perform private.assert_month_open(old.building_id, v_month);
    end if;
    return new;
  end if;

  if new.invoice_line_id is not null then
    select i.billing_month, i.issued_on into v_month, v_issued
    from public.invoice_line l join public.invoice i on i.id = l.invoice_id
    where l.id = new.invoice_line_id;
    perform private.assert_month_open(new.building_id, v_month);
    if new.replaces_allocation_id is null then
      select (d.deposited_at at time zone 'Asia/Seoul')::date into v_deposited
      from public.deposit d where d.id = new.deposit_id;
      if v_issued > v_deposited then
        raise exception using errcode = 'BK005', message = 'deposit_predates_invoice';
      end if;
    end if;
  end if;
  return new;
end;
$$;

-- Deferred check: valid allocations of a valid deposit sum to its amount; a void deposit has none.
create function private.check_deposit_allocations() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_deposit_id uuid;
  v_amount bigint;
  v_status public.deposit_status;
  v_sum bigint;
begin
  if tg_table_name = 'deposit' then
    v_deposit_id := new.id;
  else
    v_deposit_id := new.deposit_id;
  end if;

  select d.amount, d.status into v_amount, v_status from public.deposit d where d.id = v_deposit_id;
  select coalesce(sum(a.amount), 0) into v_sum
  from public.payment_allocation a
  where a.deposit_id = v_deposit_id and a.status = 'valid';

  if (v_status = 'valid' and v_sum <> v_amount) or (v_status = 'void' and v_sum <> 0) then
    raise exception using
      errcode = 'BK005', message = 'allocation_sum_mismatch',
      detail = format('deposit %s: amount %s, allocated %s, status %s', v_deposit_id, v_amount, v_sum, v_status);
  end if;
  return null;
end;
$$;

-- notification_log: only pending → sent | failed, touching only status columns.
create function private.guard_notification_update() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if old.status <> 'pending'
     or new.status not in ('sent', 'failed')
     or (to_jsonb(new) - array['status', 'failure_reason', 'sent_at'])
        is distinct from (to_jsonb(old) - array['status', 'failure_reason', 'sent_at']) then
    raise exception using errcode = 'BK005', message = 'notification_log_only_records_result';
  end if;
  return new;
end;
$$;

-- security_log: append-only except the retention purge (§7.7.3).
create function private.guard_security_log() returns trigger
language plpgsql set search_path = ''
as $$
begin
  if tg_op = 'DELETE'
     and current_setting('brikka.security_log_purge', true) = 'on'
     and old.occurred_at < now() - interval '365 days' then
    return old;
  end if;
  raise exception using errcode = 'BK005', message = 'append_only', detail = 'private.security_log';
end;
$$;

create function private.purge_security_log() returns integer
language plpgsql security definer set search_path = ''
as $$
declare
  v_count integer;
begin
  perform set_config('brikka.security_log_purge', 'on', true);
  delete from private.security_log where occurred_at < now() - interval '365 days';
  get diagnostics v_count = row_count;
  perform set_config('brikka.security_log_purge', 'off', true);
  return v_count;
end;
$$;

create function private.set_document_scope() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_building uuid;
begin
  if new.target_building_id is not null then
    v_building := new.target_building_id;
  elsif new.target_contract_id is not null then
    select c.building_id into v_building from public.contract c where c.id = new.target_contract_id;
  end if;
  new.scope_building_id := v_building;
  return new;
end;
$$;


-- =============================================================================
-- 19. Authorization & history helpers
-- =============================================================================

-- First statement of every operator-level write RPC (design §3.2).
create function private.authorize(p_action text, p_building_id uuid default null) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_rule private.action_permission;
  v_role public.member_role;
begin
  select * into v_rule from private.action_permission where action = p_action;
  if not found then
    raise exception using errcode = 'BK001', message = 'forbidden', detail = format('unknown action %s', p_action);
  end if;
  if private.current_operator_id() is null then
    raise exception using errcode = 'BK001', message = 'forbidden', detail = 'no active operator';
  end if;
  v_role := private.current_member_role();
  if v_role not in ('super_admin', 'admin') then
    raise exception using errcode = 'BK001', message = 'forbidden', detail = 'role cannot write';
  end if;
  if v_rule.super_admin_only and v_role <> 'super_admin' then
    raise exception using errcode = 'BK001', message = 'forbidden', detail = format('%s requires super admin', p_action);
  end if;
  if p_building_id is not null and not private.can_access_building(p_building_id) then
    raise exception using errcode = 'BK001', message = 'forbidden', detail = 'building not accessible';
  end if;
end;
$$;

-- For SYS-1 / SYS-2 RPCs (create_operator, provision_super_admin).
create function private.authorize_system_operator() returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if not private.is_system_operator() then
    raise exception using errcode = 'BK001', message = 'forbidden', detail = 'system operator only';
  end if;
end;
$$;

-- For self-service RPCs (switch_operator, update_my_profile).
create function private.authorize_self() returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if private.current_user_id() is null then
    raise exception using errcode = 'BK001', message = 'forbidden', detail = 'no active account';
  end if;
end;
$$;

-- Opens a history header for the current transaction; the audit trigger attaches details to it.
-- Reasons for the remaining §3.6 cases (adhoc charge, refund, deletes) are required by their RPCs.
create function private.begin_history(
  p_target       public.history_target,
  p_target_id    uuid,
  p_target_name  text,
  p_change       public.history_change,
  p_reason       text default null,
  p_building_id  uuid default null,
  p_operator_id  uuid default null
) returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  v_operator uuid := coalesce(p_operator_id, private.current_operator_id());
  v_id uuid;
begin
  if v_operator is null then
    raise exception using errcode = 'BK001', message = 'forbidden', detail = 'history needs an operator';
  end if;
  if (p_change in ('cancel_invoice', 'reduction', 'reallocation', 'void_deposit', 'close_cancel')
      or (p_change = 'status_change' and p_target in ('contract', 'building')))
     and nullif(btrim(coalesce(p_reason, '')), '') is null then
    raise exception using errcode = 'BK007', message = 'reason_required', detail = p_change::text;
  end if;

  insert into public.history_header
    (operator_id, building_id, target_type, target_id, target_name, change_type, actor_id, reason)
  values
    (v_operator, p_building_id, p_target, p_target_id, p_target_name, p_change, private.actor_id(), p_reason)
  returning id into v_id;

  perform set_config('brikka.history_id', v_id::text, true);
  return v_id;
end;
$$;

create function private.current_history_id() returns uuid
language plpgsql stable set search_path = ''
as $$
begin
  return nullif(current_setting('brikka.history_id', true), '')::uuid;
end;
$$;

-- Formats one value as the display string stored in history_detail.
create function private.format_field(p_table text, p_column text, p_value jsonb) returns text
language plpgsql stable security definer set search_path = ''
as $$
declare
  v_rule private.field_label;
  v_text text;
  v_label text;
begin
  if p_value is null or p_value = 'null'::jsonb then
    return null;
  end if;
  v_text := p_value #>> '{}';
  select * into v_rule from private.field_label where table_name = p_table and column_name = p_column;
  if not found then
    return v_text;
  end if;
  case v_rule.format
    when 'money' then return to_char(v_text::numeric, 'FM999,999,999,999,990') || '원';
    when 'bool' then return case when v_text::boolean then '예' else '아니오' end;
    when 'percent' then return v_text || '%';
    when 'area' then return v_text || '㎡';
    when 'enum' then
      select el.label_ko into v_label from private.enum_label el
      where el.enum_type = v_rule.enum_type and el.value = v_text;
      return coalesce(v_label, v_text);
    else return v_text;
  end case;
end;
$$;

-- Appends a detail row by hand (used by RPCs writing append-only tables, e.g. 배율조정).
create function private.add_history_detail(p_label text, p_before text, p_after text) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_header public.history_header;
begin
  select * into v_header from public.history_header where id = private.current_history_id();
  if not found then
    raise exception using errcode = 'BK005', message = 'history_context_required';
  end if;
  insert into public.history_detail (operator_id, building_id, header_id, field_label, before_text, after_text)
  values (v_header.operator_id, v_header.building_id, v_header.id, p_label, p_before, p_after);
end;
$$;

-- Generic audit trigger (AFTER INSERT/UPDATE/DELETE, row level).
-- Every change to an audited table must happen inside begin_history(); UPDATEs
-- record one detail row per changed column. Trigger arguments name extra
-- columns to ignore (e.g. last_login_at).
create function private.audit_row() returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_ignored text[] := array['id', 'operator_id', 'created_at', 'created_by', 'updated_at', 'updated_by'] || tg_argv;
  v_old jsonb;
  v_new jsonb;
  v_key text;
  v_header public.history_header;
begin
  if tg_op = 'UPDATE' then
    v_old := to_jsonb(old) - v_ignored;
    v_new := to_jsonb(new) - v_ignored;
    if v_old = v_new then
      return null;
    end if;
  end if;

  select * into v_header from public.history_header where id = private.current_history_id();
  if not found then
    raise exception using
      errcode = 'BK005', message = 'history_context_required',
      detail = format('%s on %s without private.begin_history()', tg_op, tg_table_name);
  end if;

  if tg_op = 'UPDATE' then
    for v_key in
      select k from jsonb_object_keys(v_new) k where (v_new -> k) is distinct from (v_old -> k)
    loop
      insert into public.history_detail (operator_id, building_id, header_id, field_label, before_text, after_text)
      values (
        v_header.operator_id, v_header.building_id, v_header.id,
        coalesce((select fl.label_ko from private.field_label fl
                  where fl.table_name = tg_table_name and fl.column_name = v_key), v_key),
        private.format_field(tg_table_name, v_key, v_old -> v_key),
        private.format_field(tg_table_name, v_key, v_new -> v_key));
    end loop;
  end if;
  return null;
end;
$$;


-- =============================================================================
-- 20. Seed rows
-- =============================================================================

-- admin_system: actor of scheduled jobs. No login.
insert into public.user_account (id, email, name, status, created_by, updated_by)
values (private.system_actor_id(), 'admin_system@brikka.internal', 'admin_system', 'active',
        private.system_actor_id(), private.system_actor_id());

insert into private.action_permission (action, super_admin_only, note) values
  -- users & assignments
  ('invite_admin', true, 'USER-3'),
  ('set_admin_buildings', true, '관리자별 담당 건물 배정'),
  ('change_member_role', true, '권한 변경'),
  ('block_user', true, '차단'),
  ('unblock_user', true, '차단 해제'),
  -- buildings
  ('create_building', true, null),
  ('delete_building', true, null),
  ('set_building_operating_status', true, '건물 비운영중 지정·해제'),
  ('update_building_billing', true, '청구일 · 납부마감일'),
  ('upsert_management_contract', true, '위탁운영계약'),
  ('update_building_info', false, '기본 정보 · 제원 · 채권'),
  ('upsert_building_wing', false, null),
  ('set_building_owners', false, '임대인 정보'),
  ('add_common_facility', false, null),
  ('remove_common_facility', false, null),
  -- units
  ('create_unit', true, null),
  ('delete_unit', true, null),
  ('set_unit_non_operating', true, '유닛 비운영중 지정·해제'),
  ('update_unit', false, null),
  ('set_unit_meter', false, '계량기 · 계기배율 (also from PAY-10)'),
  -- building fee settings
  ('upsert_charge_item', true, '건물별 관리비 설정'),
  ('delete_or_deactivate_charge_item', true, '건물별 관리비 설정'),
  -- parties
  ('update_tenant', false, null),
  ('upsert_payer_alias', false, null),
  ('upsert_owner', false, null),
  ('upsert_broker', false, null),
  -- contracts
  ('create_contract', false, null),
  ('update_contract', false, null),
  ('update_contract_amounts', true, '임대료 · 고정관리비 금액 · 반복주기 · 기산일'),
  ('upsert_rent_change', true, '임대료 인상 예약'),
  ('delete_rent_change', true, '임대료 인상 예약'),
  ('set_contract_status', false, null),
  ('terminate_contract', false, null),
  ('renew_contract', false, null),
  ('delete_contract', true, null),
  ('upsert_contact', false, null),
  ('delete_contact', false, null),
  ('upsert_vehicle', false, null),
  ('release_vehicle', false, null),
  ('delete_vehicle', false, null),
  ('add_adhoc_charge', false, '추가 청구'),
  ('delete_adhoc_charge', false, null),
  ('reduce_invoice_line', false, '감액'),
  -- settlement
  ('save_settlement_items', false, null),
  ('save_utility_bill', false, null),
  ('record_meter_readings', false, null),
  ('set_allocation_multiplier', false, null),
  ('upsert_manual_amount', false, null),
  ('upsert_proration_override', false, null),
  ('delete_proration_override', false, null),
  ('confirm_settlement', false, null),
  ('unconfirm_settlement', false, null),
  -- billing
  ('issue_invoices', false, null),
  ('cancel_invoice', false, null),
  -- payments
  ('create_bank_import', false, null),
  ('upsert_bank_column_mapping', false, null),
  ('set_bank_row_tenant', false, null),
  ('ignore_bank_row', false, null),
  ('mark_misdeposit', false, null),
  ('confirm_deposit', false, null),
  ('record_counter_payment', false, '현금 · 카드 · 보증금상계 + 연체료'),
  ('void_deposit', false, null),
  ('reallocate_deposit', false, null),
  ('refund_overpayment', false, null),
  ('record_misdeposit_refund', false, null),
  ('record_security_deposit_txn', false, '보증금 예치 · 차감 · 환급'),
  -- close
  ('close_month', false, null),
  ('cancel_month_close', true, null),
  -- documents, history, exports, notifications
  ('register_document', false, null),
  ('delete_document', false, null),
  ('delete_history', true, null),
  ('log_export', false, null),
  ('log_sensitive_download', false, null),
  ('enqueue_notification', false, null),
  ('mark_notification_result', false, null);

insert into private.enum_label (enum_type, value, label_ko) values
  ('operator_kind', 'production', '실운영'), ('operator_kind', 'test', '검증용'),
  ('operator_status', 'active', '정상'), ('operator_status', 'suspended', '중지'),
  ('account_status', 'active', '정상'), ('account_status', 'blocked', '차단됨'),
  ('member_role', 'super_admin', '슈퍼관리자'), ('member_role', 'admin', '관리자'),
  ('member_role', 'owner', '임대인'), ('member_role', 'tenant_contact', '임차인'),
  ('building_type', 'office', '오피스빌딩'), ('building_type', 'neighborhood_retail', '근린생활시설(상가)'),
  ('building_type', 'knowledge_industry_center', '지식산업센터'), ('building_type', 'mixed_retail', '복합상가'),
  ('building_type', 'logistics_warehouse', '물류창고'), ('building_type', 'other', '기타'),
  ('building_operating_status', 'operating', '운영중'), ('building_operating_status', 'non_operating', '비운영중'),
  ('billing_month_ref', 'prev', '전월'), ('billing_month_ref', 'current', '당월'),
  ('due_month_ref', 'current', '당월'), ('due_month_ref', 'next', '익월'),
  ('unit_usage', 'office', '사무실'), ('unit_usage', 'neighborhood_retail', '근린생활'),
  ('unit_usage', 'storage', '창고'), ('unit_usage', 'other', '기타'),
  ('non_operating_reason', 'owner_use', '건물주 직접 사용'), ('non_operating_reason', 'construction', '공사 중'),
  ('owner_kind', 'individual', '개인'), ('owner_kind', 'corporation', '법인'), ('owner_kind', 'sole_proprietor', '개인사업자'),
  ('tenant_kind', 'corporation', '법인'), ('tenant_kind', 'sole_proprietor', '개인사업자'),
  ('contract_status', 'pending', '준비중'), ('contract_status', 'active', '진행중'),
  ('contract_status', 'ended', '종료됨'), ('contract_status', 'voided', '파기됨'),
  ('contract_type', 'fixed_term', '확정기간계약'), ('contract_type', 'auto_renew', '확정기간후자동갱신'),
  ('termination_type', 'expiry', '만기 종료'), ('termination_type', 'mutual', '중도 해지(합의)'),
  ('termination_type', 'breach', '중도 해지(위반·분쟁)'),
  ('hvac_ownership', 'tenant_installed', '임차인 설치'), ('hvac_ownership', 'tenant_inherited', '임차인 승계'),
  ('hvac_ownership', 'landlord_installed', '임대인 설치'),
  ('parking_type', 'ground', '지상'), ('parking_type', 'underground', '지하'), ('parking_type', 'mechanical', '기계식'),
  ('parking_fee_type', 'free', '무료'), ('parking_fee_type', 'monthly', '월정액'),
  ('rent_change_status', 'scheduled', '예정'), ('rent_change_status', 'applied', '적용완료'),
  ('calc_method', 'fixed', '고정액'), ('calc_method', 'settlement', '정산'), ('calc_method', 'none', '—'),
  ('issuance_doc', 'tax_invoice', '세금계산서'), ('issuance_doc', 'exempt_invoice', '계산서'),
  ('issuance_doc', 'statement', '일반내역서'),
  ('recurrence', 'monthly', '매월'), ('recurrence', 'bimonthly', '격월'), ('recurrence', 'quarterly', '분기'),
  ('recurrence', 'semiannual', '반기'), ('recurrence', 'annual', '연1회'),
  ('allocation_basis', 'usage', '사용량'), ('allocation_basis', 'area', '임대면적'),
  ('allocation_basis', 'usage_plus_area', '사용량+임대면적'), ('allocation_basis', 'manual', '직접 입력'),
  ('evidence_doc', 'bill', '고지서'), ('evidence_doc', 'statement', '내역서'),
  ('evidence_doc', 'contract', '계약서'), ('evidence_doc', 'tally', '집계표'),
  ('invoice_status', 'valid', '유효'), ('invoice_status', 'cancelled', '취소'),
  ('payment_method', 'bank_transfer', '계좌이체'), ('payment_method', 'card', '카드'), ('payment_method', 'cash', '현금'),
  ('payment_method', 'deposit_offset', '보증금상계'), ('payment_method', 'virtual_account', '가상계좌'),
  ('deposit_status', 'valid', '유효'), ('deposit_status', 'void', '무효'),
  ('settlement_status', 'draft', '작성중'), ('settlement_status', 'confirmed', '확정'),
  ('close_status', 'closed', '마감'), ('close_status', 'cancelled', '마감 취소'),
  ('document_category', 'lease_contract', '계약서'), ('document_category', 'business_id', '사업자등록증·신분증'),
  ('document_category', 'deposit', '보증금관련'), ('document_category', 'billing', '청구납부관련'),
  ('document_category', 'repair_request', '요청수리내역'), ('document_category', 'facility', '시설관련'),
  ('document_category', 'building_docs', '건물서류'), ('document_category', 'tenant_comm', '임차인커뮤니케이션'),
  ('document_category', 'report', '보고서'), ('document_category', 'other', '기타');

insert into private.field_label (table_name, column_name, label_ko, format, enum_type) values
  -- building
  ('building', 'name', '건물고유이름', 'text', null),
  ('building', 'alias', '건물별칭', 'text', null),
  ('building', 'building_type', '건물유형', 'enum', 'building_type'),
  ('building', 'address', '건물주소', 'text', null),
  ('building', 'operating_status', '운영상태', 'enum', 'building_operating_status'),
  ('building', 'operating_status_reason', '운영상태 사유', 'text', null),
  ('building', 'built_on', '건축일', 'text', null),
  ('building', 'use_approved_on', '사용승인일', 'text', null),
  ('building', 'gross_floor_area', '연면적', 'area', null),
  ('building', 'leasable_area', '임대가능면적', 'area', null),
  ('building', 'parking_ground', '주차면수(지상 자주식)', 'text', null),
  ('building', 'parking_underground', '주차면수(지하 자주식)', 'text', null),
  ('building', 'parking_mechanical', '주차면수(기계식)', 'text', null),
  ('building', 'hvac_types', '냉난방 방식', 'text', null),
  ('building', 'rent_account_bank', '임대료 납부 계좌 은행', 'text', null),
  ('building', 'rent_account_no', '임대료 납부 계좌번호', 'text', null),
  ('building', 'rent_account_holder', '임대료 납부 계좌 예금주', 'text', null),
  ('building', 'fee_account_bank', '관리비 납부 계좌 은행', 'text', null),
  ('building', 'fee_account_no', '관리비 납부 계좌번호', 'text', null),
  ('building', 'fee_account_holder', '관리비 납부 계좌 예금주', 'text', null),
  ('building', 'lien_max_amount', '채권최고금액', 'money', null),
  ('building', 'lien_actual_amount', '실제채권금액', 'money', null),
  ('building', 'billing_month_ref', '청구일(월)', 'enum', 'billing_month_ref'),
  ('building', 'billing_day', '청구일(일)', 'text', null),
  ('building', 'due_month_ref', '납부마감일(월)', 'enum', 'due_month_ref'),
  ('building', 'due_day', '납부마감일(일)', 'text', null),
  -- unit
  ('unit', 'code', '유닛고유번호', 'text', null),
  ('unit', 'usage', '유닛용도', 'enum', 'unit_usage'),
  ('unit', 'floor', '유닛층', 'text', null),
  ('unit', 'leased_area', '임대면적', 'area', null),
  ('unit', 'exclusive_area', '전용면적', 'area', null),
  ('unit', 'non_operating_reason', '비운영중 사유', 'enum', 'non_operating_reason'),
  ('unit', 'memo', '메모', 'text', null),
  ('unit_meter_setting', 'has_meter', '계량기 보유', 'bool', null),
  ('unit_meter_setting', 'meter_multiplier', '계량기 배율', 'text', null),
  -- charge item
  ('charge_item', 'name', '청구항목명', 'text', null),
  ('charge_item', 'issuance_doc', '발행 문서', 'enum', 'issuance_doc'),
  ('charge_item', 'recurrence', '반복주기', 'enum', 'recurrence'),
  ('charge_item', 'priority', '배분 우선순위', 'text', null),
  ('charge_item', 'allocation_basis', '배분 기준', 'enum', 'allocation_basis'),
  ('charge_item', 'evidence_doc', '근거 문서', 'enum', 'evidence_doc'),
  ('charge_item', 'issuer', '발행처', 'text', null),
  ('charge_item', 'is_active', '사용여부', 'bool', null),
  -- parties
  ('tenant', 'kind', '사업자구분', 'enum', 'tenant_kind'),
  ('tenant', 'trade_name', '상호', 'text', null),
  ('tenant', 'representative', '대표자명', 'text', null),
  ('tenant', 'address', '사업장주소', 'text', null),
  ('tenant', 'business_type', '업태', 'text', null),
  ('tenant', 'business_item', '종목', 'text', null),
  ('tenant', 'combine_invoices', '청구서 합쳐 보내기', 'bool', null),
  ('owner', 'name', '임대인명', 'text', null),
  ('owner', 'kind', '임대인구분', 'enum', 'owner_kind'),
  ('owner', 'trade_name', '상호', 'text', null),
  ('owner', 'representative', '대표자명', 'text', null),
  ('owner', 'address', '주소', 'text', null),
  ('owner', 'phone', '연락처', 'text', null),
  ('owner', 'email', '이메일', 'text', null),
  -- contract
  ('contract', 'status', '계약상태', 'enum', 'contract_status'),
  ('contract', 'contract_type', '계약유형', 'enum', 'contract_type'),
  ('contract', 'starts_on', '계약시작일', 'text', null),
  ('contract', 'ends_on', '계약종료일', 'text', null),
  ('contract', 'deposit_amount', '보증금', 'money', null),
  ('contract', 'deposit_return_due_on', '보증금 반환예정일', 'text', null),
  ('contract', 'refund_bank', '환불계좌 은행', 'text', null),
  ('contract', 'refund_account_no', '환불계좌번호', 'text', null),
  ('contract', 'refund_account_holder', '환불계좌 예금주', 'text', null),
  ('contract', 'free_parking_slots', '무료 주차 대수', 'text', null),
  ('contract', 'late_fee_rate', '연체이자율', 'percent', null),
  ('contract', 'has_rent_free', '렌트프리', 'bool', null),
  ('contract', 'rent_free_ends_on', '렌트프리 끝나는 날', 'text', null),
  ('contract', 'settlement_payer_contract_id', '정산액 대납 계약', 'text', null),
  ('contract', 'broker_commission_rate', '중개 수수료율', 'percent', null),
  ('contract', 'termination_type', '해지유형', 'enum', 'termination_type'),
  ('contract', 'terminated_on', '해지일', 'text', null),
  ('contract', 'termination_reason', '해지사유', 'text', null),
  ('contract', 'penalty_amount', '위약금', 'money', null),
  ('contract', 'restoration_cost', '원상복구비', 'money', null),
  ('contract', 'memo', '메모', 'text', null),
  ('recurring_charge', 'amount_incl_vat', '약정액(부가세 포함)', 'money', null),
  ('recurring_charge', 'recurrence', '반복주기', 'enum', 'recurrence'),
  ('recurring_charge', 'billing_starts_on', '기산일', 'text', null),
  ('rent_change_schedule', 'effective_on', '적용일', 'text', null),
  ('rent_change_schedule', 'new_rent_amount', '임대료', 'money', null),
  ('rent_change_schedule', 'new_fixed_fee_amount', '고정관리비', 'money', null),
  ('rent_change_schedule', 'status', '적용상태', 'enum', 'rent_change_status'),
  ('contract_contact', 'name', '담당자명', 'text', null),
  ('contract_contact', 'title', '직위', 'text', null),
  ('contract_contact', 'phone', '연락처', 'text', null),
  ('contract_contact', 'email', '이메일', 'text', null),
  ('contract_contact', 'is_primary', '대표 담당자', 'bool', null),
  ('vehicle', 'plate_no', '차량번호', 'text', null),
  ('vehicle', 'owner_name', '차량 소유자', 'text', null),
  ('vehicle', 'owner_phone', '연락처', 'text', null),
  ('vehicle', 'model', '차종', 'text', null),
  ('vehicle', 'parking_type', '주차구분', 'enum', 'parking_type'),
  ('vehicle', 'fee_type', '요금부과', 'enum', 'parking_fee_type'),
  ('adhoc_charge', 'amount_incl_vat', '금액(부가세 포함)', 'money', null),
  ('adhoc_charge', 'reason', '사유', 'text', null),
  -- billing & payments
  ('invoice', 'status', '상태', 'enum', 'invoice_status'),
  ('invoice', 'cancel_reason', '취소 사유', 'text', null),
  ('deposit', 'status', '상태', 'enum', 'deposit_status'),
  ('deposit', 'tenant_id', '임차인', 'text', null),
  ('deposit', 'method', '결제수단', 'enum', 'payment_method'),
  ('deposit', 'memo', '메모', 'text', null),
  -- settlement & close
  ('settlement_round', 'status', '정산상태', 'enum', 'settlement_status'),
  ('utility_bill', 'period_start', '부과 시작일', 'text', null),
  ('utility_bill', 'period_end', '부과 종료일', 'text', null),
  ('utility_bill', 'total_usage', '총사용량', 'text', null),
  ('utility_bill', 'supply_amount', '공급가액', 'money', null),
  ('utility_bill', 'vat_amount', '부가세', 'money', null),
  ('manual_settlement_amount', 'supply_amount', '금액', 'money', null),
  ('proration_override', 'adjusted_supply', '조정 공급가액', 'money', null),
  ('proration_override', 'adjusted_vat', '조정 부가세', 'money', null),
  ('month_close', 'status', '마감상태', 'enum', 'close_status'),
  ('month_close', 'cancel_reason', '취소 사유', 'text', null),
  -- users
  ('user_account', 'name', '이름', 'text', null),
  ('user_account', 'status', '계정상태', 'enum', 'account_status'),
  ('operator_membership', 'role', '역할', 'enum', 'member_role'),
  ('operator_membership', 'is_active', '활성', 'bool', null),
  -- documents
  ('document', 'title', '제목', 'text', null),
  ('document', 'category', '카테고리', 'enum', 'document_category'),
  ('document', 'memo', '메모', 'text', null);


-- =============================================================================
-- 21. Triggers
-- =============================================================================

-- updated_at / updated_by
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'operator', 'user_account', 'operator_membership', 'building', 'building_wing', 'management_contract',
    'unit', 'owner', 'building_ownership', 'tenant', 'broker', 'charge_item', 'unit_meter_setting',
    'contract', 'contract_signatory', 'contract_agent', 'contract_contact', 'contract_hvac_unit', 'vehicle',
    'rent_change_schedule', 'recurring_charge', 'settlement_round', 'utility_bill', 'manual_settlement_amount',
    'proration_override', 'invoice', 'adhoc_charge', 'bank_column_mapping', 'bank_import_row', 'deposit',
    'document']
  loop
    execute format(
      'create trigger touch_updated before update on public.%I for each row execute function private.touch_updated()',
      v_table);
  end loop;
end;
$$;

-- Append-only tables: no UPDATE, DELETE, or TRUNCATE (§7.7.4)
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'history_header', 'history_detail', 'history_deletion', 'meter_reading', 'allocation_adjustment',
    'invoice_line', 'carryover_bucket', 'refund', 'late_fee_settlement', 'ledger_entry']
  loop
    execute format(
      'create trigger append_only before update or delete on public.%I for each row execute function private.forbid_mutation()',
      v_table);
    execute format(
      'create trigger append_only_truncate before truncate on public.%I for each statement execute function private.forbid_mutation()',
      v_table);
  end loop;
end;
$$;

-- settlement_result: never updated (deleted only when a round returns to draft)
create trigger no_update before update on public.settlement_result
  for each row execute function private.forbid_mutation();

-- notification_log: never deleted; only pending → sent | failed
create trigger no_delete before delete on public.notification_log
  for each row execute function private.forbid_mutation();
create trigger no_truncate before truncate on public.notification_log
  for each statement execute function private.forbid_mutation();
create trigger record_result_only before update on public.notification_log
  for each row execute function private.guard_notification_update();

-- security_log
create trigger append_only before update or delete on private.security_log
  for each row execute function private.guard_security_log();
create trigger append_only_truncate before truncate on private.security_log
  for each statement execute function private.forbid_mutation();

-- Immutable columns
create trigger immutable_columns before update on public.operator
  for each row execute function private.forbid_column_change('kind');
create trigger immutable_columns before update on public.tenant
  for each row execute function private.forbid_column_change('operator_id', 'business_reg_no');
create trigger immutable_columns before update on public.owner
  for each row execute function private.forbid_column_change('operator_id', 'business_reg_no');
create trigger immutable_columns before update on public.unit
  for each row execute function private.forbid_column_change('operator_id', 'building_id');
create trigger immutable_columns before update on public.charge_item
  for each row execute function private.forbid_column_change('operator_id', 'building_id', 'standard_code', 'calc_method');
create trigger immutable_columns before update on public.contract
  for each row execute function private.forbid_column_change('operator_id', 'building_id', 'unit_id');
create trigger immutable_columns before update on public.invoice
  for each row execute function private.forbid_column_change(
    'operator_id', 'building_id', 'contract_id', 'billing_month', 'kind', 'issued_on', 'billing_date', 'due_date');
create trigger immutable_columns before update on public.deposit
  for each row execute function private.forbid_column_change(
    'operator_id', 'building_id', 'deposited_at', 'amount', 'reg_method', 'registered_by');
create trigger immutable_columns before update on public.month_close
  for each row execute function private.forbid_column_change('operator_id', 'building_id', 'month', 'closed_at', 'closed_by');
create trigger immutable_columns before update on public.carryover
  for each row execute function private.forbid_column_change(
    'operator_id', 'building_id', 'contract_id', 'month_close_id', 'closed_month', 'amount');

-- Business invariants
create trigger period_lock before insert on public.ledger_entry
  for each row execute function private.ledger_period_lock();
create trigger fixed_item_only before insert or update on public.recurring_charge
  for each row execute function private.check_recurring_charge_item();
create trigger guard before insert or update on public.payment_allocation
  for each row execute function private.guard_allocation();
create constraint trigger allocation_sum after insert or update on public.payment_allocation
  deferrable initially deferred for each row execute function private.check_deposit_allocations();
create constraint trigger allocation_sum after insert or update on public.deposit
  deferrable initially deferred for each row execute function private.check_deposit_allocations();
create trigger set_scope before insert or update on public.document
  for each row execute function private.set_document_scope();

-- Audit (history) — every change needs a begin_history() context
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'operator_membership', 'building', 'building_assignment', 'building_wing', 'management_contract',
    'common_facility', 'unit', 'owner', 'building_ownership', 'tenant', 'tenant_payer_alias', 'broker',
    'charge_item', 'unit_meter_setting', 'contract', 'contract_rent_free_item', 'contract_signatory',
    'contract_agent', 'contract_contact', 'contract_hvac_unit', 'vehicle', 'rent_change_schedule',
    'recurring_charge', 'adhoc_charge', 'invoice', 'deposit', 'settlement_round', 'utility_bill',
    'manual_settlement_amount', 'proration_override', 'month_close', 'document']
  loop
    execute format(
      'create trigger audit after insert or update or delete on public.%I for each row execute function private.audit_row()',
      v_table);
  end loop;
end;
$$;
-- user_account: login timestamps and operator switches are security-logged, not business history
create trigger audit after insert or update or delete on public.user_account
  for each row execute function private.audit_row('last_login_at', 'active_operator_id');


-- =============================================================================
-- 22. Views (security_invoker: RLS of the caller applies)
-- =============================================================================

create view public.unit_status_v with (security_invoker = true) as
select
  u.id as unit_id,
  u.operator_id,
  u.building_id,
  regexp_replace(b.alias, '\s', '', 'g') || '|' || regexp_replace(u.code, '\s', '', 'g') as unit_label,
  case
    when u.non_operating_reason is not null then 'non_operating'::public.unit_status
    when ac.id is not null then 'occupied'::public.unit_status
    else 'vacant'::public.unit_status
  end as status,
  ac.id as active_contract_id
from public.unit u
join public.building b on b.id = u.building_id
left join public.contract ac on ac.unit_id = u.id and ac.status = 'active';
comment on view public.unit_status_v is '유닛상태 (§3.2) and the two-part label 건물별칭|유닛고유번호.';

create view public.contract_display_name_v with (security_invoker = true) as
select
  c.id as contract_id,
  c.operator_id,
  c.building_id,
  regexp_replace(b.alias, '\s', '', 'g') || '|' || regexp_replace(u.code, '\s', '', 'g')
    || '|' || regexp_replace(t.trade_name, '\s', '', 'g') as display_name
from public.contract c
join public.building b on b.id = c.building_id
join public.unit u on u.id = c.unit_id
join public.tenant t on t.id = c.tenant_id;
comment on view public.contract_display_name_v is '계약고유이름: 건물별칭|유닛고유번호|대표임차인명, internal spaces removed (§3.1).';

create view public.invoice_line_balance_v with (security_invoker = true) as
select
  l.id as invoice_line_id,
  l.operator_id,
  l.building_id,
  l.contract_id,
  l.invoice_id,
  i.billing_month,
  i.kind as invoice_kind,
  i.status as invoice_status,
  i.issued_on,
  i.due_date,
  l.charge_item_id,
  l.name,
  l.priority,
  l.issuance_doc,
  l.supply_amount,
  l.vat_amount,
  l.total_amount,
  coalesce(red.amount, 0) as reduced_amount,
  coalesce(pay.amount, 0) as paid_amount,
  l.total_amount - coalesce(red.amount, 0) - coalesce(pay.amount, 0) as unpaid_amount,
  (mc.id is not null) as month_closed,
  case
    when i.status = 'cancelled' then 'cancelled'
    when l.total_amount - coalesce(red.amount, 0) - coalesce(pay.amount, 0) <= 0 then 'paid'
    when mc.id is not null then 'overdue'          -- closed month: anything unpaid is 미납
    when coalesce(pay.amount, 0) > 0 then 'partial' -- partial stays partial until close
    when private.today_kst() > i.due_date then 'overdue'
    else 'not_due'
  end::public.payment_status as payment_status
from public.invoice_line l
join public.invoice i on i.id = l.invoice_id
left join public.month_close mc
  on mc.building_id = l.building_id and mc.month = i.billing_month and mc.status = 'closed'
left join lateral (
  -- reductions recorded after the close go to the carryover, not the closed month
  select sum(e.total_amount) as amount
  from public.ledger_entry e
  where e.invoice_line_id = l.id and e.txn_type = 'reduction'
    and (mc.id is null or e.created_at <= mc.closed_at)
) red on true
left join lateral (
  select sum(a.amount) as amount
  from public.payment_allocation a
  where a.invoice_line_id = l.id and a.status = 'valid'
) pay on true;
comment on view public.invoice_line_balance_v is 'Per 청구 건: 감액, 수납액, 미납액, 납부상태 (§3.2). Never stored.';

create view public.contract_month_status_v with (security_invoker = true) as
with lines as (
  select * from public.invoice_line_balance_v
),
months as (
  select
    contract_id, operator_id, building_id, billing_month,
    bool_and(invoice_status = 'cancelled') as all_cancelled,
    coalesce(sum(total_amount) filter (where invoice_status = 'valid'), 0) as billed_amount,
    coalesce(sum(reduced_amount) filter (where invoice_status = 'valid'), 0) as reduced_amount,
    coalesce(sum(paid_amount) filter (where invoice_status = 'valid'), 0) as paid_amount,
    coalesce(sum(unpaid_amount) filter (where invoice_status = 'valid'), 0) as unpaid_amount,
    bool_or(month_closed) as month_closed,
    bool_or(invoice_status = 'valid' and payment_status = 'overdue') as any_overdue,
    bool_or(invoice_status = 'valid' and payment_status = 'partial') as any_partial
  from lines
  group by contract_id, operator_id, building_id, billing_month
)
select
  m.*,
  coalesce(op.amount, 0) as overpaid_amount,
  case
    when m.all_cancelled then 'cancelled'
    when m.unpaid_amount > 0 and m.any_overdue then 'overdue'
    when m.unpaid_amount > 0 and (m.any_partial or m.paid_amount > 0) then 'partial'
    when m.unpaid_amount > 0 then 'not_due'
    when coalesce(op.amount, 0) > 0 then 'overpaid'
    else 'paid'
  end::public.payment_status as payment_status
from months m
left join lateral (
  select sum(a.amount) as amount
  from public.payment_allocation a
  where a.contract_id = m.contract_id and a.overpaid_month = m.billing_month and a.status = 'valid'
) op on true;
comment on view public.contract_month_status_v is 'Contract × billing month totals and 납부상태 including 과납 (§3.2).';

create view public.contract_balance_v with (security_invoker = true) as
select
  b.*,
  greatest(0, -b.receivable_balance) as overpayment_amount
from (
  select
    c.id as contract_id,
    c.operator_id,
    c.building_id,
    coalesce(sum(case when e.account = 'receivable'
                      then case e.side when 'debit' then e.total_amount else -e.total_amount end end), 0)
      as receivable_balance,
    coalesce(sum(case when e.account = 'security_deposit'
                      then case e.side when 'credit' then e.total_amount else -e.total_amount end end), 0)
      as security_deposit_balance
  from public.contract c
  left join public.ledger_entry e on e.contract_id = c.id
  group by c.id, c.operator_id, c.building_id
) b;
comment on view public.contract_balance_v is '매출채권 잔액 (= 미납액; < 0 = 과납), 임대보증금 잔액, from the ledger only.';

create view public.vacancy_rate_v with (security_invoker = true) as
select
  b.id as building_id,
  b.operator_id,
  count(s.unit_id) as total_units,
  count(s.unit_id) filter (where s.status = 'vacant') as vacant_units,
  count(s.unit_id) filter (where s.status = 'occupied') as occupied_units,
  count(s.unit_id) filter (where s.status = 'non_operating') as non_operating_units,
  round(
    (count(s.unit_id) filter (where s.status = 'vacant'))::numeric * 100
    / nullif(count(s.unit_id) - count(s.unit_id) filter (where s.status = 'non_operating'), 0),
    1) as vacancy_rate_pct
from public.building b
left join public.unit_status_v s on s.building_id = b.id
group by b.id, b.operator_id;
comment on view public.vacancy_rate_v is '공실률 = 공실 ÷ (전체 − 비운영중) (§4.5). Pending contracts count as vacant.';

create view public.history_v with (security_invoker = true) as
select h.*
from public.history_header h
where not exists (select 1 from public.history_deletion d where d.history_id = h.id);
comment on view public.history_v is 'REC-1 list: history rows without a 삭제 기록.';


-- =============================================================================
-- 23. Row level security
--     Operator-scoped:  operator_id = current operator
--     Building-scoped:  … and building_id in accessible buildings
--     Directory tables (tenant, owner, broker, aliases) are operator-wide (design D5).
-- =============================================================================

alter table public.operator enable row level security;
create policy operator_select on public.operator for select to authenticated
  using (id in (select private.my_operator_ids()) or (select private.is_system_operator()));

alter table public.user_account enable row level security;
create policy user_account_select on public.user_account for select to authenticated
  using (
    id = (select private.current_user_id())
    or id = private.system_actor_id()
    or (select private.is_system_operator())
    or id in (
      select m.user_id from public.operator_membership m
      where m.operator_id = (select private.current_operator_id())));

alter table public.operator_membership enable row level security;
create policy operator_membership_select on public.operator_membership for select to authenticated
  using (
    operator_id = (select private.current_operator_id())
    or user_id = (select private.current_user_id())
    or (select private.is_system_operator()));

alter table public.building enable row level security;
create policy building_select on public.building for select to authenticated
  using (operator_id = (select private.current_operator_id())
         and id in (select private.accessible_building_ids()));

-- Operator-scoped tables
alter table public.owner enable row level security;
create policy owner_select on public.owner for select to authenticated
  using (operator_id = (select private.current_operator_id()));

alter table public.tenant enable row level security;
create policy tenant_select on public.tenant for select to authenticated
  using (operator_id = (select private.current_operator_id()));

alter table public.tenant_payer_alias enable row level security;
create policy tenant_payer_alias_select on public.tenant_payer_alias for select to authenticated
  using (operator_id = (select private.current_operator_id()));

alter table public.broker enable row level security;
create policy broker_select on public.broker for select to authenticated
  using (operator_id = (select private.current_operator_id()));

alter table public.bank_column_mapping enable row level security;
create policy bank_column_mapping_select on public.bank_column_mapping for select to authenticated
  using (operator_id = (select private.current_operator_id()));

-- Building-scoped tables (same policy shape on each)
do $$
declare
  v_table text;
begin
  foreach v_table in array array[
    'building_assignment', 'building_wing', 'management_contract', 'common_facility', 'unit',
    'building_ownership', 'charge_item', 'unit_meter_setting',
    'contract', 'contract_rent_free_item', 'contract_signatory', 'contract_agent', 'contract_contact',
    'contract_hvac_unit', 'vehicle', 'rent_change_schedule', 'recurring_charge',
    'month_close', 'settlement_round', 'settlement_round_item', 'utility_bill', 'meter_reading',
    'allocation_adjustment', 'manual_settlement_amount', 'proration_override', 'settlement_result',
    'invoice', 'invoice_line', 'adhoc_charge',
    'bank_import', 'bank_import_row',
    'deposit', 'carryover', 'carryover_bucket', 'payment_allocation', 'refund', 'late_fee_settlement',
    'ledger_entry']
  loop
    execute format('alter table public.%I enable row level security', v_table);
    execute format(
      'create policy %I on public.%I for select to authenticated using ('
      || 'operator_id = (select private.current_operator_id()) '
      || 'and building_id in (select private.accessible_building_ids()))',
      v_table || '_select', v_table);
  end loop;
end;
$$;

-- Tables where building_id may be NULL (operator-level rows)
alter table public.history_header enable row level security;
create policy history_header_select on public.history_header for select to authenticated
  using (operator_id = (select private.current_operator_id())
         and (building_id is null or building_id in (select private.accessible_building_ids())));

alter table public.history_detail enable row level security;
create policy history_detail_select on public.history_detail for select to authenticated
  using (operator_id = (select private.current_operator_id())
         and (building_id is null or building_id in (select private.accessible_building_ids())));

alter table public.history_deletion enable row level security;
create policy history_deletion_select on public.history_deletion for select to authenticated
  using (operator_id = (select private.current_operator_id())
         and (building_id is null or building_id in (select private.accessible_building_ids())));

alter table public.notification_log enable row level security;
create policy notification_log_select on public.notification_log for select to authenticated
  using (operator_id = (select private.current_operator_id())
         and (building_id is null or building_id in (select private.accessible_building_ids())));

alter table public.document enable row level security;
create policy document_select on public.document for select to authenticated
  using (operator_id = (select private.current_operator_id())
         and (scope_building_id is null or scope_building_id in (select private.accessible_building_ids())));

-- private tables: RLS on, no policies, no grants (reachable only through definer functions)
alter table private.security_log enable row level security;
alter table private.enum_label enable row level security;
alter table private.field_label enable row level security;
alter table private.action_permission enable row level security;


-- =============================================================================
-- 24. Grants
--     authenticated: SELECT only. Every write goes through a SECURITY DEFINER RPC.
-- =============================================================================

revoke all on all tables in schema public from anon, authenticated;
grant select on all tables in schema public to authenticated;

alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public grant select on tables to authenticated;
alter default privileges in schema public revoke execute on functions from public, anon;

-- Append-only tables: even service_role may not rewrite history (§7.7.4)
revoke update, delete, truncate on
  public.history_header, public.history_detail, public.history_deletion, public.meter_reading,
  public.allocation_adjustment, public.invoice_line, public.carryover_bucket, public.refund,
  public.late_fee_settlement, public.ledger_entry
from service_role;
-- the email worker records results (pending → sent | failed, enforced by trigger) but never deletes
revoke delete, truncate on public.notification_log from service_role;

-- private: nothing by default; only the helpers RLS policies and views call
revoke all on all tables in schema private from public, anon, authenticated, service_role;
revoke execute on all functions in schema private from public, anon, authenticated;
grant execute on function
  private.today_kst(),
  private.system_actor_id(),
  private.current_user_id(),
  private.current_operator_id(),
  private.current_member_role(),
  private.is_super_admin(),
  private.is_system_operator(),
  private.my_operator_ids(),
  private.accessible_building_ids(),
  private.can_access_building(uuid),
  private.actor_id()
to authenticated, service_role;
