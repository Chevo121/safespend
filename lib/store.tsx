"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import {
  defaultBudget,
  defaultDebts,
  defaultGoals,
  defaultLimits,
  defaultScheduledPayments,
  mockSecondBatch,
  mockTransactions
} from "./mock-data";
import type {
  Budget,
  Debt,
  MerchantRule,
  SavingsGoal,
  ScheduledPayment,
  Transaction
} from "./types";

const KEYS = {
  state: "safespend.v3.state",
  rules: "safespend.v3.rules",
  payments: "safespend.v3.payments",
  limits: "safespend.v3.limits",
  goals: "safespend.v3.goals",
  debts: "safespend.v3.debts",
  budget: "safespend.v3.budget"
};

export type ImportResult = {
  found: number;
  added: number;
  duplicatesRemoved: number;
  flaggedDuplicates: number;
  autoCategorized: number;
};

type Store = {
  transactions: Transaction[];
  pendingCount: number;
  batches: number;
  priorityId: string | null;
  rules: MerchantRule[];
  payments: ScheduledPayment[];
  limits: Record<string, number>;
  goals: SavingsGoal[];
  debts: Debt[];
  budget: Budget;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  reopenTransaction: (id: string) => void;
  toggleGirlfriend: (id: string) => void;
  addRule: (rule: MerchantRule) => void;
  removeRule: (merchant: string) => void;
  addPayment: (payment: Omit<ScheduledPayment, "id">) => void;
  updatePayment: (id: string, patch: Partial<ScheduledPayment>) => void;
  removePayment: (id: string) => void;
  addGoal: (goal: Omit<SavingsGoal, "id">) => void;
  updateGoal: (id: string, patch: Partial<SavingsGoal>) => void;
  removeGoal: (id: string) => void;
  addDebt: (debt: Omit<Debt, "id">) => void;
  updateDebt: (id: string, patch: Partial<Debt>) => void;
  removeDebt: (id: string) => void;
  setBudget: (patch: Partial<Budget>) => void;
  setLimit: (label: string, value: number) => void;
  importNextBatch: () => ImportResult | null;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

const isPending = (tx: Transaction) =>
  tx.status === "needs_review" || tx.status === "duplicate_candidate";

const fingerprint = (tx: Transaction) =>
  `${tx.merchant}|${tx.amountMxn}|${tx.transactionDate}`;

// Merchants that should always be asked about, even when a rule exists.
const alwaysAsk = (merchant: string) => {
  const m = merchant.toLowerCase();
  return m.includes("uber") || m.includes("girlfriend") || m.includes("myself");
};

function load<T>(key: string, validate: (value: unknown) => boolean): T | null {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as T;
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function save(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Persistence is best-effort in the mocked phase.
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [batches, setBatches] = useState(1);
  const [priorityId, setPriorityId] = useState<string | null>(null);
  const [rules, setRules] = useState<MerchantRule[]>([]);
  const [payments, setPayments] = useState<ScheduledPayment[]>(defaultScheduledPayments);
  const [limits, setLimits] = useState<Record<string, number>>(defaultLimits);
  const [goals, setGoals] = useState<SavingsGoal[]>(defaultGoals);
  const [debts, setDebts] = useState<Debt[]>(defaultDebts);
  const [budget, setBudgetState] = useState<Budget>(defaultBudget);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const knownIds = new Set([...mockTransactions, ...mockSecondBatch].map((tx) => tx.id));
    const state = load<{ transactions: Transaction[]; batches: number }>(
      KEYS.state,
      (value) =>
        typeof value === "object" &&
        value !== null &&
        Array.isArray((value as { transactions?: unknown }).transactions) &&
        (value as { transactions: Transaction[] }).transactions.every((tx) =>
          knownIds.has(tx.id)
        )
    );
    if (state) {
      setTransactions(state.transactions);
      setBatches(state.batches === 2 ? 2 : 1);
    }

    const storedRules = load<MerchantRule[]>(KEYS.rules, Array.isArray);
    if (storedRules) {
      setRules(storedRules);
    }

    const storedPayments = load<ScheduledPayment[]>(KEYS.payments, Array.isArray);
    if (storedPayments) {
      setPayments(storedPayments);
    }

    const storedLimits = load<Record<string, number>>(
      KEYS.limits,
      (value) => typeof value === "object" && value !== null && !Array.isArray(value)
    );
    if (storedLimits) {
      setLimits({ ...defaultLimits, ...storedLimits });
    }

    const storedGoals = load<SavingsGoal[]>(KEYS.goals, Array.isArray);
    if (storedGoals) {
      setGoals(storedGoals);
    }

    const storedDebts = load<Debt[]>(KEYS.debts, Array.isArray);
    if (storedDebts) {
      setDebts(storedDebts);
    }

    const storedBudget = load<Budget>(
      KEYS.budget,
      (value) =>
        typeof value === "object" &&
        value !== null &&
        typeof (value as Budget).fixedMonthlyIncome === "number"
    );
    if (storedBudget) {
      setBudgetState({ ...defaultBudget, ...storedBudget });
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      save(KEYS.state, { transactions, batches });
    }
  }, [transactions, batches, hydrated]);

  useEffect(() => {
    if (hydrated) {
      save(KEYS.rules, rules);
    }
  }, [rules, hydrated]);

  useEffect(() => {
    if (hydrated) {
      save(KEYS.payments, payments);
    }
  }, [payments, hydrated]);

  useEffect(() => {
    if (hydrated) {
      save(KEYS.limits, limits);
    }
  }, [limits, hydrated]);

  useEffect(() => {
    if (hydrated) {
      save(KEYS.goals, goals);
    }
  }, [goals, hydrated]);

  useEffect(() => {
    if (hydrated) {
      save(KEYS.debts, debts);
    }
  }, [debts, hydrated]);

  useEffect(() => {
    if (hydrated) {
      save(KEYS.budget, budget);
    }
  }, [budget, hydrated]);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setTransactions((current) =>
      current.map((tx) => (tx.id === id ? { ...tx, ...patch } : tx))
    );
  }, []);

  const reopenTransaction = useCallback(
    (id: string) => {
      updateTransaction(id, {
        status: "needs_review",
        needsClarification: true,
        clarificationAnswer: ""
      });
      setPriorityId(id);
    },
    [updateTransaction]
  );

  const toggleGirlfriend = useCallback((id: string) => {
    setTransactions((current) =>
      current.map((tx) => {
        if (tx.id !== id) {
          return tx;
        }

        return tx.countsTowardGirlfriend
          ? { ...tx, countsTowardGirlfriend: false, girlfriendAmountMxn: 0 }
          : {
              ...tx,
              countsTowardGirlfriend: true,
              girlfriendAmountMxn: Math.abs(tx.amountMxn),
              girlfriendTag: tx.girlfriendTag ?? "Other"
            };
      })
    );
  }, []);

  const addRule = useCallback((rule: MerchantRule) => {
    setRules((current) => [
      ...current.filter((existing) => existing.merchant !== rule.merchant),
      rule
    ]);
  }, []);

  const removeRule = useCallback((merchant: string) => {
    setRules((current) => current.filter((rule) => rule.merchant !== merchant));
  }, []);

  const addPayment = useCallback((payment: Omit<ScheduledPayment, "id">) => {
    setPayments((current) => [
      ...current,
      { ...payment, id: `pay-${Date.now()}-${Math.round(Math.random() * 1e4)}` }
    ]);
  }, []);

  const updatePayment = useCallback((id: string, patch: Partial<ScheduledPayment>) => {
    setPayments((current) =>
      current.map((payment) => (payment.id === id ? { ...payment, ...patch } : payment))
    );
  }, []);

  const removePayment = useCallback((id: string) => {
    setPayments((current) => current.filter((payment) => payment.id !== id));
  }, []);

  const addGoal = useCallback((goal: Omit<SavingsGoal, "id">) => {
    setGoals((current) => [
      ...current,
      { ...goal, id: `goal-${Date.now()}-${Math.round(Math.random() * 1e4)}` }
    ]);
  }, []);

  const updateGoal = useCallback((id: string, patch: Partial<SavingsGoal>) => {
    setGoals((current) =>
      current.map((goal) => (goal.id === id ? { ...goal, ...patch } : goal))
    );
  }, []);

  const removeGoal = useCallback((id: string) => {
    setGoals((current) => current.filter((goal) => goal.id !== id));
  }, []);

  const addDebt = useCallback((debt: Omit<Debt, "id">) => {
    setDebts((current) => [
      ...current,
      { ...debt, id: `debt-${Date.now()}-${Math.round(Math.random() * 1e4)}` }
    ]);
  }, []);

  const updateDebt = useCallback((id: string, patch: Partial<Debt>) => {
    setDebts((current) =>
      current.map((debt) => (debt.id === id ? { ...debt, ...patch } : debt))
    );
  }, []);

  const removeDebt = useCallback((id: string) => {
    setDebts((current) => current.filter((debt) => debt.id !== id));
  }, []);

  const setBudget = useCallback((patch: Partial<Budget>) => {
    setBudgetState((current) => {
      const next = { ...current, ...patch };
      // Keep the spend cap consistent: income minus savings reserved first.
      next.monthlySpendCap = Math.max(next.fixedMonthlyIncome - next.requiredSavings, 0);
      return next;
    });
  }, []);

  const setLimit = useCallback((label: string, value: number) => {
    setLimits((current) => ({ ...current, [label]: Math.max(0, value) }));
  }, []);

  const importNextBatch = useCallback((): ImportResult | null => {
    if (batches >= 2) {
      return null;
    }

    const existing = new Set(transactions.map(fingerprint));
    const seenInBatch = new Set<string>();
    const fresh: Transaction[] = [];
    let duplicatesRemoved = 0;
    let flaggedDuplicates = 0;
    let autoCategorized = 0;

    for (const tx of mockSecondBatch) {
      const key = fingerprint(tx);

      if (existing.has(key)) {
        duplicatesRemoved += 1;
        continue;
      }

      if (seenInBatch.has(key)) {
        flaggedDuplicates += 1;
        fresh.push({
          ...tx,
          status: "duplicate_candidate",
          needsClarification: true,
          clarificationQuestion: "Possible duplicate charge"
        });
        continue;
      }

      seenInBatch.add(key);

      const rule = rules.find((r) => r.merchant === tx.merchant);
      if (rule && tx.status === "needs_review" && !alwaysAsk(tx.merchant)) {
        autoCategorized += 1;
        fresh.push({
          ...tx,
          category: rule.category,
          beneficiary: "me",
          status: "approved",
          needsClarification: false,
          clarificationAnswer: `${rule.label} · auto`
        });
        continue;
      }

      fresh.push(tx);
    }

    setTransactions((current) => [...fresh, ...current]);
    setBatches(2);

    return {
      found: mockSecondBatch.length,
      added: fresh.length,
      duplicatesRemoved,
      flaggedDuplicates,
      autoCategorized
    };
  }, [batches, transactions, rules]);

  const resetDemo = useCallback(() => {
    setTransactions(mockTransactions);
    setBatches(1);
    setPriorityId(null);
  }, []);

  const value = useMemo<Store>(
    () => ({
      transactions,
      pendingCount: transactions.filter(isPending).length,
      batches,
      priorityId,
      rules,
      payments,
      limits,
      goals,
      debts,
      budget,
      updateTransaction,
      reopenTransaction,
      toggleGirlfriend,
      addRule,
      removeRule,
      addPayment,
      updatePayment,
      removePayment,
      addGoal,
      updateGoal,
      removeGoal,
      addDebt,
      updateDebt,
      removeDebt,
      setBudget,
      setLimit,
      importNextBatch,
      resetDemo
    }),
    [
      transactions,
      batches,
      priorityId,
      rules,
      payments,
      limits,
      goals,
      debts,
      budget,
      updateTransaction,
      reopenTransaction,
      toggleGirlfriend,
      addRule,
      removeRule,
      addPayment,
      updatePayment,
      removePayment,
      addGoal,
      updateGoal,
      removeGoal,
      addDebt,
      updateDebt,
      removeDebt,
      setBudget,
      setLimit,
      importNextBatch,
      resetDemo
    ]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const store = useContext(StoreContext);

  if (!store) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return store;
}
