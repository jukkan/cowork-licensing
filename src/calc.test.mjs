// Lightweight verification of the calculation engine — no test framework needed.
// Run with:  node src/calc.test.mjs   (or `npm run verify`).
import {
  DEFAULT_PERSONAS,
  DEFAULT_CREDITS_PER_PROMPT,
  perUserCredits,
  matchP3Tier,
  calculate,
  PAYGO_USD_PER_CREDIT,
} from './calc.js'

let failures = 0
const assert = (cond, msg) => {
  if (cond) {
    console.log('  ✓', msg)
  } else {
    console.error('  ✗', msg)
    failures++
  }
}

console.log('Per-user monthly credits (must match the Microsoft estimator):')
// Expected values are the formula results baked into the estimator's column G.
const expectedPerUser = {
  corporate: 20750,
  customer: 21125,
  technical: 41000,
  managers: 12125,
}
for (const p of DEFAULT_PERSONAS) {
  const got = perUserCredits(p, DEFAULT_CREDITS_PER_PROMPT)
  assert(got === expectedPerUser[p.id], `${p.name}: ${got} === ${expectedPerUser[p.id]}`)
}

console.log('\nAggregate model vs. estimator SUMPRODUCT (10 users per persona):')
const sample = DEFAULT_PERSONAS.map((p) => ({ ...p, users: 10 }))
const r = calculate(sample, DEFAULT_CREDITS_PER_PROMPT)
// SUMPRODUCT of 10 × each per-user total.
const expectedCredits = 10 * (20750 + 21125 + 41000 + 12125)
assert(r.monthlyCredits === expectedCredits, `monthly credits ${r.monthlyCredits} === ${expectedCredits}`)
assert(r.monthlyCostUsd === expectedCredits * PAYGO_USD_PER_CREDIT, `monthly USD = credits × $0.01 (${r.monthlyCostUsd})`)
assert(r.totalUsers === 40, `total users === 40 (${r.totalUsers})`)
// Average price per user per month = budget / total users (estimator D43).
assert(
  Math.abs(r.avgCostPerUserUsd - r.monthlyCostUsd / 40) < 1e-9,
  `avg $/user = budget / users (${r.avgCostPerUserUsd.toFixed(2)})`,
)

console.log('\nP3 tier matching (boundaries from Credits Guide):')
assert(matchP3Tier(0) === null, 'below 300k → no tier')
assert(matchP3Tier(299_999) === null, '299,999 → no tier')
assert(matchP3Tier(300_000).discount === 0.05, '300,000 → tier 1 / 5%')
assert(matchP3Tier(1_499_999).discount === 0.05, 'just under 1.5M → still tier 1')
assert(matchP3Tier(1_500_000).discount === 0.06, '1,500,000 → tier 2 / 6%')
assert(matchP3Tier(300_000_000).discount === 0.2, '300,000,000 → tier 9 / 20%')
assert(matchP3Tier(999_000_000_000).discount === 0.2, 'huge demand → caps at tier 9 / 20%')

console.log('\nP3 annual cost applies the discount correctly:')
// 40 users × the per-user totals × 12 months = annual credits.
const annualCredits = expectedCredits * 12
assert(r.annualCredits === annualCredits, `annual credits ${r.annualCredits} === ${annualCredits}`)
const tier = matchP3Tier(annualCredits)
const expectedP3 = annualCredits * PAYGO_USD_PER_CREDIT * (1 - tier.discount)
assert(Math.abs(r.p3.annualUsd - expectedP3) < 1e-9, `P3 annual = annual PayGo × (1 − ${tier.discount}) (${r.p3.annualUsd.toFixed(2)})`)

console.log('\nEmpty input is safe (no NaN / Infinity):')
const empty = calculate(DEFAULT_PERSONAS, DEFAULT_CREDITS_PER_PROMPT)
assert(empty.monthlyCredits === 0 && empty.avgCostPerUserUsd === 0, 'zero users → all zeros, no divide-by-zero')

console.log('')
if (failures > 0) {
  console.error(`FAILED: ${failures} assertion(s) did not pass.`)
  process.exit(1)
} else {
  console.log('All checks passed.')
}
