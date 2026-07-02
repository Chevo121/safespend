export type Beneficiary =
  | "me"
  | "girlfriend"
  | "shared"
  | "family"
  | "friend"
  | "work"
  | "unknown";

export type TransactionStatus =
  | "approved"
  | "needs_review"
  | "ignored"
  | "duplicate_candidate";

export type Transaction = {
  id: string;
  merchant: string;
  rawDescription: string;
  transactionDate: string;
  amountMxn: number;
  amountUsdc: number;
  sourceAccount: "ARQ" | "DolarApp";
  category: string;
  beneficiary: Beneficiary;
  countsTowardGirlfriend: boolean;
  girlfriendAmountMxn: number;
  purchaseNote: string;
  needsClarification: boolean;
  clarificationQuestion: string;
  clarificationAnswer: string;
  status: TransactionStatus;
  confidence: number;
};

export type Budget = {
  fixedMonthlyIncome: number;
  requiredSavings: number;
  monthlySpendCap: number;
  commissionSavingsRate: number;
};
