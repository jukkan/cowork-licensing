// =============================================================================
// Copilot Cowork cost model — pure, dependency-free calculation engine.
//
// Mirrors Microsoft's "CustomerCoworkEstimator.xlsx" 4-step model and adds the
// Copilot Credit Pre-Purchase Plan (P3) discount comparison from the Microsoft
// "Copilot Credits Guide" (June 2026). Keeping this module free of React / DOM
// means the same engine could later back an MCP server, exactly like the
// Dataverse Capacity Calculator.
//
// All defaults are Microsoft's published figures:
//  - Prompt mix per persona: "Microsoft Frontier customer usage as of 5/27/2026"
//  - Credits per prompt (Light 125 / Medium 500 / Heavy 2500), assuming Opus 4.8
//  - Pay-as-you-go price: $0.01 per Copilot Credit
//  - P3 pre-purchase tiers + discounts: Copilot Credits Guide, June 2026
// =============================================================================

/** Pay-as-you-go list price, in USD per Copilot Credit. */
export const PAYGO_USD_PER_CREDIT = 0.01

/**
 * The four Cowork user personas with Microsoft's default monthly prompt mix.
 * `light` / `medium` / `heavy` = prompts per user per month.
 */
export const DEFAULT_PERSONAS = [
  { id: 'corporate', name: 'Corporate Knowledge Workers', users: 0, light: 22, medium: 11, heavy: 5 },
  { id: 'customer', name: 'Customer-Facing Knowledge Workers', users: 0, light: 17, medium: 13, heavy: 5 },
  { id: 'technical', name: 'Technical Workers', users: 0, light: 12, medium: 9, heavy: 14 },
  { id: 'managers', name: 'Managers & Senior Leaders', users: 0, light: 13, medium: 6, heavy: 3 },
]

/** Microsoft's default Copilot Credits consumed per prompt, by task weight. */
export const DEFAULT_CREDITS_PER_PROMPT = { light: 125, medium: 500, heavy: 2500 }

/**
 * Illustrative per-task credit ranges from the Copilot Credits Guide. Shown for
 * context only — not used in the math (the point estimates above drive the model).
 */
export const TASK_SCENARIO_RANGES = {
  light: { min: 70, max: 200, label: '70–200' },
  medium: { min: 400, max: 600, label: '400–600' },
  heavy: { min: 1500, max: null, label: '>1,500' },
}

/**
 * Copilot Credit Pre-Purchase Plan (P3) tiers, annual. `credits` is the pack
 * size; `discount` is the fraction off the $0.01/credit list price. A pack
 * applies when annual demand is at least that pack's credit volume.
 * Source: Microsoft Copilot Credits Guide, June 2026, p.5.
 */
export const P3_TIERS = [
  { tier: 1, credits: 300_000, discount: 0.05 },
  { tier: 2, credits: 1_500_000, discount: 0.06 },
  { tier: 3, credits: 3_000_000, discount: 0.07 },
  { tier: 4, credits: 15_000_000, discount: 0.08 },
  { tier: 5, credits: 30_000_000, discount: 0.1 },
  { tier: 6, credits: 75_000_000, discount: 0.12 },
  { tier: 7, credits: 150_000_000, discount: 0.14 },
  { tier: 8, credits: 225_000_000, discount: 0.17 },
  { tier: 9, credits: 300_000_000, discount: 0.2 },
]

const num = (v) => {
  const n = typeof v === 'number' ? v : parseFloat(v)
  return Number.isFinite(n) && n > 0 ? n : 0
}

/** Credits consumed per user per month for one persona's prompt mix. */
export function perUserCredits(persona, creditsPerPrompt = DEFAULT_CREDITS_PER_PROMPT) {
  return (
    num(persona.light) * num(creditsPerPrompt.light) +
    num(persona.medium) * num(creditsPerPrompt.medium) +
    num(persona.heavy) * num(creditsPerPrompt.heavy)
  )
}

/**
 * Find the best P3 pre-purchase tier for a given annual credit demand: the
 * highest tier whose pack size the demand reaches. Returns null below tier 1.
 */
export function matchP3Tier(annualCredits) {
  let match = null
  for (const t of P3_TIERS) {
    if (annualCredits >= t.credits) match = t
  }
  return match
}

/** The next P3 tier up from the matched one (for "buy a bit more, save more" hints). */
export function nextP3Tier(annualCredits) {
  for (const t of P3_TIERS) {
    if (annualCredits < t.credits) return t
  }
  return null
}

/**
 * Run the full model.
 * @param {Array} personas - persona rows (users + light/medium/heavy prompts)
 * @param {Object} creditsPerPrompt - { light, medium, heavy }
 * @returns aggregated results + per-persona breakdown.
 */
export function calculate(personas, creditsPerPrompt = DEFAULT_CREDITS_PER_PROMPT) {
  const rows = personas.map((p) => {
    const users = num(p.users)
    const perUser = perUserCredits(p, creditsPerPrompt)
    const monthlyCredits = users * perUser
    return {
      id: p.id,
      name: p.name,
      users,
      perUserCredits: perUser,
      monthlyCredits,
      monthlyCostUsd: monthlyCredits * PAYGO_USD_PER_CREDIT,
    }
  })

  const totalUsers = rows.reduce((s, r) => s + r.users, 0)
  const monthlyCredits = rows.reduce((s, r) => s + r.monthlyCredits, 0)
  const monthlyCostUsd = monthlyCredits * PAYGO_USD_PER_CREDIT
  const annualCredits = monthlyCredits * 12
  const annualPaygoUsd = annualCredits * PAYGO_USD_PER_CREDIT

  const avgCostPerUserUsd = totalUsers > 0 ? monthlyCostUsd / totalUsers : 0
  const avgCreditsPerUser = totalUsers > 0 ? monthlyCredits / totalUsers : 0

  // P3 pre-purchase comparison (annual commitment).
  const p3 = matchP3Tier(annualCredits)
  const next = nextP3Tier(annualCredits)
  const p3AnnualUsd = p3 ? annualPaygoUsd * (1 - p3.discount) : annualPaygoUsd
  const p3AnnualSavingsUsd = annualPaygoUsd - p3AnnualUsd

  return {
    rows,
    totalUsers,
    monthlyCredits,
    monthlyCostUsd,
    annualCredits,
    annualPaygoUsd,
    avgCostPerUserUsd,
    avgCreditsPerUser,
    p3: {
      tier: p3, // matched tier or null
      next, // next tier up or null
      discount: p3 ? p3.discount : 0,
      annualUsd: p3AnnualUsd,
      annualSavingsUsd: p3AnnualSavingsUsd,
    },
  }
}
