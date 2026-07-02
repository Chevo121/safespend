# SafeSpend

Mobile-first personal finance tracker for ARQ / DolarApp screenshots. Phase 1 runs entirely on mocked data — no backend, no auth, no real AI extraction.

**Core loop:** screenshot in → extraction (simulated) → chat-style review of ambiguous transactions → dashboard updates safe-to-spend.

## Pages

- **Today (`/`)** — safe-to-spend-today hero with safe/tight/over status, remaining monthly budget, month-end projection, girlfriend spend, category bars, recent activity.
- **Review (`/review`)** — chat-style clarification flow with tappable option chips. Uber rides ask who they were for; Amazon/MercadoPago/Apple ask what the purchase was; transfers to Corina ask the spend type and whether it counts toward girlfriend spend.
- **Upload (`/upload`)** — simulated screenshot extraction that resets the demo data and hands off to Review.
- **Activity (`/transactions`)** — filterable transaction list with category, beneficiary, and girlfriend flags.
- **Budget (`/budget`)** — flexible-pool explainer plus grouped category limits (fixed essentials, flexible, savings, girlfriend, debt).
- **Insights (`/insights`)** — girlfriend spend, transport, excluded self-transfers, debt payments, largest transaction.

Review answers are held in a small client-side store (React context + `localStorage`), so they flow into every page. Light and dark mode are both supported via the header toggle.

## Development

```sh
pnpm install
pnpm dev        # start dev server
pnpm lint       # eslint
pnpm typecheck  # tsc --noEmit
pnpm build      # production build
```
