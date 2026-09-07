# CLAUDE.md — BRIKKA (브리카) 임대 관리 플랫폼

> Working reference for agent sessions. Reflects the code **as it actually is** (audited), not
> only what `README.md` claims. Where README and code disagree, this file follows the code and
> says so. Items marked **[?]** are uncertain — confirm with the user before acting on them.

---

## 1. Project overview

BRIKKA is a Korean rental-property management platform run as a Turborepo + pnpm monorepo.
Three apps: **`apps/web`** (port 3000) — public brand/landing site with a tour-booking (투어 예약)
flow; **`apps/admin`** (port 3001) — the admin back-office *plus* the landlord and tenant portals,
all in one Next.js app branching on `UserRole`; **`apps/email`** (port 3003) — React Email preview
server. Domain: buildings → units → leases → billing schedules → bills → payments, with requests
(민원/수선), notifications, documents and audit history layered on top. All user-facing copy is
Korean; DB comments and enums are Korean-annotated.

---

## 2. Stack & architecture

- **Next.js 15 / React 19**, App Router, Server Components by default. Mutations and most reads go
  through **Server Actions** in `@actions/`, not API routes. The only route handler is
  `apps/admin/app/api/auth/[...nextauth]/route.ts`.
- **Prisma + PostgreSQL**. Schema: `packages/database/prisma/schema.prisma` (~1160 lines, ~35
  models). Client generated to `packages/database/generated/client`.
  - `relationMode = "prisma"` → **no DB-level FKs**; referential integrity is the app's job.
  - All PKs are `BigInt`. All timestamps `@db.Timestamptz`, dates `@db.Date`.
  - `pnpm migrate` = `prisma format && generate && db push`. There is **no migrations directory** —
    schema changes are pushed, not migrated. Treat schema edits as destructive-capable.
- **NextAuth v5**, JWT sessions, Credentials provider (`apps/admin/auth.ts`).
  `apps/admin/middleware.ts` matcher excludes `api`, `_next/*`, `favicon.ico`, `login`.
- **Tailwind v4 + shadcn/ui** via `@repo/design-system`. **TanStack Query** for client-side fetching
  (`apps/admin/@hooks/use-*.tsx`). **Biome + Ultracite** for lint/format (`pnpm lint`, `pnpm format`).
- **Path aliases** (`apps/*/tsconfig.json`): `@/*` → app root, `@repo/*` → `packages/*`. Packages have
  no `exports` map, so **deep imports are the convention**: `@repo/common/types`,
  `@repo/design-system/components/ui/button`, `@repo/database/generated/client`.
- **Shared packages**: `@repo/database` (only DB entrypoint), `@repo/common` (`types.ts` = `Result`/
  `Paged`/error codes, `formatters.ts`, `strings.ts` = enum→Korean labels, `constant.ts`),
  `@repo/design-system`, `@repo/email` (Resend), `@repo/seo`, `@repo/analytics`, `@repo/next-config`,
  `@repo/typescript-config`, `@repo/editor` (**unused — see §3**).

---

## 3. Current state

### 3.1 Solid — safe to build on

| Area | Notes |
|---|---|
| `apps/web` landing + booking | home / `living` / `office` / `book`. Content from static `apps/web/@data/*.ts`. Booking is wired end-to-end: `book-form/` → `@actions/contacts/createContact` → `contacts` table; slot times driven by `ContactConfig` via `getContactConfig()`. |
| Prisma schema | Complete and coherent; the most reliable artifact in the repo. Use it as the source of truth over the README's model diagram. |
| `@repo/common` types/formatters | `Result`, `Paged`, `ERROR_CODES`, `formatters`, `Strings`. (One label bug — §3.3.) |
| `@repo/design-system` | shadcn set + fonts + theme providers. Fine to extend. |
| admin: buildings | list, detail w/ tabs (summary/units/documents/requests), facilities, parking, appliances-furniture, ownership. Full CRUD actions. |
| admin: leases | list w/ filters, large `leases/new` registration form, detail w/ tabs. `createLease` is the most complete action in the repo (transaction + related-entity creation). |
| admin: requests / contacts / users lists / dashboard / profile | Real pages backed by real actions. `dashboard/page.tsx` (~307 lines) runs genuine aggregate queries. |
| admin login (ADMIN path) | `components/form/login-form.tsx` → `@actions/auth/signIn` → real password verify. |

### 3.2 Stubbed / partial / not built

**14 pages are literal `return <></>`** under `apps/admin/app/(private)/`:
`contract`, `contracts`, `delegation`, `documents`, `homepage`, `notices`, `notifications`,
`notifications/history`, `notifications/send`, `notifications/settings`, `portal`, `profile/edit`,
`reports`, `settlements`.
`billing/[slug]/page.tsx` renders the raw slug string.

Consequences:
- **Landlord portal** (portal / delegation / contracts / notices / reports) and **tenant portal**
  (portal / contract / settlements / notifications / notices / profile-edit) are entirely empty.
  Every sidebar item they emit lands on a blank page. `/requests` is the one exception and it
  renders the *admin* table with **no ownership scoping**.
- **Tenant/landlord login does not work at all.** Both
  `apps/admin/components/form/tenant-login-form.tsx` and `apps/web/components/login-form.tsx` have
  `onSubmit = (values) => console.log(values)`. The web one also has a copy-pasted second field
  (labelled 이메일, no `type="password"`). `apps/web/app/tenant-login/` is an orphan route — the web
  header links to `env.NEXT_PUBLIC_ADMIN_TENANT_LOGIN_URL` instead.

**Billing engine does not exist.** Repo-wide: `bill.create` — 0 call sites; `payment.*` — 0 of any
kind. `billing/bills` and `billing/unpaid` have real tables that will always be empty.
`LeaseBillingSchedule` can be created (`addBillingSchedule`, `createLease`) but nothing consumes it
to issue invoices. Do not assume any invoicing/receipt path exists.

**Notifications do not exist.** All 4 pages stubbed. `AlarmConfig` model: **0** references anywhere.
`LeaseNotificationSetting`: 1. The only real outbound message in the repo is the Resend welcome
email from `createLease`.

**Mock data still shipping in UI**: `leases/[id]/_components/tabs/ledger-tab.tsx` and
`messages-tab.tsx` ("임시 데이터"); `users/components/user-columns.tsx:122` fabricates user status via
`id % 3`; `leases/new/components/new-lease-form.tsx:151` hardcodes `password: 'temp123!'`;
`leases/components/lease-columns.tsx:146` hardcodes the renewal-notice window to 40 days.
~25 `TODO`/`임시` markers, concentrated in billing and requests.

**Returning hardcoded empties**: `@actions/requests/messages.ts → listRequestMessages` returns `[]`
(genuine schema gap — `Message` has no `requestId`); `@actions/lease/getLeaseMessages` returns `[]`
(its "Message 모델이 구현되면" comment is stale — the model exists and `listMessages` uses it).

**Unimplemented filter**: `listLeases` accepts `renewalNoticeFilter` in its zod schema, destructures
it, and never applies it — filtering by it silently returns unfiltered results.

**apps/email** has one preview (`emails/contact.tsx`). `packages/email/templates/` has two templates;
only `tenant-welcome` is ever *sent*, only `contact` has a *preview*. Exactly inverted.

### 3.3 Diverges from README

| README says | Reality |
|---|---|
| Sidebar/access branches on Role | `apps/admin/hooks/use-sidebar-data.ts` switches on `'FACILITY_MANAGER'` / `'GENERAL_MANAGER'` — **not `UserRole` members**. A real `MANAGER` falls through to `getDefaultSidebar()` (홈+프로필 only); `getAdminSidebar()` (~90 lines) is unreachable dead code. |
| 세분화된 권한 (`UserPermissionType`) | Written by `createUser`, **never read**. No permission check exists anywhere in the codebase. |
| `ENCRYPTION_KEY` encrypts 주민등록번호 | `encrypt`/`decrypt`/`safeEncrypt` in `@actions/lib/enc.ts` have **zero call sites**. SSNs are stored and displayed in plaintext (`leases/[id]/_components/tabs/tenant-card.tsx:71`). The env var is required at boot but inert. `maskFormatter.ssn` in `@repo/common/formatters` is misnamed — it inserts a hyphen, it does not mask. |
| `LeaseStatus` = 준비중/진행중/종료 | `@repo/common/strings.ts` labels `PREPARING`→"계약중", `ACTIVE`→"계약완료", `COMPLETED`→"계약종료". Contradicts both the schema comments and README. **[?]** possibly a deliberate product-copy choice — confirm before "fixing". |
| 청구서 발행 / 미납·연체 / 수납 기록 | Not implemented (§3.2). |
| 알림톡/이메일/SMS 발송 · 자동 발송 설정 · 발송 이력 | Not implemented (§3.2). |
| 변경 이력 audit | Split across two models: `ChangeHistory` (documented) and `Log` (undocumented, called **once**, from `createBuilding`). `ChangeHistory` tracking covers only `BUILDING`/`UNIT`/`LEASE`; the `USER`/`BILLING`/`PAYMENT`/`MESSAGE` enum members are never written. |
| env schemas fail at boot if missing | `packages/database/keys.ts` exists but is **never imported**; neither app extends it. `apps/web/env.ts` declares `DATABASE_URL` but omits it from `runtimeEnv`; `apps/admin/env.ts` omits it entirely. Missing `DATABASE_URL` fails at first query, not boot. |
| `packages/email` vars are optional ("사용 시") | `createLease` statically imports `@repo/email`, whose `index.ts` runs `new Resend(keys().RESEND_TOKEN)` at module scope → `RESEND_TOKEN` / `RESEND_FROM` / `USER_PORTAL_URL` are **hard boot/build requirements for `apps/admin`**. |
| `pnpm build` runs `test` first | True in `turbo.json`, but there are **zero test files** and **no workspace defines a `test` script**. `pnpm test` is a no-op. Vitest is an unused root devDependency. |
| `_components/` / `_hooks/` convention | Three conventions coexist in `apps/admin`: `@hooks/` **and** `hooks/`, plus `components/`, `app/(private)/_components/`, and `app/(private)/leases/components/` (no underscore). |

### 3.4 Known gaps and defects

**Authorization — treat the admin app as effectively unauthorized until fixed.**
- `@actions/lib/auth.ts → requireRole` is `async`. **All 26 call sites omit `await`**:
  `if (!requireRole('ADMIN'))` — `!Promise` is always `false`, so every guard body is unreachable.
  `history/listChangeHistories.ts:16` does `await requireRole('MANAGER')` and discards the boolean.
  Server Actions are public HTTP endpoints, so these are open.
- **No auth reference at all**: `contacts/{createContact,updateContact,deleteContact,updateContactConfig}`,
  `lease/addBillingSchedule`, `requests/{updateRequest,deleteRequest}`,
  `units/{createUnit,updateUnit,deleteUnit}`, `users/updateUser`, `documents/deleteDocument`.
- Worst three: `users/updateUser` (no auth, no validation, raw
  `Prisma.UserUncheckedUpdateInput` → anyone can set any `passwordHash`/`userRole`);
  `users/createUser` (accepts `userRole`+`permissions`, broken gate → anyone can mint an ADMIN);
  `aws.ts → resolveFileURL` (private-file branch gated *only* by the broken `requireRole`, never
  calls `auth()` → presigned GET for any private S3 object by numeric id).
- `auth.ts → authorize()` **verifies nothing** — it returns whatever `userId`/`userRole` the caller
  posts. Password checking lives in the `signIn` *action*, but `/api/auth/callback/credentials` is
  public and the middleware matcher excludes `api`.
- **Fixing `await` alone is not enough**: every gate asks for `'ADMIN'` specifically, so awaiting
  them would lock out all `MANAGER` users. Both changes must land together.

**Functional bugs (each verified, each one-liner-ish):**
- `createBuilding` **always returns `INTERNAL_ERROR` after successfully creating the row** —
  `addLog('BuildingsCreate', { id: building.id })` puts a `BigInt` into `Log.details` (Json column);
  Prisma `JSON.stringify`s it and throws into the outer catch.
- Change history renders garbage: `lib/change-history.ts:20` writes `changes: JSON.stringify(changes)`
  into a `Json` column (double-encoded string), while
  `history/_components/history-columns.tsx:44` reads it as an object via `Object.entries(...)`.
- `createLease` **silently resets the tenant's password** — `tx.user.update({ passwordHash })` runs
  unconditionally inside the transaction, regardless of `sendWelcomeEmail`. A second lease for an
  existing tenant locks them out.
- `signIn.ts:80` redirects every non-ADMIN to `/homepage` — a stub. MANAGER/TENANT/LANDLORD log in
  to a blank screen.
- `book-form/index.tsx` builds `` `...T${hh}:${mm}:00Z` `` from locally-picked KST values → tour
  bookings persist 9 hours off.
- `facilities/index.ts → updateFacility` has no try/catch (throw escapes the action) and an unused
  `const result`.
- `aws.ts → getSignedURL` has `const userId = '';` under a successful `auth()` → S3 uploader
  metadata is always empty.
- `lib/enc.ts:1` is `'server-only';` (a bare string expression, enforces nothing) — should be
  `import 'server-only'`. Same file: `generateSecureToken()` uses `Math.random()`;
  `createSimpleHash()` HMACs with hardcoded `'default-salt'`; `encrypt()` derives its AES key via
  `ENCRYPTION_KEY.padEnd(32,'0').slice(0,32)`.
- `packages/next-config/index.ts` hardcodes a foreign S3 host in `images.remotePatterns`
  (`aluket.s3.ap-northeast-2.amazonaws.com`) unrelated to `NEXT_PUBLIC_AWS_BUCKET` → `next/image`
  will reject uploads from the real bucket. `aws.ts` also hardcodes `region: 'ap-northeast-2'`.
- Dead nav links: ADMIN sidebar → `/billing/payments` (falls into `[slug]`, renders "payments").
- Stale `revalidatePath` targets (no-ops — routes have no `/admin` prefix): `/admin/buildings` ×2,
  `/admin/users`, `/admin/buildings/${id}/units`. Conversely most mutating actions
  (`updateUser`, `updateRequest`, `addBillingSchedule`, all `contacts/*`, `facilities/*`) call
  `revalidatePath` not at all.

**Env gaps — `.env.example` files are unreliable; `env.ts`/`keys.ts` are authoritative.**

| File | Contains | Actually required | Delta |
|---|---|---|---|
| `apps/admin/.env.example` | `DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL` | + `ENCRYPTION_KEY`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET_PRIVATE`, `NEXT_PUBLIC_AWS_BUCKET` (`env.ts`) **and** `RESEND_TOKEN`, `RESEND_FROM`, `USER_PORTAL_URL` (transitive, `packages/email/keys.ts`) | **8 missing** (README flags only 5) |
| `apps/web/.env.example` | `DATABASE_URL`, `NEXT_PUBLIC_WEB_URL` | `DATABASE_URL`, `NEXT_PUBLIC_ADMIN_TENANT_LOGIN_URL`, `NEXT_PUBLIC_KAKAO_APP_JAVASCRIPT_KEY` | 2 missing; `NEXT_PUBLIC_WEB_URL` is a **stale extra** used nowhere |
| `packages/email` | *(no `.env.example`)* | 3 required vars in `keys.ts` | file missing entirely |
| `packages/editor/.env.example` | `AWS_ACCESS_KEY`, `AWS_SECRET_ACCESS_KEY`, `AWS_BUCKET`, `AWS_REGION`, `NEXT_PUBLIC_CDN_URL` | — | **orphan**; package has no `keys.ts` and is unimported |

`apps/admin/.env.example` also ships a **real-looking `AUTH_SECRET` literal** — must be regenerated.

**Other gaps:**
- `@repo/editor` — fully built (Tiptap + ~10 extensions) and imported by **zero** files. README is
  honest about this. Don't assume any rich-text input path exists.
- **No tests anywhere.** No `*.test.*`, no `vitest.config.*`, no `test` script.
- **Repo is not git-initialised.** `pnpm clean` and the 7 per-package `clean` scripts all use
  `git clean -xdf` and will fail.
- `packages/analytics` and `packages/editor` have **empty `scripts`** → turbo skips them.
- `apps/email` has no `vercel.json` (web and admin do), though README assumes `apps/*/vercel.json`.
- `apps/admin` declares `@repo/seo` as a dependency and never imports it.
- Root `package.json` is still named `"omniseed"`; `biome.json` declares a `Liveblocks` global —
  both starter-template leftovers.
- An untracked 1.7 MB file named `스키마정의서` sits at repo root, unreferenced. **[?]** purpose unknown.

---

## 4. Conventions to follow

### 4.1 Server Actions

Location `apps/<app>/@actions/<domain>/<verbNoun>.ts`, `'use server'` at top, **one order**:

```
입력 검증 (zod)  →  권한 검사  →  도메인 로직 / 트랜잭션  →  캐시 무효화  →  Result<T> 반환
```

```ts
'use server';
import { ERROR_CODES, ERROR_MESSAGES, type Result } from '@repo/common/types';
import { type Prisma, database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { auth } from '@/auth';

export async function createX(input: Input): Promise<Result<{ id: string }>> {
  const parsed = Schema.safeParse(input);
  if (!parsed.success) return { ok: false, code: ERROR_CODES.VALIDATION_ERROR, message: ERROR_MESSAGES.VALIDATION_ERROR };

  const session = await auth();
  if (!session?.user) return { ok: false, code: ERROR_CODES.UNAUTHORIZED, message: ERROR_MESSAGES.UNAUTHORIZED };

  try {
    const x = await database.$transaction((tx) => tx.x.create({ data: parsed.data, select: { id: true } }));
    revalidatePath('/x');                       // real route path — NO '/admin' prefix
    return { ok: true, data: { id: x.id.toString() } };   // BigInt → string
  } catch (e) {
    console.error('[createX] error', e);
    return { ok: false, code: ERROR_CODES.INTERNAL_ERROR, message: ERROR_MESSAGES.INTERNAL_ERROR };
  }
}
```

Rules:
- **Always return `Result<T>`; never throw out of an action.** Never leak raw errors — map to one of
  the six `ERROR_CODES`. Log server-side with `console.error('[actionName] ...', e)`.
- **Import `ERROR_CODES` — do not hardcode code strings.** `Err.code` is typed `code?: string`
  (optional, unnarrowed), so drift is invisible to the compiler. ~half the existing files hardcode
  literals and several use off-spec codes (`'INVALID_CREDENTIALS'`, `'AUTH_ERROR'`,
  `'USER_NOT_FOUND'`, `'INVALID_CURRENT_PASSWORD'`, `'NOT_AUTHORIZED'`). Follow the constants.
- **Return only serializable values.** BigInt → `.toString()`, Date → `.toISOString()`. Map through
  `apps/admin/@data/mapper.ts` DTOs rather than returning raw Prisma payloads.
- **Lists return `Result<Paged<T>>`** with `{ items, page, limit, total, lastPage }`, using
  `take`/`skip`. Index every `where`/`orderBy` column.
- Use `$transaction` for multi-write operations; keep external calls (email, S3) **outside** it.
  Use `include` to avoid N+1; `createMany`/`updateMany` for bulk.
- Don't redefine `Result`/`Ok`/`Err` locally (`@actions/auth/updatePassword.ts` does — don't copy it).

**Known non-compliance — don't take these as precedent:** `history/listChangeHistories`,
`appliances-furniture/get.ts`, `file.ts`, `log/addLog`, `buildings/listBuildings → buildingsForExcel`
return raw values or throw. `aws.ts → getSignedURL` uses a bespoke `{failure} | {success}` shape.
`bills/listBills`, `messages/listMessages`, `dashboard/getDashboardData` and both `apps/web` actions
return raw Prisma entities / BigInt.

**`Paged<T>` is produced but not consumed.** Only 7 actions return it; `listMessages` paginates and
then returns a bare array; `listUsers`/`listTenants`/`listLandlords`/`listContacts`/`listParkingSpace`
don't paginate at all; `listChangeHistories` hardcodes `take: 100`. And the hook layer discards the
envelope — `@hooks/use-requests.tsx` returns only `.items`, forcing
`requests/_components/requests-content.tsx:35` to hardcode `const lastPage = 1`. `use-bills.tsx`
passes the whole `Result` through instead. **If you add pagination, thread it through the hook too.**
`PaginationInput`/`SortInput` in `@repo/common/types` are dead — every list re-declares its own shape.

### 4.2 Prisma / DB

- **Only** `import { type Prisma, database } from '@repo/database'`. Never instantiate `PrismaClient`.
- `relationMode = "prisma"` — enforce referential integrity in code; cascades are Prisma-emulated.
- All ids are `BigInt`: convert at boundaries (`BigInt(id)` in, `.toString()` out).
- **Never put a `BigInt` into a `Json` column** — Prisma `JSON.stringify`s it and throws
  (this is the live `addLog` bug).
- Prefer `select`/`include` with an explicit shape; export the payload type via
  `Prisma.validator<...>()` + `Prisma.XGetPayload<...>` (see `buildings/listBuildings.ts`).

### 4.3 UI

- Base components `@repo/design-system/components/ui/*`; extended `@repo/design-system/components/*`.
- Conditional classes via `cn` from `@repo/design-system/lib/utils`.
- Icons: `lucide-react` primary, `@tabler/icons-react` secondary; default size `w-5 h-5`.
- User feedback: `toast` from `sonner`.
- Enum → Korean labels come from `Strings` in `@repo/common/strings` — **do not inline Korean enum
  labels**. Formatting (currency, area, dates, remaining days) from `@repo/common/formatters`.
- Client data fetching in `apps/admin` goes through `@hooks/use-*.tsx` (TanStack Query) with keys
  from `@hooks/query-keys.ts`.
- Components PascalCase; directories lowercase-hyphen.

### 4.4 Directory structure

- Shared: `_components/`, `_hooks/`, `lib/`. Scoped: `{scope}/_components/`, `{scope}/_hooks/`.
- **Reality check**: `apps/admin` already violates this three ways (`@hooks/` + `hooks/`,
  `leases/components/` without underscore, top-level `components/`). Match the *local* directory you
  are editing rather than mass-relocating files; flag the inconsistency instead of silently fixing it.

---

## 5. Before starting any task

1. **Env: read `apps/*/env.ts` and `packages/*/keys.ts` — never trust `.env.example`.** Every
   `.env.example` in this repo is stale (§3.4). Remember `apps/admin` transitively requires the three
   `RESEND_*`/`USER_PORTAL_URL` vars via `@repo/email`'s module-scope `new Resend(...)`.
2. **Flag before any deploy**: `apps/admin/.env.example` contains a committed real-looking
   `AUTH_SECRET` — regenerate with `openssl rand -base64 32`. `ENCRYPTION_KEY` must also be freshly
   generated **and** note that it currently encrypts nothing (SSNs are plaintext), so rotating it is
   safe today but won't be once encryption is wired up.
3. **Check §3.4 before assuming a guard works.** If your task touches a Server Action, verify whether
   its `requireRole` call is awaited. Don't add a new action using the broken pattern.
4. **Confirm the feature actually exists** before extending it — billing issuance, payments,
   notifications, both portals, and rich-text editing are all absent or stubbed (§3.2).
5. **`pnpm install` state**: `node_modules` is often absent here and there is **no generated Prisma
   client** until `pnpm migrate` (or `pnpm turbo build --filter @repo/database`) runs. Typechecking
   will not work before that.
6. **No git repo** → no `pnpm clean`, no diffing against HEAD, no branch safety net. Confirm with the
   user before destructive edits.
7. **No tests exist.** Don't claim verification you can't perform; say what you did and didn't run.
