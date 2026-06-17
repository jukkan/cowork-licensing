# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install        # install dependencies
npm run dev        # start Vite dev server (localhost:5173)
npm run verify     # run calculation-engine assertions (no test framework needed)
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

The CI pipeline runs `npm run verify` before every build, so this must pass before pushing to `main`.

## Architecture

This is a single-page React 18 app built with Vite 5 + Tailwind CSS 3. There are only two source files of substance:

**`src/calc.js`** — the pure calculation engine, no React or DOM dependencies. All pricing constants (`PAYGO_USD_PER_CREDIT`, `DEFAULT_PERSONAS`, `DEFAULT_CREDITS_PER_PROMPT`, `P3_TIERS`) are exported from the top of this file. The UI imports and uses them directly, so changing a constant updates both the math and the on-screen labels simultaneously. This module is intentionally kept framework-free so it could later back an MCP server.

**`src/CoworkCalculator.jsx`** — the entire UI in one file. The `CoworkCalculator` default export is the root component; it holds all state (`personas` array, `credits` object) and passes results from `useMemo(() => calculate(...))` down to presentational sections. All other React functions in the file are local presentational components (`Header`, `Hero`, `PricingExplainer`, `Scenarios`, `MethodSteps`, `BuyingOptions`, `CostManagement`, `Footer`) defined below the main component — none are exported.

**`src/calc.test.mjs`** — plain Node assertions, no test framework. Run with `npm run verify`. Tests assert that per-user monthly credit totals match Microsoft's `CustomerCoworkEstimator.xlsx` column G values exactly.

## The pricing model

The calculator reproduces Microsoft's 4-step estimator:
1. Users per persona (4 personas with default prompt-mix)
2. Monthly prompts per user (light / medium / heavy)
3. Credits per prompt (defaults: Light 125 · Medium 500 · Heavy 2,500, assuming Anthropic Opus 4.8)
4. `monthlyCredits × $0.01` = monthly PayGo cost

It adds a P3 Pre-Purchase Plan comparison: find the highest tier whose annual credit pack the projected annual demand reaches, apply the discount. Below 300,000 annual credits, no tier applies.

## Updating defaults

When Microsoft publishes new pricing or Frontier-program averages, update only `src/calc.js`:
- `PAYGO_USD_PER_CREDIT` — list price per credit
- `DEFAULT_PERSONAS` — prompt mix per persona
- `DEFAULT_CREDITS_PER_PROMPT` — credits per task weight
- `P3_TIERS` — tier thresholds and discounts

Then update `src/calc.test.mjs` to reflect the new expected per-user totals.

## Deploy

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs `npm run verify`, builds, and publishes `dist/` to GitHub Pages at `cowork.licensing.guide` (set by `public/CNAME`).
