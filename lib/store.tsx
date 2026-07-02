"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { mockTransactions } from "./mock-data";
import type { Transaction } from "./types";

const STORAGE_KEY = "safespend.transactions.v2";

type Store = {
  transactions: Transaction[];
  pendingCount: number;
  updateTransaction: (id: string, patch: Partial<Transaction>) => void;
  resetDemo: () => void;
};

const StoreContext = createContext<Store | null>(null);

function loadStored(): Transaction[] | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Transaction[];
    const knownIds = new Set(mockTransactions.map((tx) => tx.id));

    if (!Array.isArray(parsed) || !parsed.every((tx) => knownIds.has(tx.id))) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = loadStored();
    if (stored) {
      setTransactions(stored);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
    } catch {
      // Storage is best-effort in the mocked phase.
    }
  }, [transactions, hydrated]);

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setTransactions((current) =>
      current.map((tx) => (tx.id === id ? { ...tx, ...patch } : tx))
    );
  }, []);

  const resetDemo = useCallback(() => {
    setTransactions(mockTransactions);
  }, []);

  const value = useMemo<Store>(
    () => ({
      transactions,
      pendingCount: transactions.filter((tx) => tx.status === "needs_review").length,
      updateTransaction,
      resetDemo
    }),
    [transactions, updateTransaction, resetDemo]
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
