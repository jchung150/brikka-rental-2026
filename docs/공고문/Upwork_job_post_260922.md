# Upwork Job Post — BRIKKA Phase 1, Stage 1 (Architecture)

Category: Full Stack Development · Drafted 2026-09-22

> Scope: schema design, project scaffold, and one reference implementation slice.
> The remaining screens are built in-house afterward.
> Full-build post is kept at `_참고_전체개발_공고안_260922.md` (not in use).

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

$6,000.00 (USD)
```

Milestones

| # | Deliverable | Amount |
|---|---|---|
| 1 | Schema design + architecture decisions, reviewed and agreed | $2,000 |
| 2 | Project scaffold + reference implementation slice | $3,000 |
| 3 | Developer guide + handover walkthrough | $1,000 |

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
> We're a Canadian company and we work with freelancers located in Canada. It keeps
> contracting, invoicing, and business hours straightforward.
>
> **Applications from outside Canada will not be reviewed.** Please don't apply if you
> aren't currently based in Canada — it saves us both the time.

### What this is

This is a focused architecture engagement, not a full build.

We need someone experienced to design the database schema, set up the project structure, and build **one complete feature slice** that the rest of the application will be modeled on. Roughly 80 hours of work.

We'll build the remaining screens in-house afterward, following the patterns you establish. We're telling you this up front because it changes what good work looks like here: the schema and the reference slice need to be clear enough that someone can extend them without you in the room.

### The product

A back-office system for managing commercial office buildings — currently run on spreadsheets. It handles the monthly cycle: reading utility meters, allocating shared costs across units, issuing invoices, matching bank deposits against what's owed, and closing the books each month.

Phase 1 is 35 screens, admin-facing only.

### The spec is already written

This is not a "we have an idea" project. Over the past several weeks we produced a complete functional specification — 12 documents covering:

- **35 screens**, each with input/output fields, behavior rules, and the reasoning behind each decision
- **Calculation rules** with worked examples — utility cost allocation, pro-rated rent, late fees, rounding
- **Data requirements** — entities, attributes, relationships, integrity rules
- **Non-functional requirements** — security, permissions, backup targets, performance

You'll be designing against a finished spec, not guessing. The spec is currently in Korean; we'll provide an English translation along with a glossary of domain terms.

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

We picked this module deliberately: it's where the permission model first applies. A building belongs to an operating company, and an administrator only sees the buildings assigned to them. Getting this one right means the other 32 screens have a pattern to follow.

**4. Developer guide**
How to extend the codebase using these patterns. What to avoid. Where the sharp edges are.

### The part that matters most

**Multi-tenant isolation.** Several property management companies will share one deployment, and their data must never cross. We want this enforced with row-level security at the database level, not by remembering to add a WHERE clause in every query.

We'll be running three operating companies from day one — one with real data, two with test data — so this isn't theoretical. It has to work from the start.

If you've built this before, tell us how you verified it actually held.

### Who we're looking for

- You've designed schemas for systems that handle money — invoicing, payments, ledgers, reconciliation
- You've implemented row-level security or equivalent tenant isolation in production
- You write code other people can read and extend. This engagement is explicitly about leaving something behind
- You're comfortable working from a written spec

### After this engagement

There will likely be follow-up work: a review of the billing and ledger logic partway through implementation, and a security and deployment review before launch. Both are separate engagements. This one stands on its own.

### When you apply, please tell us

1. **Which city and province are you based in?** (Canada-based applicants only.)
2. **Have you implemented tenant isolation in a shared database?** How did you do it, and how did you verify it actually worked?
3. **A schema you designed for a system that handled money.** What was the hardest modeling decision?
4. **Anything about this arrangement that concerns you** — including the part where we build the rest in-house.

We read proposals carefully. Please skip the generic template.
