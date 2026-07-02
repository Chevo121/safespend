import { AppShell } from "@/components/app-shell";
import { TransactionCard } from "@/components/transaction-card";
import { Section, StatusPill } from "@/components/ui";
import { mockTransactions } from "@/lib/mock-data";

export default function TransactionsPage() {
  return (
    <AppShell title="Transactions" activePath="/transactions">
      <Section
        title="July 2026"
        action={<StatusPill tone="good">{mockTransactions.length} imported</StatusPill>}
      >
        <div className="space-y-3">
          {mockTransactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </Section>
    </AppShell>
  );
}
