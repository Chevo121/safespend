# SafeSpend

Mobile-first personal finance tracker for ARQ / DolarApp screenshots. Phase 1 runs entirely on mocked data — no backend, no auth, no real AI extraction.

**Core loop:** screenshot in → extraction (simulated) → chat-style review of ambiguous transactions → dashboard updates safe-to-spend.

## Pages

- **Today (`/`)** — safe-to-spend-today hero with safe/tight/over status, remaining monthly budget, month-end projection (both bill-aware), upcoming bills, girlfriend spend, category bars, recent activity.
- **Review (`/review`)** — chat-style clarification flow with tappable option chips plus free-text answers. Uber rides ask who they were for; Amazon/MercadoPago/Apple ask what the purchase was; girlfriend transfers ask the spend type and whether it counts toward girlfriend spend. "Always use this answer" saves a merchant rule that auto-categorizes future imports.
- **Upload (`/upload`)** — simulated screenshot extraction with duplicate detection: exact re-imports are dropped, ambiguous same-day twins are flagged for review.
- **Activity (`/transactions`)** — filterable transaction list; tap any row to change its answer or toggle girlfriend spend.
- **Budget (`/budget`)** — flexible-pool explainer (income − savings − upcoming bills − spent), grouped category limits (editable), and merchant-rule management.
- **Calendar (`/calendar`)** — monthly-recurring scheduled payments (rent, internet, …). Anything still due this month is reserved before safe-to-spend is calculated.
- **Insights (`/insights`)** — girlfriend spend, upcoming bills, transport, excluded self-transfers, debt payments, largest transaction.

State lives in a small client-side store (React context + `localStorage`), so review answers flow into every page. Girlfriend spend is a cross-cutting tag with subcategories, never tied to a name. Light and dark mode are both supported, and the app is installable to the iPhone home screen (PWA manifest + icons).

## Development

```sh
pnpm install
pnpm dev        # start dev server
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm build      # production build
```
