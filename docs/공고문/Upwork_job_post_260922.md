# Upwork Job Post — BRIKKA Phase 1, Stage 1 (Architecture)

Category: Full Stack Development · Drafted 2026-09-22

> Scope: schema design, project scaffold, one reference implementation slice, and a
> handover package. The remaining screens are built in-house afterward.
> Full-build post is kept at `_참고_전체개발_공고안_260922.md` (not in use).
>
> 예산 배분 (CAD 20,000 ≈ USD 14,600)
>
> | 단계 | 내용 | USD |
> |---|---|---|
> | 1 (본 공고) | 설계 · 참조 구현 · 인계 자료 | 7,000 |
> | 2 | 청구·원장 참조 구현 + 검토 | 4,500 |
> | 3 | 보안 · 배포 검수 | 3,000 |
> | | 합계 | **14,500** |

---

## 1. Title

```
Canada-based only — Schema design + reference implementation (Next.js, Supabase, RLS)
```

---

## 2. Skills

```
PostgreSQL
Supabase
Database Architecture
Next.js
TypeScript
```

---

## 3. Project size

```
Medium
```

---

## 3a. How long will your work take?

```
1 to 3 months
```

---

## 4. Experience level

```
Expert
```

---

## 5. Contract-to-hire

```
No, not at this time
```

---

## 6. Rate

```
Fixed price

$7,000.00 (USD)
```

Milestones

| # | Deliverable | Amount |
|---|---|---|
| 1 | Schema design + architecture decisions, reviewed and agreed | $2,000 |
| 2 | Project scaffold + reference implementation slice | $3,000 |
| 3 | Handover package — docs, seed data, tests, walkthrough | $1,500 |
| 4 | Two weeks of follow-up questions (10 hours) | $500 |

All Upwork amounts are in **US dollars**, not Canadian dollars.

---

## 6a. Talent preferences — Location

```
Location:  Canada  (only)
```

Set this in the **Talent preferences / Freelancer location** section of the job post form.
The platform filter alone does not prevent applications from outside the selected region —
keep the statements in the title and description as well.

---

## 7. Description

> ### Canada-based freelancers only
>
> I'm a one-person company based in Canada, and I work with freelancers located in
> Canada. It keeps contracting, invoicing, and business hours straightforward.
>
> **Applications from outside Canada will not be reviewed.** Please don't apply if you
> aren't currently based in Canada — it saves us both the time.

### What this is

This is a focused architecture engagement, not a full build.

I need someone experienced to design the database schema, set up the project structure, and build **one complete feature slice** that the rest of the application will be modeled on.

Here's the part you should know up front: **I'm a one-person company and I am not a developer.** I'll be building the remaining screens myself, with AI coding tools, following the patterns you establish.

That changes what good work looks like here. The schema and the reference slice have to be clear enough that someone can extend them without you in the room — and the written material you leave behind is as much a deliverable as the code.

### The product

A back-office system for managing commercial office buildings — currently run on spreadsheets. It handles the monthly cycle: reading utility meters, allocating shared costs across units, issuing invoices, matching bank deposits against what's owed, and closing the books each month.

Phase 1 is 35 screens, admin-facing only. I manage 5 buildings and about 100 units today.

### The spec is already written

This is not a "I have an idea" project. Over the past several weeks I produced a complete functional specification — 12 documents covering:

- **35 screens**, each with input/output fields, behavior rules, and the reasoning behind each decision
- **Calculation rules** with worked examples — utility cost allocation, pro-rated rent, late fees, rounding
- **Data requirements** — entities, attributes, relationships, integrity rules
- **Non-functional requirements** — security, permissions, backup targets, performance

You'll be designing against a finished spec, not guessing. The spec is currently in Korean; I'll provide an English translation along with a glossary of domain terms.

### Deliverables

**1. Database schema**
Tables, relationships, indexes, constraints, and migrations. Includes **row-level security policies** for multi-tenant isolation.

**2. Project scaffold**
Folder structure, configuration, Supabase integration (auth, storage), and a working deployment pipeline.

**3. Reference implementation — one complete slice**
The building module (list, create, detail — 3 screens), built end to end:
- Authentication and authorization, checked server-side
- Tenant isolation enforced at the database level
- Typed data access
- Error handling and validation
- Tests

I picked this module deliberately: it's where the permission model first applies. A building belongs to an operating company, and an administrator only sees the buildings assigned to them. Getting this one right means the other 32 screens have a pattern to follow.

**4. Handover package**

This is a first-class deliverable, not an afterthought. It's how the project survives after you hand it over.

- **README.md** — everything needed to go from a fresh machine to a running local environment. Environment variables, database setup, how to run and deploy. Written for someone who is not a developer.
- **CLAUDE.md** (or AGENTS.md) — a rules file for AI coding tools. Project conventions, naming, the patterns to follow, and the things that must never be done (bypassing tenant isolation, mutating ledger records, and so on). I'll be building with AI assistance, so this file does real work.
- **Architecture decisions** — short notes on why the schema is shaped the way it is. What you considered and rejected. Enough that a future developer doesn't undo your reasoning by accident.
- **Type generation** — a scripted path from schema to TypeScript types, so they stay in sync when the schema changes. This matters more than usual: accurate types are what keep an AI assistant from inventing columns that don't exist.
- **Isolation tests** — automated tests proving that one operating company cannot read another's data. I need to be able to run these myself after adding new screens.
- **Walkthrough recording** — one screen-share video (an hour is plenty) walking through the schema, the reference slice, and the reasoning.

**5. Two weeks of follow-up**
Up to 10 hours of questions after handover, while I'm getting started on the rest.

### The part that matters most

**Multi-tenant isolation.** Several property management companies will share one deployment, and their data must never cross. I want this enforced with row-level security at the database level, not by remembering to add a WHERE clause in every query.

I'll be running three operating companies from day one — one with real data, two with test data — so this isn't theoretical. It has to work from the start.

This matters more than usual here: **I can't audit this myself.** That's why the automated isolation tests are part of the deliverables — so I can keep checking it as I add screens.

If you've built this before, tell me how you verified it actually held.

### Who I'm looking for

- You've designed schemas for systems that handle money — invoicing, payments, ledgers, reconciliation
- You've implemented row-level security or equivalent tenant isolation in production
- You write code and documentation other people can read and extend. This engagement is explicitly about leaving something behind
- You're comfortable working from a written spec

### After this engagement

There will likely be follow-up work, budgeted separately:

- A **billing and ledger reference implementation** plus review, once the basic screens are in place. That part of the system handles money and I don't intend to build it unsupervised.
- A **security and deployment review** before launch.

This engagement stands on its own, but I'd rather keep working with the same person if it goes well.

### When you apply, please tell me

1. **Which city and province are you based in?** (Canada-based applicants only.)
2. **Have you implemented tenant isolation in a shared database?** How did you do it, and how did you verify it actually worked?
3. **A schema you designed for a system that handled money.** What was the hardest modeling decision?
4. **Anything about this arrangement that concerns you** — including the part where a non-developer builds the rest with AI tools.

I read proposals carefully. Please skip the generic template.
