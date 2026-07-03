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

export type GirlfriendTag =
  | "Uber for her"
  | "Dates"
  | "Gifts"
  | "Support"
  | "Reimbursements"
  | "Shared expenses"
  | "Food"
  | "Transport"
  | "Other";

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
  girlfriendTag?: GirlfriendTag;
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
  commissionThisMonth: number;
};

export type ScheduledPayment = {
  id: string;
  name: string;
  amountMxn: number;
  dayOfMonth: number;
  category: string;
};

export type SavingsGoal = {
  id: string;
  name: string;
  targetMxn: number;
  savedMxn: number;
  monthlyMxn: number;
};

export type Debt = {
  id: string;
  name: string;
  balanceMxn: number;
  monthlyPaymentMxn: number;
  dueDayOfMonth: number;
};

export type MerchantRule = {
  merchant: string;
  category: string;
  label: string;
};
