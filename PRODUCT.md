# Product

## Register

brand

## Users

IT admins and licensing specialists evaluating Microsoft Copilot Cowork for their tenant, and Microsoft partners or consultants building cost models for customers. They arrive mid-decision — they already know Cowork exists and need defensible numbers fast. They are comfortable with spreadsheets and licensing jargon; they do not need the basics explained, but they do need the assumptions made visible so they can override them.

## Product Purpose

A public, independent budget-planning tool for Microsoft Copilot Cowork — a modern, interactive replacement for Microsoft's `CustomerCoworkEstimator.xlsx`. It reproduces the 4-step estimator model exactly, adds a Pre-Purchase Plan (P3) comparison the Excel omits, and wraps the math in the licensing context needed to plan a rollout. Success is a licensing admin or consultant walking away with a credible annual cost range they can put in front of a budget holder — without touching Excel.

Part of the licensing.guide family of calculators, each a standalone tool at its own subdomain.

## Brand Personality

Independent. Precise. Unhurried.

Not Microsoft-adjacent authority — earned authority. The kind a trusted third-party reference carries: it cites its sources, shows its math, and doesn't oversell. The reference register is Cal.com and Resend: indie-professional, OSS-forward, clean without being sterile. Sharp enough that a technical audience respects it; approachable enough that a finance lead can use it.

## Anti-references

- **learn.microsoft.com** — too official, too corporate, too much beige and blue. This tool is independent; it should read that way.
- **Generic SaaS landing pages** — the hero-metric dashboard-screenshot AI-startup template. No big numbers in gradient cards, no feature grids with checkmarks, no testimonials.

## Design Principles

1. **The calculator earns the trust, not the chrome.** The tool speaks louder than any surrounding copy. Every design decision should make the calculator easier to use and read, not dress it up.
2. **Show the math.** Assumptions and sources are first-class. Defaults are labeled, editable, and traceable. The design should reinforce that nothing is hidden.
3. **Independent authority.** Visual distance from Microsoft's own aesthetic signals objectivity. The palette and typography are the tool's own, not a Microsoft-skin.
4. **Family coherence without sameness.** The licensing.guide calculators share a palette anchor and type direction, but each has its own identity. Coherence is in the details (spacing rhythm, card treatment, footer structure), not in pixel-matching.
5. **Precision at speed.** Admins and consultants scan fast. Numbers must be legible at a glance; labels must be unambiguous; the primary result must be immediately apparent without scrolling.

## Accessibility & Inclusion

WCAG 2.1 AA minimum. All interactive inputs must be keyboard-navigable with visible focus states. Number inputs use `inputMode="numeric"` for mobile. The calculator must be fully functional without JavaScript animations or transitions. Print/PDF output is supported via `@media print` (`.no-print` class already in use).
