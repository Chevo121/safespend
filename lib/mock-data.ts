import type { Budget, ScheduledPayment, Transaction } from "./types";

export const defaultBudget: Budget = {
  fixedMonthlyIncome: 65000,
  requiredSavings: 16500,
  monthlySpendCap: 48500,
  commissionSavingsRate: 0.7
};

export const defaultScheduledPayments: ScheduledPayment[] = [
  {
    id: "pay-rent",
    name: "Rent",
    amountMxn: 8500,
    dayOfMonth: 5,
    category: "Housing"
  },
  {
    id: "pay-internet",
    name: "Internet",
    amountMxn: 599,
    dayOfMonth: 23,
    category: "Internet & phone"
  }
];

export const defaultLimits: Record<string, number> = {
  Subscriptions: 1000,
  "Digital services": 750,
  "Uber rides": 1500,
  "Uber Eats": 900,
  "Shopping & marketplaces": 4000,
  "Girlfriend spend": 5000,
  "Debt payments": 3000
};

const exchangeRate = 18.25;

const toUsdc = (amountMxn: number) => Number((amountMxn / exchangeRate).toFixed(2));

const base = {
  sourceAccount: "ARQ" as const,
  purchaseNote: "",
  clarificationAnswer: "",
  countsTowardGirlfriend: false,
  girlfriendAmountMxn: 0
};

const day1 = { ...base, transactionDate: "2026-07-01" };
const day2 = { ...base, transactionDate: "2026-07-02" };

export const mockTransactions: Transaction[] = [
  {
    ...day1,
    id: "txn-uber-07692",
    merchant: "Uber",
    rawDescription: "Uber",
    amountMxn: -76.92,
    amountUsdc: toUsdc(-76.92),
    category: "Transport",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "Who was this Uber ride for?",
    status: "needs_review",
    confidence: 0.76
  },
  {
    ...day1,
    id: "txn-hbo-239",
    merchant: "HBO Max",
    rawDescription: "HBO max",
    amountMxn: -239,
    amountUsdc: toUsdc(-239),
    category: "Subscriptions",
    beneficiary: "me",
    needsClarification: false,
    clarificationQuestion: "",
    status: "approved",
    confidence: 0.94
  },
  {
    ...day1,
    id: "txn-uber-07223",
    merchant: "Uber",
    rawDescription: "Uber",
    amountMxn: -72.23,
    amountUsdc: toUsdc(-72.23),
    category: "Transport",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "Who was this Uber ride for?",
    status: "needs_review",
    confidence: 0.74
  },
  {
    ...day1,
    id: "txn-gf-transfer-1300",
    merchant: "Transfer to girlfriend",
    rawDescription: "Bank transfer",
    amountMxn: -1300,
    amountUsdc: toUsdc(-1300),
    category: "Girlfriend",
    beneficiary: "girlfriend",
    countsTowardGirlfriend: true,
    girlfriendAmountMxn: 1300,
    needsClarification: true,
    clarificationQuestion: "What was this transfer to your girlfriend for?",
    status: "needs_review",
    confidence: 0.65
  },
  {
    ...day1,
    id: "txn-self-120",
    merchant: "Transfer to myself",
    rawDescription: "Own account transfer",
    amountMxn: -120,
    amountUsdc: toUsdc(-120),
    category: "Transfer to self",
    beneficiary: "me",
    needsClarification: true,
    clarificationQuestion: "Is this a transfer between your own accounts?",
    status: "needs_review",
    confidence: 0.7
  },
  {
    ...day1,
    id: "txn-uber-18290",
    merchant: "Uber",
    rawDescription: "Uber",
    amountMxn: -182.9,
    amountUsdc: toUsdc(-182.9),
    category: "Transport",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "Who was this Uber ride for?",
    status: "needs_review",
    confidence: 0.75
  },
  {
    ...day1,
    id: "txn-ubereats-286",
    merchant: "Uber Eats",
    rawDescription: "Uber Eats",
    amountMxn: -286.4,
    amountUsdc: toUsdc(-286.4),
    category: "Food delivery",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "Who was this Uber Eats order for?",
    status: "needs_review",
    confidence: 0.78
  },
  {
    ...day1,
    id: "txn-uber-16621",
    merchant: "Uber",
    rawDescription: "Uber",
    amountMxn: -166.21,
    amountUsdc: toUsdc(-166.21),
    category: "Transport",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "Who was this Uber ride for?",
    status: "needs_review",
    confidence: 0.75
  },
  {
    ...day1,
    id: "txn-amazon-1249",
    merchant: "Amazon",
    rawDescription: "AMAZON MX MKTPLACE",
    amountMxn: -1249,
    amountUsdc: toUsdc(-1249),
    category: "Uncategorized",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "What was this Amazon purchase?",
    status: "needs_review",
    confidence: 0.58
  },
  {
    ...day1,
    id: "txn-mercadopago-aes-169",
    merchant: "MercadoPago *AES",
    rawDescription: "MERCADOPAGO *AES",
    amountMxn: -169,
    amountUsdc: toUsdc(-169),
    category: "Uncategorized",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "What was this MercadoPago payment for?",
    status: "needs_review",
    confidence: 0.52
  },
  {
    ...day1,
    id: "txn-self-10000",
    merchant: "Transfer to myself",
    rawDescription: "Own account transfer",
    amountMxn: -10000,
    amountUsdc: toUsdc(-10000),
    category: "Transfer to self",
    beneficiary: "me",
    needsClarification: true,
    clarificationQuestion: "Is this large transfer between your own accounts?",
    status: "needs_review",
    confidence: 0.6
  },
  {
    ...day1,
    id: "txn-didi-prestamos-168406",
    merchant: "Didi Préstamos",
    rawDescription: "To Didi Préstamos",
    amountMxn: -1684.06,
    amountUsdc: toUsdc(-1684.06),
    category: "Debt payment",
    beneficiary: "me",
    needsClarification: true,
    clarificationQuestion: "Confirm this is a debt payment?",
    status: "needs_review",
    confidence: 0.9
  },
  {
    ...day1,
    id: "txn-apple-188",
    merchant: "Apple",
    rawDescription: "Apple",
    amountMxn: -188,
    amountUsdc: toUsdc(-188),
    category: "Digital services",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "What was this Apple charge?",
    status: "needs_review",
    confidence: 0.7
  }
];

// Simulated "tonight's screenshot": overlaps with day 1 (exact duplicates),
// contains one within-batch duplicate, and a few genuinely new transactions.
export const mockSecondBatch: Transaction[] = [
  {
    ...day1,
    id: "txn2-uber-07692",
    merchant: "Uber",
    rawDescription: "Uber",
    amountMxn: -76.92,
    amountUsdc: toUsdc(-76.92),
    category: "Transport",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "Who was this Uber ride for?",
    status: "needs_review",
    confidence: 0.76
  },
  {
    ...day1,
    id: "txn2-hbo-239",
    merchant: "HBO Max",
    rawDescription: "HBO max",
    amountMxn: -239,
    amountUsdc: toUsdc(-239),
    category: "Subscriptions",
    beneficiary: "me",
    needsClarification: false,
    clarificationQuestion: "",
    status: "approved",
    confidence: 0.94
  },
  {
    ...day2,
    id: "txn2-uber-09850-a",
    merchant: "Uber",
    rawDescription: "Uber",
    amountMxn: -98.5,
    amountUsdc: toUsdc(-98.5),
    category: "Transport",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "Who was this Uber ride for?",
    status: "needs_review",
    confidence: 0.77
  },
  {
    ...day2,
    id: "txn2-uber-09850-b",
    merchant: "Uber",
    rawDescription: "Uber",
    amountMxn: -98.5,
    amountUsdc: toUsdc(-98.5),
    category: "Transport",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "Who was this Uber ride for?",
    status: "needs_review",
    confidence: 0.77
  },
  {
    ...day2,
    id: "txn2-trattoria-780",
    merchant: "La Trattoria",
    rawDescription: "LA TRATTORIA CDMX",
    amountMxn: -780,
    amountUsdc: toUsdc(-780),
    category: "Food & drinks",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "How should this dinner be recorded?",
    status: "needs_review",
    confidence: 0.62
  },
  {
    ...day2,
    id: "txn2-oxxo-145",
    merchant: "OXXO",
    rawDescription: "OXXO CONDESA",
    amountMxn: -145,
    amountUsdc: toUsdc(-145),
    category: "Uncategorized",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "How should this purchase be recorded?",
    status: "needs_review",
    confidence: 0.6
  },
  {
    ...day2,
    id: "txn2-apple-188",
    merchant: "Apple",
    rawDescription: "Apple",
    amountMxn: -188,
    amountUsdc: toUsdc(-188),
    category: "Digital services",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "What was this Apple charge?",
    status: "needs_review",
    confidence: 0.7
  }
];
