# Copilot Cowork Cost Calculator

An interactive web calculator for estimating **Microsoft Copilot Cowork** usage-based costs,
denominated in **Copilot Credits**. It's a modern take on Microsoft's
`CustomerCoworkEstimator.xlsx`, wrapped in the licensing context you need to plan a rollout.

**Live site:** https://cowork.licensing.guide
**Part of:** [The Licensing Guide](https://licensing.guide/) · sibling to the
[Dataverse Capacity Calculator](https://dataverse.licensing.guide/)

<img width="1655" height="1247" alt="image" src="https://github.com/user-attachments/assets/e994a804-4287-4926-8a10-5d7e95675355" />

## What it does

- **Reproduces Microsoft's 4-step estimator model** exactly (see [`specs.md`](./specs.md)):
  users by persona → light/medium/heavy prompts per user → credits per prompt → monthly spend.
- **Everything is editable.** Defaults reflect Microsoft Frontier-program usage (5/27/2026),
  assuming Anthropic Opus 4.8 — override any assumption to model your own organization.
- **Adds a Pre-Purchase Plan (P3) comparison** the Excel doesn't: it matches your projected
  annual demand to the best P3 discount tier and shows the annual savings vs. pay-as-you-go.
- **Doubles as a licensing primer**: what Cowork is, how it's priced (the Microsoft 365 Copilot
  USL floor + the four cost buckets), task-intensity scenarios, buying options, and cost-management
  governance — all sourced from Microsoft's June 2026 launch materials.

## The model in one line

```
monthly credits = Σ over personas [ users × (light×cL + medium×cM + heavy×cH) ]
monthly cost (PayGo) = monthly credits × $0.01
```

Default credits per prompt: **Light 125 · Medium 500 · Heavy 2500**.
Pay-as-you-go list price: **$0.01 / Copilot Credit**.

## Tech stack

- [React 18](https://react.dev/) — UI
- [Vite 5](https://vitejs.dev/) — build & dev server
- [Tailwind CSS 3](https://tailwindcss.com/) — styling

The calculation engine (`src/calc.js`) is a pure, dependency-free module, so the same logic
can later back an MCP server — exactly like the Dataverse Capacity Calculator.

## Develop

```bash
npm install      # install dependencies
npm run dev      # start the dev server
npm run verify   # run the calculation-engine checks
npm run build    # production build → dist/
npm run preview  # preview the production build locally
```

## Deploy (GitHub Pages + custom domain)

Pushing to `main` triggers `.github/workflows/deploy.yml`, which installs, verifies the engine,
builds, and publishes `dist/` to GitHub Pages.

To wire up the custom domain:

1. In the repo, **Settings → Pages**, set the source to **GitHub Actions**.
2. `public/CNAME` already contains `cowork.licensing.guide`; Vite copies it into `dist/` on build.
3. At your DNS provider, add a `CNAME` record for `cowork` pointing to `<user>.github.io`.

## Disclaimer

This is an independent planning aid, **not a quote**, and is **not affiliated with or endorsed by
Microsoft**. All figures are illustrative estimates derived from Microsoft's published model and
Frontier-program averages (data as of June 2026); actual usage and pricing will vary. Pricing is in
USD and subject to change. Always verify entitlements and spend in the Microsoft 365 admin center.
Microsoft, Copilot, and Microsoft 365 are trademarks of the Microsoft group of companies.
