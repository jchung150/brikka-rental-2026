# CHANGE ORDER NO. 1

**To:** Software Development Agreement dated August 24, 2026 (the "**Agreement**") and its
Attachment A, Statement of Work (the "**SOW**")

**Between:** THEONHOUSE INC. (the "**Client**") and POSITIVE THINKING PRESS INC. (the "**Developer**")

**Effective Date of this Change Order:** October 10, 2026

Issued under Section 4 (Change in Specifications) of the Agreement and Section 1.4
(Scope Adjustment Clause) of the SOW. Capitalized terms not defined here have the meanings
given in the Agreement.

---

## Background

The Client's leasing business has moved from residential to commercial buildings. The functional
specification named as the baseline reference in SOW §4.2 describes a residential system and is no
longer a usable basis for development. The Developer has rewritten the specification for commercial
leasing. This Change Order records the resulting changes to the baseline documents, the
deliverables, the scope division, the schedule and the payment trigger.

---

## 1. Baseline Documents

1.1 The functional specification named in SOW §4.2 (`Rental_Management_System_Functional_Specification_Final.pdf`)
is replaced by the **BRIKKA Functional Specification, version 1.5 dated October 7, 2026**, consisting
of fourteen Markdown documents (`00_문서안내.md` through `12_2차범위.md` and `부록_화면일람표.md`)
(the "**Specification**").

1.2 The Figma specification link named in SOW §4.1 is replaced by the interactive mock-up maintained
by the Developer and delivered in dated editions (the "**Mock-up**").

1.3 Where the Mock-up and the Specification differ, the Specification governs. Revisions to the
Specification are made under Agreement §4; the version history in `00_문서안내.md` identifies the
current version.

---

## 2. Scope Division

The work under the Agreement is divided into two scopes.

**2.1 Scope A — Administrative back-office, 35 screens.** As listed in the Specification's screen
index: Building 4, Contract 4, Billing and Collection 10, User and Account 7, System 2, and
Documents / History / Reporting 8. Scope A includes the database schema, multi-tenant isolation
enforced at the database level, permissions, calculation logic, deployment of development and
production environments, automated tests, Excel/PDF report generation, and the administrator
operations manual.

**2.2 Scope B — 42 screens and two further items.** Tenant Portal 12, Notification Centre 13,
Landlord Portal 7, Facilities and Reservation 4, Service Requests 3, Permission Management 2, and
Automated Collection 1; together with the Landing Page design and development (SOW §§1.1–1.2) and
the Virtual Account (가상계좌) payment gateway integration (SOW §6.c).

**2.3** SOW §7 (Phase 1 Scope Baseline) is deleted and replaced by Section 3 below.

**2.4** Scope B is not scheduled by this Change Order. Its content, schedule and fee shall be agreed
in a separate change order.

---

## 3. Phase 1 Delivery (revised)

Delivery date **November 13, 2026**; inspection **November 16–27, 2026**. Both unchanged from
Agreement §2.1.

| # | Agreement §1 reference | Deliverable | Format |
|---|---|---|---|
| ① | Functional Requirement Specifications | BRIKKA Functional Specification v1.5 | PDF |
| ② | Database Design (ERD & Table Specs) | Database design document — ERD and table specifications | PDF |
| ③ | System Menu Architecture & Wireframes | Menu structure (Specification §3.8), screen index (77 screens), and the Mock-up | PDF and HTML |
| ④ | *(added by this Change Order)* | Scope division table — Scope A and Scope B, with the basis for each allocation | PDF |

The UI/UX design stage in Agreement §1 (Phase 2) is satisfied by the Mock-up. No Figma source files
will be delivered.

---

## 4. Schedule (revised)

Agreement §2.1 is amended as follows.

| Milestone | Date |
|---|---|
| Contract Period | September 1, 2026 – May 14, 2027 |
| Phase 1 Delivery | November 13, 2026 |
| Phase 1 Inspection | November 16 – November 27, 2026 |
| Scope A Final Delivery | April 30, 2027 |
| Scope A Final Inspection | May 3 – May 14, 2027 |

**4.1 Re-baselining.** Within ten (10) business days after acceptance of deliverable ② (Database
Design), the Developer shall provide the Client with a screen-level effort estimate for Scope A. If
that estimate exceeds the development capacity available before the Scope A Final Delivery date, the
parties shall agree a revised date by further change order. The Scope A Final Delivery date above is
set before any screen-level estimate exists and is subject to this Section.

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

The twelve (12) month warranty under Agreement §6 runs from the Go-Live date of Scope A. Scope B
carries its own warranty period running from its own Go-Live, to be set in the change order that
schedules Scope B.

---

## 7. Fees and Payment

**7.1** The total fee of CAD $42,000.00 under Agreement §3.1 is unchanged and constitutes the fee
for Scope A.

**7.2** Agreement §3.2 is amended so that the final balance of CAD $21,000.00 is payable within ten
(10) days after Final Acceptance of **Scope A**.

**7.3** The fee for Scope B shall be quoted separately and agreed in the change order that schedules
it.

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

---

**IN WITNESS WHEREOF**, the parties have executed this Change Order as of the Effective Date written
above.

| CLIENT | DEVELOPER |
|---|---|
| THEONHOUSE INC. | POSITIVE THINKING PRESS INC. |
| Signature: ______________________ | Signature: ______________________ |
| Name: JUAN CHUNG | Name: JUAN CHUNG |
| Title: Chief Executive Officer | Title: Chief Executive Officer |
| Date: ____________________ | Date: ____________________ |
