# SafeSpend

Mobile-first personal finance tracker for ARQ / DolarApp screenshots. Phase 1 runs entirely on mocked data — no backend, no auth, no real AI extraction.

**Core loop:** screenshot in → extraction (simulated) → chat-style review of ambiguous transactions → dashboard updates safe-to-spend.

## Pages (5-tab layout)

- **Today (`/`)** — safe-to-spend-today hero with safe/tight/over status, remaining monthly budget, month-end projection (bill- and debt-aware), upcoming bills, girlfriend spend, goals, category bars, recent activity, and a floating upload button.
- **Coach (`/coach`)** — one conversation for everything: clarification questions after an upload (tappable chips, free-text answers, "always use this answer" rules) plus a financial Q&A that answers from your data — "Can I afford a desk for $12,000?" computes whether it fits this month or offers tappable saving paces that create a goal.
- **Activity (`/transactions`)** — filterable transaction list; tap any row to change its answer or toggle girlfriend spend.
- **Plan (`/plan`)** — four segments: **Budget** (flexible pool, editable category limits, merchant rules), **Bills** (calendar of monthly scheduled payments; anything still due is reserved before safe-to-spend), **Goals** (target / saved / monthly pace with ETA), **Debts** (balance, monthly payment, due day, payoff estimate; payments reserved like bills and shown on the calendar).
- **Insights (`/insights`)** — girlfriend spend, upcoming bills, debt outstanding, transport, excluded self-transfers, largest transaction.
- **Upload (`/upload`)** — reached from the dashboard's floating button; simulated extraction with duplicate detection: exact re-imports are dropped, ambiguous same-day twins are flagged for review.

`/review`, `/budget`, and `/calendar` redirect into the consolidated pages.

State lives in a small client-side store (React context + `localStorage`), so review answers flow into every page. Girlfriend spend is a cross-cutting tag with subcategories, never tied to a name. Light and dark mode are both supported, and the app is installable to the iPhone home screen (PWA manifest + icons).

## Development

```sh
pnpm install
pnpm dev        # start dev server
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm build      # production build
```
