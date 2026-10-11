# CHANGE ORDER NO. 1

**To:** Software Development Agreement dated August 24, 2026 (the "**Agreement**") and its
Attachment A, Statement of Work (the "**SOW**")

**Between:** THEONHOUSE INC. (the "**Client**") and POSITIVE THINKING PRESS INC. (the "**Developer**")

**Effective Date of this Change Order:** October 12, 2026

Issued under Section 4 (Change in Specifications) of the Agreement and Section 1.4
(Scope Adjustment Clause) of the SOW. Capitalized terms not defined here have the meanings
given in the Agreement.

---

## Background

The Client's leasing business has moved from residential to commercial buildings. The functional
specification named as the baseline reference in SOW §4.2 describes a residential system and is no
longer a usable basis for development. The Developer has rewritten the specification for commercial
leasing. This Change Order records the resulting changes to the baseline documents, the delivery
phases, the deliverables, the schedule and the payment terms.

---

## 0. Definitions — "Phase" and "Stage"

The Agreement uses the word "Phase" in two different senses: in the Agreement §1 table it names a
stage of work, while in SOW §7 it names a division of functionality. This Change Order separates
the two terms, which apply throughout the Agreement, the SOW and all future change orders.

**0.1 "Phase"** means a delivery phase — a division of the functionality to be built. There are two:
Phase 1 and Phase 2, defined in Section 2.

**0.2 "Stage"** means a stage of work. There are four, being the rows of the Agreement §1 table:
Stage 1 Planning and Analysis, Stage 2 Design, Stage 3 Development, Stage 4 Testing and Handover.

**0.3** Each Phase passes through all four Stages. Accordingly, in Agreement §2.1:

- **"1st Phase Delivery"** is renamed **"Stage 1 Delivery"** and means delivery of the Stage 1
  (Planning and Analysis) deliverables listed in Section 3.
- **"Final Delivery"** is renamed **"Phase 1 Final Delivery"** and means completion of Stages 2
  through 4 for Phase 1, including the source code, deployment, tests and the administrator
  operations manual.

---

## 1. Baseline Documents

**1.1** The functional specification named in SOW §4.2
(`Rental_Management_System_Functional_Specification_Final.pdf`) is replaced by the **BRIKKA
Functional Specification, version 1.5 dated October 7, 2026**, consisting of fourteen Markdown
documents (`00_문서안내.md` through `12_2차범위.md` and `부록_화면일람표.md`)
(the "**Specification**").

**1.2** The Figma specification link named in SOW §4.1 is replaced by the interactive mock-up
maintained by the Developer and delivered in dated editions (the "**Mock-up**").

**1.3** Where the Mock-up and the Specification differ, the Specification governs. Revisions to the
Specification are made under Agreement §4; the version history in `00_문서안내.md` identifies the
current version.

---

## 2. Delivery Phases

The functionality under the Agreement is divided into two delivery phases.

**2.1 Phase 1 — Administrative back-office, 35 screens.** As listed in the Specification's screen
index: Building 4, Contract 4, Billing and Collection 10, User and Account 7, System 2, and
Documents / History / Reporting 8. Phase 1 includes the database schema, multi-tenant isolation
enforced at the database level, permissions, calculation logic, deployment of development and
production environments, automated tests, Excel/PDF report generation, and the administrator
operations manual.

**2.2 Phase 2 — 42 screens and two further items.** Tenant Portal 12, Notification Centre 13,
Landlord Portal 7, Facilities and Reservation 4, Service Requests 3, Permission Management 2, and
Automated Collection 1; together with the Landing Page design and development (SOW §§1.1–1.2) and
the Virtual Account (가상계좌) payment gateway integration (SOW §6.c).

**2.3** SOW §7 (Phase 1 Scope Baseline) is deleted and replaced by Sections 2.1 and 3 of this
Change Order.

**2.4** Phase 2 is not scheduled or priced by this Change Order. Its content, schedule and fee shall
be agreed between the parties in a separate agreement or change order.

---

## 3. Stage 1 Delivery (revised)

Delivery date **November 13, 2026**; inspection **November 16–27, 2026**. Both unchanged from
Agreement §2.1.

| # | Agreement §1 reference | Deliverable | Format |
|---|---|---|---|
| ① | Functional Requirement Specifications | BRIKKA Functional Specification v1.5 | PDF |
| ② | Database Design (ERD & Table Specs) | Database design document — ERD and table specifications | PDF |
| ③ | System Menu Architecture & Wireframes | Menu structure (Specification §3.8), screen index (77 screens), and the Mock-up | PDF and HTML |
| ④ | *(added by this Change Order)* | Phase division table — Phase 1 and Phase 2, with the basis for each allocation | PDF |

Stage 2 (Design) is satisfied by the Mock-up. No Figma source files will be delivered.

---

## 4. Schedule (revised)

**4.1** The schedule in Agreement §2.1 is amended as follows, and applies to Phase 1 as renamed by
Section 0.3:

| Milestone | Original | Revised |
|---|---|---|
| Contract Period | Sept 1, 2026 – Jan 29, 2027 | **Sept 1, 2026 – Feb 28, 2027** |
| Stage 1 Delivery | Nov 13, 2026 | Nov 13, 2026 *(unchanged)* |
| Stage 1 Inspection | Nov 16 – Nov 27, 2026 | Nov 16 – Nov 27, 2026 *(unchanged)* |
| Phase 1 Final Delivery | Jan 15, 2027 | **Feb 12, 2027** |
| Phase 1 Final Inspection | Jan 18 – Jan 29, 2027 | **Feb 15 – Feb 26, 2027** |

**4.2 Capacity assumption.** The dates above assume development capacity of not less than one
hundred twenty (120) hours per calendar month from the Effective Date of this Change Order until
Phase 1 Final Delivery. The Client acknowledges that this is the condition on which the revised
schedule is based.

**4.3 Re-baselining.** Within ten (10) business days after acceptance of deliverable ② (Database
Design), the Developer shall provide the Client with a screen-level effort estimate for Phase 1. If
that estimate, or the capacity actually available, is inconsistent with the dates in Section 4.1,
the parties shall agree a revised Phase 1 Final Delivery date by further change order. Any revised
date extends the Contract Period and the Phase 1 Final Inspection window correspondingly.

---

## 5. Client Decisions Outstanding

**5.1** The parties record that the following Client decisions were requested by the Developer and
remain outstanding as of the Effective Date of this Change Order:

| Item | Requested | Work blocked |
|---|---|---|
| Legal review of personal information handling (privacy policy obligation, retention periods, masking standard) | 2026-09-24 | Database schema design |
| Tax treatment of corrected tax invoices on credit adjustments | 2026-10-08 | Ledger structure and screen design |
| Whether rent and management-fee bank accounts are operated separately | 2026-10-08 | Payment allocation rules |

**5.2** Under Agreement §2.3, delivery dates are extended day-for-day by the period of any Client
delay. For the items above, the delay period runs from the request date recorded in the Developer's
weekly report until the Client's written response.

---

## 6. Warranty

The twelve (12) month warranty under Agreement §6 runs from the Go-Live date of Phase 1 and is
unchanged by this Change Order. The Developer may discharge it through a separate maintenance
arrangement of its own; this does not alter the Developer's obligation to the Client under
Agreement §6. Phase 2 carries its own warranty period running from its own Go-Live, to be set in
the change order that schedules Phase 2.

---

## 7. Fees and Payment

**7.1** The total fee of CAD $42,000.00 under Agreement §3.1 is unchanged and constitutes the fee
for **Phase 1 in its entirety** — that is, Stages 1 through 4 for Phase 1, including the planning
deliverables, the Mock-up, the source code for all 35 screens, deployment, automated tests and the
administrator operations manual.

**7.2** The parties record that the advance down payment of CAD $21,000.00 under Agreement §3.2 has
been paid by the Client and received by the Developer. The outstanding balance is CAD $21,000.00.

**7.3** Agreement §3.2 is amended so that the outstanding balance of CAD $21,000.00 is payable
within ten (10) days after Final Acceptance of **Phase 1**.

**7.4** No payment falls due on acceptance of the Stage 1 deliverables. The two-instalment structure
of Agreement §3.2 is otherwise unchanged, and the remittance terms and late interest in
Agreement §§3.3–3.4 continue to apply.

**7.5** The fee for Phase 2 is not included in the amount in Section 7.1 and shall be agreed
separately under Section 2.4.

---

## 8. Related Party

The parties acknowledge that both are under common control and that this Change Order is a
related-party transaction. Each party shall record it in its own books and retain it as supporting
documentation for accounting and tax purposes in its own jurisdiction.

---

## 9. No Other Changes

Except as expressly amended by this Change Order, all terms of the Agreement and the SOW remain in
full force and effect, including Agreement §2.2 (deemed acceptance), §5 (intellectual property),
§7 (confidentiality), §8 (liquidated damages) and §10 (governing law and jurisdiction).
