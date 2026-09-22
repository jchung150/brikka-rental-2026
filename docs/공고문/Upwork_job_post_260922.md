# Upwork Job Post — BRIKKA Phase 1

Category: Full Stack Development · Drafted 2026-09-22

---

## 1. Title

```
Build a commercial property management back-office (Next.js + Supabase)
```

---

## 2. Skills

```
Next.js
PostgreSQL
Supabase
TypeScript
Database Design
```

---

## 3. Project size

```
Large
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
Hourly

From   $60.00 /hr
To    $100.00 /hr
```

---

## 7. Description

### Project

We're building a back-office system for managing commercial office buildings — work that's currently done in spreadsheets. The system handles the full monthly cycle: reading utility meters, allocating shared costs across units, issuing invoices, matching bank deposits against what's owed, and closing the books each month.

This is a ground-up build. There's no legacy code to work around.

### What makes this different: the spec is already written

We've spent the past several weeks producing a complete functional specification — 12 documents covering:

- **35 screens**, each with input/output fields, behavior rules, and the reasoning behind each decision
- **Calculation rules** with worked examples — utility cost allocation, pro-rated rent, late fees, rounding
- **Data requirements** — entities, attributes, relationships
- **Non-functional requirements** — security, permissions, backup targets, performance

You won't be guessing what to build. Interactive mockups of the main screens will also be ready before development starts.

The spec is currently in Korean and will be translated into English, along with a glossary of domain terms, before the project begins.

### Stack

- Next.js 15 (App Router), React 19, TypeScript
- PostgreSQL via Supabase — auth, file storage, row-level security
- Cloudflare in front

The stack is settled, but not rigid. If you have a strong case for a different approach in a specific area, we'll hear it.

### Scope — Phase 1

Admin back-office only. Tenant and landlord portals are Phase 2.

- Buildings and units
- Leases — creation, renewal, termination, deposit handling
- **Billing** — charge schedules, invoice generation, utility cost allocation across units, monthly close
- **Payments** — bank statement upload, payer-name matching, allocation across open charges
- Reporting, document storage, audit history

### Who we're looking for

**First: you've built systems that handle money.** Invoicing, payments, ledgers, reconciliation — something where being off by a dollar is a real problem, not a rounding detail. This system does pro-rated rent, utility allocation across units with adjustable weights, VAT back-calculation, and rounding rules that have to reconcile to the cent. "Close enough" doesn't work here.

**Second: multi-tenancy.** Several property management companies will share one deployment, and their data must never cross. We plan to enforce this at the database level with row-level security rather than relying on application queries. If you've done this, tell us how.

**Third: you work well from a written spec.** We've documented this thoroughly so we're not on calls all day. We're available when you need us, but we're looking for someone who reads the spec, makes reasonable calls, and flags the places where the spec is genuinely ambiguous.

We're based in Canada and looking for someone in Canada as well.

### Engagement

Hourly, expected to run several months. There's likely ongoing maintenance after launch, and a Phase 2 (42 additional screens — tenant portal, landlord portal, notifications, payment gateway integration) if Phase 1 goes well.

### When you apply, please tell us

1. **A system you built that handled money.** What did it do, and what was the hardest part to get right?
2. **Have you isolated customer data in a shared database?** Row-level security or another approach — how did you do it, and how did you verify it worked?
3. **Anything in the scope above that concerns you**, or that you'd approach differently.

We read proposals carefully. Please skip the generic template.
