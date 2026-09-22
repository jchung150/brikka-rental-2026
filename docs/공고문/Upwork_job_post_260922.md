# Upwork Job Post — BRIKKA Phase 1

작성일 2026-09-22 · 플랫폼 Upwork · 카테고리 Full Stack Development

---

## 1. Title

**추천안**

```
Build a commercial property management back-office (Next.js + Supabase)
```

대안 2건

```
Full-stack developer for multi-tenant property management system — billing & payments
Build billing and payment reconciliation back-office for commercial real estate
```

> 추천안 선정 이유: 무엇을(property management back-office) 어떤 스택으로(Next.js + Supabase)
> 만드는지가 한 줄에 들어간다. `commercial`을 넣어 주거용 임대 경험자와 구분한다.

---

## 2. Skills

```
Next.js
PostgreSQL
Supabase
TypeScript
Database Design
```

> 목록에 없으면 직접 입력한다. `Web Development`·`API` 같은 광범위한 태그는 지원자 수는 늘리지만
> 적합도를 낮춘다. `PostgreSQL`·`Supabase`는 제외 필터로 작동하므로 유지한다.

---

## 3. Project size

```
■ Large
```

> 1차 35개 화면. 수개월 단위. Medium을 선택하면 단기 작업 기대 지원자가 유입된다.

---

## 4. Experience level

```
■ Expert
```

> 금액 계산 정확성과 운영사 간 데이터 격리가 핵심이다. 두 영역 모두 결함 시 영향이 크고
> 사후 수정 비용이 높다. Intermediate 선택 시 단가는 낮아지나 검수 부담이 증가한다.

---

## 5. Contract-to-hire

```
■ No, not at this time
```

> 정규직 전환 의사가 없는 상태에서 Yes를 선택하면 기대 불일치가 발생한다.
> 장기 관계 가능성(유지보수 계약, 2차 42개 화면)은 본문에 명시하여 동일한 효과를 얻는다.

---

## 6. Rate

```
■ Hourly
   $50.00 /hr  ~  $80.00 /hr (USD)
```

**Hourly를 선택하는 이유**

| | 판단 |
|---|---|
| Fixed price | 목업 단계에서 명세가 변경될 예정이므로 총액 확정이 곤란. 개발자가 위험을 단가에 반영하거나 범위 축소로 대응 |
| Hourly | 대규모·장기 프로젝트의 통상 방식. 주 단위 산출물 확인 가능 |

**제시 구간이 Upwork 평균($25~47)보다 높은 이유**

플랫폼 평균은 전 세계 지원자 기준이다. 캐나다 현지 거주 + Expert 등급 조건에서는
해당 구간에 지원자가 형성되지 않는다. 캐나다 시니어 풀스택 개발자의 통상 구간은
$60~100 USD/hr이며, $50~80은 하단에 해당한다.

$25~47을 제시할 경우 예상되는 결과: 해외 거주 지원자 다수 유입, 캐나다 현지 지원자 부재.

---

## 7. Description

아래 전문을 그대로 붙여 넣는다.

---

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

---

## 부가 메모

**첨부 자료**
현 시점 첨부 없음. 기능정의서는 한국어 원문이므로 영문 요약본(개요·범위·구조) 작성 후
지원자 선별 단계에서 제공한다.

**선별 질문 3건의 의도**

| # | 확인 대상 |
|---|---|
| 1 | 금액 처리 경험의 실재 여부. 경험자는 구체적 난점(반올림·동시성·정정 처리)을 서술한다 |
| 2 | 데이터 격리 경험. **검증 방법**을 함께 물어 구현 경험과 학습 지식을 구분한다 |
| 3 | 명세 독해력과 솔직함. 우려를 제기하는 지원자가 명세를 읽은 지원자다 |

**공고 게시 전 확인**

- 시급 구간을 $50~80으로 조정할 것인지 확정 (플랫폼 제시값 $25~47은 해외 지원자 기준)
- 영문 요약본 준비 시점 — 지원 접수와 병행 가능
