import React, { useMemo, useState } from 'react'
import {
  DEFAULT_PERSONAS,
  DEFAULT_CREDITS_PER_PROMPT,
  TASK_SCENARIO_RANGES,
  P3_TIERS,
  PAYGO_USD_PER_CREDIT,
  calculate,
  perUserCredits,
} from './calc.js'

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
const fmtInt = (n) => Math.round(n).toLocaleString('en-US')
const fmtUsd = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const fmtUsd2 = (n) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 })
const fmtCredits = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 }) + 'M'
  if (n >= 1_000) return (n / 1_000).toLocaleString('en-US', { maximumFractionDigits: 1 }) + 'K'
  return fmtInt(n)
}

const PERSONA_COLORS = ['#1f47d6', '#3461f0', '#5a85fb', '#8eb0ff']

// ---------------------------------------------------------------------------
// Small presentational primitives
// ---------------------------------------------------------------------------
function Card({ children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200 bg-white shadow-card ${className}`}>{children}</div>
  )
}

function SectionTitle({ eyebrow, title, children }) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      {eyebrow && (
        <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-600">{eyebrow}</p>
      )}
      <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl" style={{ textWrap: 'balance' }}>{title}</h2>
      {children && <p className="mt-3 text-slate-600" style={{ textWrap: 'pretty' }}>{children}</p>}
    </div>
  )
}

function NumberInput({ value, onChange, ariaLabel, min = 0, className = '' }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={min}
      value={value}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
      className={`w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-right text-sm tabular-nums text-slate-800 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-300 ${className}`}
    />
  )
}

// ===========================================================================
// Main component
// ===========================================================================
export default function CoworkCalculator() {
  const [personas, setPersonas] = useState(() =>
    DEFAULT_PERSONAS.map((p) => ({ ...p, users: p.id === 'corporate' ? 100 : p.id === 'customer' ? 50 : p.id === 'technical' ? 30 : 20 })),
  )
  const [credits, setCredits] = useState({ ...DEFAULT_CREDITS_PER_PROMPT })

  const results = useMemo(() => calculate(personas, credits), [personas, credits])

  const updatePersona = (id, field, value) =>
    setPersonas((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)))

  const resetAll = () => {
    setPersonas(DEFAULT_PERSONAS.map((p) => ({ ...p })))
    setCredits({ ...DEFAULT_CREDITS_PER_PROMPT })
  }
  const resetCredits = () => setCredits({ ...DEFAULT_CREDITS_PER_PROMPT })

  const maxPersonaCredits = Math.max(1, ...results.rows.map((r) => r.monthlyCredits))

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <Hero />

        {/* ============================ CALCULATOR ============================ */}
        <section id="calculator" className="bg-slate-50 py-12 sm:py-16">
          <div className="mx-auto max-w-6xl px-4">
            <SectionTitle title="Estimate your Copilot Cowork spend">
              Cowork is billed on usage, in Copilot Credits. Enter how many people will use it and how
              intensely, and this tool projects your monthly credits and cost — then compares
              pay-as-you-go with the discounted pre-purchase plan.
            </SectionTitle>

            <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-5">
              {/* -------------------- INPUTS -------------------- */}
              <div className="space-y-6 lg:col-span-3">
                {/* Steps 1 & 2 — personas */}
                <Card className="overflow-hidden">
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        <span className="text-brand-600">Steps 1 &amp; 2.</span> Users &amp; monthly prompt mix
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">
                        Prompts per user per month. Defaults reflect Microsoft Frontier usage (5/27/2026).
                      </p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                          <th className="px-5 py-2 font-medium">Persona</th>
                          <th className="px-2 py-2 text-right font-medium">Users</th>
                          <th className="px-2 py-2 text-right font-medium" title="Narrow context, lightweight model, 0–1 tool calls, minimal runtime — 0–1 deliverables.">
                            Light
                          </th>
                          <th className="px-2 py-2 text-right font-medium" title="Richer context, capable model, several tool calls, moderate runtime — 2+ outputs.">
                            Medium
                          </th>
                          <th className="px-2 py-2 text-right font-medium" title="Broad context aggregation, high-quality model, many tool calls, sustained runtime — many outputs.">
                            Heavy
                          </th>
                          <th className="px-5 py-2 text-right font-medium">Credits/user</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {personas.map((p, i) => (
                          <tr key={p.id} className="align-middle transition-colors duration-100 hover:bg-brand-50/60">
                            <td className="px-5 py-2.5">
                              <div className="flex items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: PERSONA_COLORS[i] }} />
                                <span className="font-medium text-slate-800">{p.name}</span>
                              </div>
                            </td>
                            <td className="px-2 py-2.5 w-20">
                              <NumberInput value={p.users} onChange={(v) => updatePersona(p.id, 'users', v)} ariaLabel={`${p.name} users`} />
                            </td>
                            <td className="px-2 py-2.5 w-16">
                              <NumberInput value={p.light} onChange={(v) => updatePersona(p.id, 'light', v)} ariaLabel={`${p.name} light prompts`} />
                            </td>
                            <td className="px-2 py-2.5 w-16">
                              <NumberInput value={p.medium} onChange={(v) => updatePersona(p.id, 'medium', v)} ariaLabel={`${p.name} medium prompts`} />
                            </td>
                            <td className="px-2 py-2.5 w-16">
                              <NumberInput value={p.heavy} onChange={(v) => updatePersona(p.id, 'heavy', v)} ariaLabel={`${p.name} heavy prompts`} />
                            </td>
                            <td className="px-5 py-2.5 text-right font-semibold tabular-nums text-slate-700">
                              {fmtInt(perUserCredits(p, credits))}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800">
                          <td className="px-5 py-2.5">Total</td>
                          <td className="px-2 py-2.5 text-right tabular-nums">{fmtInt(results.totalUsers)}</td>
                          <td colSpan={3} />
                          <td className="px-5 py-2.5 text-right tabular-nums">{fmtInt(results.monthlyCredits)}</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </Card>

                {/* Step 3 — credits per prompt */}
                <Card>
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
                    <div>
                      <h3 className="font-semibold text-slate-900">
                        <span className="text-brand-600">Step 3.</span> Copilot Credits per prompt
                      </h3>
                      <p className="mt-0.5 text-xs text-slate-500">Microsoft defaults, assuming Anthropic Opus 4.8.</p>
                    </div>
                    <button onClick={resetCredits} className="no-print rounded-lg px-2 py-1 text-xs font-medium text-brand-600 hover:bg-brand-50">
                      Reset
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4 p-5">
                    {[
                      { key: 'light', label: 'Light', range: TASK_SCENARIO_RANGES.light.label },
                      { key: 'medium', label: 'Medium', range: TASK_SCENARIO_RANGES.medium.label },
                      { key: 'heavy', label: 'Heavy', range: TASK_SCENARIO_RANGES.heavy.label },
                    ].map((c) => (
                      <div key={c.key}>
                        <label className="mb-1 block text-sm font-medium text-slate-700">{c.label}</label>
                        <NumberInput
                          value={credits[c.key]}
                          onChange={(v) => setCredits((prev) => ({ ...prev, [c.key]: v }))}
                          ariaLabel={`${c.label} credits per prompt`}
                          className="text-center"
                        />
                        <p className="mt-1 text-center text-xs text-slate-400">illustrative {c.range}</p>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="no-print flex items-center justify-between">
                  <button onClick={resetAll} className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Reset everything to Microsoft defaults
                  </button>
                  <button onClick={() => window.print()} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                    Print / save as PDF
                  </button>
                </div>
              </div>

              {/* -------------------- RESULTS -------------------- */}
              <div className="space-y-6 lg:col-span-2">
                <div className="rounded-2xl bg-brand-700 text-white shadow-card">
                  <div className="px-5 py-5">
                    <p className="text-sm font-medium text-brand-100">
                      <span className="text-brand-200">Step 4.</span> Estimated monthly spend
                    </p>
                    <div className="mt-2 flex items-baseline gap-2">
                      <span className="text-4xl font-bold tracking-tight">{fmtUsd(results.monthlyCostUsd)}</span>
                      <span className="text-brand-200">/ month</span>
                    </div>
                    <p className="mt-1 text-sm text-brand-100">
                      {fmtInt(results.monthlyCredits)} Copilot Credits · pay-as-you-go at ${PAYGO_USD_PER_CREDIT.toFixed(2)}/credit
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/20 pt-4 text-sm">
                      <Stat label="Avg / user / month" value={fmtUsd2(results.avgCostPerUserUsd)} />
                      <Stat label="Credits / user / month" value={fmtInt(results.avgCreditsPerUser)} />
                      <Stat label="Annual credits" value={fmtCredits(results.annualCredits)} />
                      <Stat label="Annual (PayGo)" value={fmtUsd(results.annualPaygoUsd)} />
                    </div>
                  </div>
                </div>

                {/* P3 comparison */}
                <Card>
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h3 className="font-semibold text-slate-900">Pre-purchase plan (P3) comparison</h3>
                    <p className="mt-0.5 text-xs text-slate-500">Commit to annual volume for a discount on list price.</p>
                  </div>
                  <div className="p-5">
                    {results.p3.tier ? (
                      <>
                        <div className="flex items-end justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-slate-500">P3 annual cost</p>
                            <p className="text-2xl font-bold text-slate-900">{fmtUsd(results.p3.annualUsd)}</p>
                          </div>
                          <div className="text-right">
                            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700">
                              Tier {results.p3.tier.tier} · {(results.p3.discount * 100).toFixed(0)}% off
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                          Saves <strong>{fmtUsd(results.p3.annualSavingsUsd)}</strong> per year vs. pay-as-you-go.
                        </p>
                        {results.p3.next && (
                          <p className="mt-2 text-xs text-slate-500">
                            Next tier ({(results.p3.next.discount * 100).toFixed(0)}% off) starts at{' '}
                            {fmtCredits(results.p3.next.credits)} annual credits.
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-sm text-slate-600">
                        Your projected annual demand ({fmtInt(results.annualCredits)} credits) is below the smallest
                        pre-purchase pack (300,000 credits / 5% off), so pay-as-you-go is the fit. Increase users or
                        usage to reach a P3 tier.
                      </p>
                    )}
                  </div>
                </Card>

                {/* Per-persona breakdown */}
                <Card>
                  <div className="border-b border-slate-100 px-5 py-4">
                    <h3 className="font-semibold text-slate-900">Credit consumption by persona</h3>
                  </div>
                  <div className="space-y-3 p-5">
                    {results.rows.map((r, i) => {
                      const share = results.monthlyCredits > 0 ? r.monthlyCredits / results.monthlyCredits : 0
                      return (
                        <div key={r.id}>
                          <div className="mb-1 flex items-center justify-between text-sm">
                            <span className="text-slate-700">{r.name}</span>
                            <span className="tabular-nums font-medium text-slate-600">
                              {fmtUsd(r.monthlyCostUsd)} · {(share * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full transition-[width] duration-300 ease-out motion-reduce:transition-none"
                              style={{ width: `${(r.monthlyCredits / maxPersonaCredits) * 100}%`, background: PERSONA_COLORS[i] }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </Card>
              </div>
            </div>

            <p className="mx-auto mt-8 max-w-4xl text-center text-xs text-slate-400">
              Estimates only, for budgeting. Figures in USD. Based on Microsoft's published model and Frontier-program
              averages; your actual usage and pricing will vary. Verify entitlements and spend in the Microsoft 365
              admin center.
            </p>
          </div>
        </section>

        <PricingExplainer />
        <Scenarios />
        <MethodSteps />
        <BuyingOptions />
        <CostManagement />
      </main>

      <Footer />
    </div>
  )
}

function Stat({ label, value }) {
  return (
    <div>
      <p className="text-brand-200">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Header
// ---------------------------------------------------------------------------
function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2.5">
          <img src="/favicon.svg" alt="" className="h-8 w-8" />
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">Copilot Cowork Cost Calculator</p>
            <p className="text-xs text-slate-500">The Licensing Guide</p>
          </div>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          <a href="#calculator" className="hidden hover:text-brand-700 sm:inline">Calculator</a>
          <a href="#how-priced" className="hidden hover:text-brand-700 sm:inline">How it's priced</a>
          <a href="#buying" className="hidden hover:text-brand-700 sm:inline">Buying credits</a>
          <a
            href="https://licensing.guide/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-white hover:bg-brand-700"
          >
            licensing.guide
          </a>
        </nav>
      </div>
    </header>
  )
}

// ---------------------------------------------------------------------------
// Hero
// ---------------------------------------------------------------------------
function Hero() {
  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" aria-hidden="true" />
            Generally available · June 16, 2026
          </span>
          <h1
            className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 sm:text-5xl"
            style={{ textWrap: 'balance' }}
          >
            Budget for Microsoft Copilot Cowork
          </h1>
          <p
            className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-slate-600"
            style={{ textWrap: 'pretty' }}
          >
            Cowork bills on usage, in{' '}
            <strong className="font-semibold text-slate-800">Copilot Credits</strong>. Enter
            your headcount and intensity — this tool projects your monthly spend and matches
            you to the best pre-purchase plan.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#calculator"
              className="rounded-xl bg-brand-600 px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-brand-700"
            >
              Open the calculator
            </a>
            <a
              href="#how-priced"
              className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 font-semibold text-slate-700 transition-colors hover:bg-slate-50"
            >
              How pricing works
            </a>
          </div>
        </div>

        {/* The estimation model, shown upfront */}
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          <div className="px-6 py-5 text-center font-mono text-sm leading-loose text-slate-700 sm:text-base">
            <span className="text-slate-400">monthly credits</span>
            {' = Σ ('}
            <span className="font-medium text-slate-700">users</span>
            {' × '}
            <span className="font-semibold text-brand-700">light</span>
            {'×125 + '}
            <span className="font-semibold text-brand-700">medium</span>
            {'×500 + '}
            <span className="font-semibold text-brand-700">heavy</span>
            {'×2,500)'}
          </div>
          <div className="border-t border-slate-200 bg-white/70 px-6 py-3 text-center text-xs text-slate-400">
            <span className="font-medium text-slate-500">monthly spend</span>
            {' = monthly credits × '}
            <span className="font-semibold text-slate-600">$0.01</span>
            <span className="mx-2">·</span>
            defaults from Microsoft Frontier usage (5/27/2026), Anthropic Opus 4.8
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// How Cowork is priced — USL floor + 4 cost buckets
// ---------------------------------------------------------------------------
function PricingExplainer() {
  const m365Experiences = [
    { label: 'Copilot Chat', sub: 'Conversational, web-grounded' },
    { label: 'Word', sub: 'Write, edit, summarize' },
    { label: 'Excel', sub: 'Analyze & visualize' },
    { label: 'PowerPoint', sub: 'Create & redesign slides' },
    { label: 'Outlook', sub: 'Email & scheduling' },
    { label: 'Teams', sub: 'Meetings & chat' },
    { label: 'Work IQ', sub: 'Graph-powered context' },
    { label: 'Pre-built agents', sub: 'SharePoint, Planner, more' },
    { label: 'Multiple models', sub: 'GPT-4o, o-series & more' },
  ]
  const buckets = [
    { label: 'Models', body: 'The AI model chosen for each task — quality, speed, and cost vary by what the task demands.' },
    { label: 'Context', body: 'Understanding of the people, roles, and collaboration behind the work — emails, files, meetings, and past interactions.' },
    { label: 'Tools', body: 'Actions the system takes to get work done: sending emails, scheduling meetings, updating documents, and more.' },
    { label: 'Runtime', body: 'Managed cloud orchestration that runs agents and keeps them working across tasks, including long-running work.' },
  ]
  return (
    <section id="how-priced" className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle title="A subscription floor, plus usage on top">
          Copilot Cowork requires the Microsoft 365 Copilot subscription as a prerequisite — that license is the
          predictable per-user floor. Cowork itself adds no included entitlements: it's billed purely on what each task
          consumes.
        </SectionTitle>

        <div className="mx-auto mt-10 max-w-4xl grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* The floor — expanded to match Cowork unit's visual weight */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-card">
            <div className="px-5 py-5">
              <p className="text-sm font-semibold text-slate-500">Per user &middot; flat fee</p>
              <h3 className="mt-1 font-semibold text-slate-900">Microsoft 365 Copilot (USL)</h3>
              <p className="mt-2 text-sm text-slate-600">
                A predictable per-user, per-month subscription — the floor every Cowork user needs.
              </p>
            </div>
            <div className="grid grid-cols-3 border-t border-slate-200 bg-slate-50">
              {m365Experiences.map((item, i) => (
                <div
                  key={item.label}
                  className={
                    'px-3 py-3' +
                    (i % 3 !== 0 ? ' border-l border-slate-200' : '') +
                    (i >= 3 ? ' border-t border-slate-200' : '')
                  }
                >
                  <p className="text-xs font-semibold text-slate-800">{item.label}</p>
                  <p className="mt-0.5 text-xs leading-snug text-slate-600">{item.sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* On top: Cowork header + its 4 cost components as one connected unit */}
          <div className="overflow-hidden rounded-2xl border border-brand-200 shadow-card">
            <div className="bg-brand-50 px-5 py-5">
              <p className="text-sm font-semibold text-brand-600">On top — usage based</p>
              <h3 className="mt-1 font-semibold text-slate-900">Copilot Cowork</h3>
              <p className="mt-2 text-sm text-slate-600">
                Billed in Copilot Credits, with the price of each task built from four inputs.
                No Cowork entitlements are included with the Microsoft 365 Copilot subscription.
              </p>
            </div>
            <div className="grid grid-cols-2 border-t border-brand-200">
              {buckets.map((b, i) => (
                <div
                  key={b.label}
                  className={
                    'bg-white p-4' +
                    (i >= 2 ? ' border-t border-slate-200' : '') +
                    (i % 2 === 1 ? ' border-l border-slate-200' : '')
                  }
                >
                  <p className="text-sm font-semibold text-slate-800">{b.label}</p>
                  <p className="mt-1 text-sm leading-snug text-slate-600">{b.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Light / Medium / Heavy scenarios
// ---------------------------------------------------------------------------
function Scenarios() {
  const items = [
    {
      tag: 'Light',
      range: TASK_SCENARIO_RANGES.light.label,
      desc: 'Narrow context, a lightweight model, 0–1 tool calls, minimal runtime — producing 0–1 deliverables.',
      example: 'Create a weekly status update for my team with my top priorities and key meetings, saved as a draft.',
      color: 'bg-sky-50 text-sky-700',
    },
    {
      tag: 'Medium',
      range: TASK_SCENARIO_RANGES.medium.label,
      desc: 'Richer context, a capable model, several tool calls, moderate runtime — producing 2+ outputs.',
      example: 'Prepare me for a customer meeting: pull relevant emails, calendar, CRM, and files into a briefing doc.',
      color: 'bg-indigo-50 text-indigo-700',
    },
    {
      tag: 'Heavy',
      range: TASK_SCENARIO_RANGES.heavy.label,
      desc: 'Broad context aggregation, a high-quality model, many tool calls, sustained runtime — many outputs.',
      example: 'Analyze 6 months of exported product usage data, classify patterns, and produce a leadership-ready analysis.',
      color: 'bg-violet-50 text-violet-700',
    },
  ]
  return (
    <section className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow="Task intensity" title="Light, medium, and heavy tasks">
          Cost scales with usage and intensity. Microsoft groups Cowork work into three representative patterns. The
          per-task credit ranges below are illustrative and will vary with task complexity.
        </SectionTitle>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {items.map((it) => (
            <Card key={it.tag} className="flex flex-col p-5">
              <div className="flex items-center justify-between">
                <span className={`rounded-full px-3 py-1 text-sm font-semibold ${it.color}`}>{it.tag}</span>
                <span className="text-sm font-semibold tabular-nums text-slate-700">{it.range} credits</span>
              </div>
              <p className="mt-3 text-sm text-slate-600">{it.desc}</p>
              <p className="mt-3 border-t border-slate-100 pt-3 text-sm italic text-slate-500">“{it.example}”</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// The 4-step estimating method
// ---------------------------------------------------------------------------
function MethodSteps() {
  const steps = [
    { n: 1, title: 'Determine users', body: 'Count Cowork users, grouped by persona.' },
    { n: 2, title: 'Prompts per persona', body: 'Estimate light, medium, and heavy prompts per user per month.' },
    { n: 3, title: 'Price per prompt', body: 'Apply the average Copilot Credits consumed per prompt type.' },
    { n: 4, title: 'Monthly spend', body: 'Multiply, sum, and price at $0.01/credit for an estimated monthly cost.' },
  ]
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow="The model" title="A simple, transparent estimating method">
          The calculator above follows the same four-step approach Microsoft uses in its estimator — sized from your
          own user counts, intensity assumptions, and cost inputs.
        </SectionTitle>
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              <Card className="h-full p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-700">
                  {s.n}
                </div>
                <h3 className="mt-3 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1.5 text-sm text-slate-600">{s.body}</p>
              </Card>
              {i < steps.length - 1 && (
                <span className="absolute -right-2.5 top-1/2 hidden -translate-y-1/2 text-slate-300 lg:block" aria-hidden>
                  →
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Buying options — PayGo vs P3 tiers
// ---------------------------------------------------------------------------
function BuyingOptions() {
  return (
    <section id="buying" className="bg-slate-50 py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow="Purchasing" title="Two ways to buy Copilot Credits">
          Credits are pooled at the tenant level and shared across Copilot experiences. Choose pay-as-you-go for
          flexibility, or commit to annual volume with a Pre-Purchase Plan for a discount.
        </SectionTitle>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Pay-as-you-go</h3>
            <p className="mt-1 text-sm text-slate-500">Post-pay for what you use. No upfront commitment.</p>
            <p className="mt-4 text-3xl font-bold text-slate-900">
              $0.01<span className="text-base font-medium text-slate-500"> / Copilot Credit</span>
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li>• Scale up or down with no overage interruptions</li>
              <li>• Billed in arrears at the end of the billing month</li>
              <li>• Provisioned in the Power Platform admin center</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900">Pre-Purchase Plan (P3)</h3>
            <p className="mt-1 text-sm text-slate-500">One-year, pay-upfront credit packs at a tiered discount.</p>
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Tier</th>
                    <th className="px-3 py-2 text-right font-medium">Credits</th>
                    <th className="px-3 py-2 text-right font-medium">Discount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {P3_TIERS.map((t) => (
                    <tr key={t.tier}>
                      <td className="px-3 py-1.5 text-slate-700">{t.tier}</td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-slate-700">{fmtInt(t.credits)}</td>
                      <td className="px-3 py-1.5 text-right font-semibold tabular-nums text-emerald-700">
                        {(t.discount * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-500">
              Unused credits expire at the end of the annual term; usage beyond the pool falls back to pay-as-you-go.
            </p>
          </Card>
        </div>
        <p className="mt-6 text-center text-sm text-slate-500">
          Both options are eligible for the Microsoft Azure Consumption Commitment (MACC) and available through CSP
          partners.
        </p>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Cost management — control / visibility / efficiency
// ---------------------------------------------------------------------------
function CostManagement() {
  const themes = [
    {
      title: 'Control',
      body: 'Cowork is off by default. Admins decide when to enable it and who gets access, and set spending limits at the tenant, group, and user levels with customizable usage alerts.',
    },
    {
      title: 'Visibility',
      body: 'Usage reporting at the tenant, group, and user levels — broken down by user, group, and feature — with per-task pricing shown to users as they work (coming soon after GA).',
    },
    {
      title: 'Efficiency',
      body: 'Two payment options (pay-as-you-go and the P3 pre-purchase plan), plus model choice where multiple models are available so teams can manage cost per task.',
    },
  ]
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <SectionTitle eyebrow="Governance" title="Managing usage and spend">
          Usage-based billing makes cost management essential. Microsoft groups Cowork's controls into three themes,
          centrally managed from the Microsoft 365 admin center.
        </SectionTitle>
        <div className="mt-8 grid grid-cols-1 gap-5 md:grid-cols-3">
          {themes.map((t) => (
            <Card key={t.title} className="p-5">
              <h3 className="font-semibold text-brand-700">{t.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{t.body}</p>
            </Card>
          ))}
        </div>
        <div className="mx-auto mt-8 max-w-3xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
          <strong>Transition note:</strong> Billing for Copilot Cowork began at GA. Tenants with at least one Cowork
          user during the Frontier program (March 30 – June 16, 2026) receive a grace period and are not billed until
          July 1, 2026.
        </div>
      </div>
    </section>
  )
}

// ---------------------------------------------------------------------------
// Footer
// ---------------------------------------------------------------------------
function Footer() {
  const links = [
    { label: 'Copilot Cowork GA announcement', href: 'https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/16/copilot-cowork-is-now-generally-available/' },
    { label: 'Microsoft Copilot Credits Guide (June 2026)', href: 'https://www.microsoft.com/en-us/microsoft-365/blog/2026/06/16/copilot-cowork-is-now-generally-available/' },
    { label: 'Dataverse Capacity Calculator', href: 'https://dataverse.licensing.guide/' },
    { label: 'The Licensing Guide', href: 'https://licensing.guide/' },
  ]
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div className="md:col-span-2">
            <p className="font-semibold text-white">Copilot Cowork Cost Calculator</p>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              An independent, interactive estimator built on Microsoft's published Copilot Cowork pricing model and
              Customer Cowork Estimator (data as of June 2026). Figures in USD and subject to change. This is a
              planning aid, not a quote — always verify entitlements and spend in the Microsoft 365 admin center.
              Not affiliated with or endorsed by Microsoft. Microsoft, Copilot, and Microsoft 365 are trademarks of the
              Microsoft group of companies.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Sources &amp; related</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {links.map((l) => (
                <li key={l.label}>
                  <a href={l.href} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white">
                    {l.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-slate-800 pt-6 text-xs text-slate-500">
          Built by Jukka Niiranen · part of{' '}
          <a href="https://licensing.guide/" className="underline hover:text-slate-300">The Licensing Guide</a>{' '}
          resources. Open source — contributions welcome.
        </div>
      </div>
    </footer>
  )
}
