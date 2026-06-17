# Specification & data sources

This document pins down the calculation model and the Microsoft sources behind every default,
so the calculator can be maintained as pricing evolves.

## Sources

| Source | Used for |
| --- | --- |
| Microsoft `CustomerCoworkEstimator.xlsx` (June 2026) | The 4-step model, personas, default prompt mix, default credits per prompt |
| Microsoft 365 blog — *Copilot Cowork is now generally available* (2026-06-16) | Pricing model narrative, $0.01/credit, cost-management themes, transition/grace period |
| Microsoft *Copilot Credits Guide* (June 2026) | PayGo meter, P3 pre-purchase tiers & discounts, four cost buckets, task scenario ranges |
| Microsoft *Cowork pitch deck* & *Cost Management* deck (to-customer) | "What is Cowork" pillars, Metered/Pooled/Governed framing, Monitor/Configure/Purchase |

All numbers are Microsoft's published figures. No values are invented. Frontier-program averages
are dated **5/27/2026** and assume **Anthropic Opus 4.8**.

## The model

### Step 1 & 2 — personas and monthly prompt mix (defaults)

| Persona | Light | Medium | Heavy |
| --- | ---: | ---: | ---: |
| Corporate Knowledge Workers | 22 | 11 | 5 |
| Customer-Facing Knowledge Workers | 17 | 13 | 5 |
| Technical Workers | 12 | 9 | 14 |
| Managers & Senior Leaders | 13 | 6 | 3 |

Values are prompts **per user per month**, all editable.

### Step 3 — Copilot Credits per prompt (defaults)

| Task | Credits | Illustrative per-task range |
| --- | ---: | --- |
| Light | 125 | 70–200 |
| Medium | 500 | 400–600 |
| Heavy | 2,500 | >1,500 |

The point estimates drive the math; the ranges are shown for context only.

### Step 4 — outputs

```
perUserCredits(persona)  = light×cL + medium×cM + heavy×cH
monthlyCredits           = Σ over personas (users × perUserCredits)
monthlyCost (PayGo)      = monthlyCredits × $0.01      // = credits / 100
avgCostPerUser           = monthlyCost / totalUsers
annualCredits            = monthlyCredits × 12
annualPaygo              = annualCredits × $0.01
```

**Engine self-check** — per-user monthly credits with default mix and default prices
(must match the estimator's column G):

| Persona | Credits/user/month |
| --- | ---: |
| Corporate Knowledge Workers | 20,750 |
| Customer-Facing Knowledge Workers | 21,125 |
| Technical Workers | 41,000 |
| Managers & Senior Leaders | 12,125 |

These are asserted in `src/calc.test.mjs` (run via `npm run verify`).

## Pre-Purchase Plan (P3) — value-add beyond the Excel

Annual, pay-upfront credit packs. The engine matches projected **annual** demand to the highest
tier whose pack size it reaches, then applies the discount to the PayGo list price.

| Tier | Credits | Discount |
| ---: | ---: | ---: |
| 1 | 300,000 | 5% |
| 2 | 1,500,000 | 6% |
| 3 | 3,000,000 | 7% |
| 4 | 15,000,000 | 8% |
| 5 | 30,000,000 | 10% |
| 6 | 75,000,000 | 12% |
| 7 | 150,000,000 | 14% |
| 8 | 225,000,000 | 17% |
| 9 | 300,000,000 | 20% |

```
p3AnnualCost = annualPaygo × (1 − discount)
```

Below 300,000 annual credits, no tier applies and pay-as-you-go is the fit.

## Maintenance notes

- All defaults live at the top of `src/calc.js` as exported constants — update them there.
- The UI reads those constants directly, so changing a default updates both the engine and the
  on-screen tables/labels.
- If Microsoft changes the per-credit price, update `PAYGO_USD_PER_CREDIT`.
