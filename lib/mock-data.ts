import type { Budget, Transaction } from "./types";

export const defaultBudget: Budget = {
  fixedMonthlyIncome: 65000,
  requiredSavings: 16500,
  monthlySpendCap: 48500,
  commissionSavingsRate: 0.7
};

const exchangeRate = 18.25;

const toUsdc = (amountMxn: number) => Number((amountMxn / exchangeRate).toFixed(2));

const base = {
  transactionDate: "2026-07-01",
  sourceAccount: "ARQ" as const,
  purchaseNote: "",
  clarificationAnswer: "",
  countsTowardGirlfriend: false,
  girlfriendAmountMxn: 0
};

export const mockTransactions: Transaction[] = [
  {
    ...base,
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
    ...base,
    id: "txn-hbo-239",
    merchant: "HBO max",
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
    ...base,
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
    ...base,
    id: "txn-corina-1300",
    merchant: "To Corina Arellano",
    rawDescription: "To Corina Arellano",
    amountMxn: -1300,
    amountUsdc: toUsdc(-1300),
    category: "Transfer",
    beneficiary: "girlfriend",
    countsTowardGirlfriend: true,
    girlfriendAmountMxn: 1300,
    needsClarification: true,
    clarificationQuestion:
      "Was this for a gift, support, reimbursement, shared expense, date/food, transport, or other?",
    status: "needs_review",
    confidence: 0.65
  },
  {
    ...base,
    id: "txn-self-120",
    merchant: "To Eusebio Gonzalez",
    rawDescription: "To Eusebio Gonzalez",
    amountMxn: -120,
    amountUsdc: toUsdc(-120),
    category: "Transfer to self",
    beneficiary: "me",
    needsClarification: true,
    clarificationQuestion: "Confirm this is a transfer to self and should be ignored?",
    status: "needs_review",
    confidence: 0.7
  },
  {
    ...base,
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
    ...base,
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
    ...base,
    id: "txn-mercadopago-aes-169",
    merchant: "MERCADOPAGO *AES",
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
    ...base,
    id: "txn-self-10000",
    merchant: "To Eusebio Gonzalez",
    rawDescription: "To Eusebio Gonzalez",
    amountMxn: -10000,
    amountUsdc: toUsdc(-10000),
    category: "Transfer to self",
    beneficiary: "me",
    needsClarification: true,
    clarificationQuestion: "Large transfer to self. Confirm this should be ignored?",
    status: "needs_review",
    confidence: 0.6
  },
  {
    ...base,
    id: "txn-didi-prestamos-168406",
    merchant: "To Didi Préstamos",
    rawDescription: "To Didi Préstamos",
    amountMxn: -1684.06,
    amountUsdc: toUsdc(-1684.06),
    category: "Debt payment",
    beneficiary: "me",
    needsClarification: true,
    clarificationQuestion: "This is a debt payment over 1,000 MXN. Confirm it?",
    status: "needs_review",
    confidence: 0.9
  },
  {
    ...base,
    id: "txn-apple-188",
    merchant: "Apple",
    rawDescription: "Apple",
    amountMxn: -188,
    amountUsdc: toUsdc(-188),
    category: "Digital services",
    beneficiary: "unknown",
    needsClarification: true,
    clarificationQuestion: "Was this iCloud, app, subscription, device, or other?",
    status: "needs_review",
    confidence: 0.7
  }
];

export const clarificationOptions: Record<string, string[]> = {
  Uber: ["Me", "Girlfriend", "Shared", "Someone else"],
  Amazon: ["Home", "Gift", "Work", "Other"],
  "MERCADOPAGO *AES": ["Groceries", "Bill", "Gift", "Other"],
  Apple: ["iCloud", "App", "Subscription", "Device", "Other"],
  "To Corina Arellano": [
    "Gift",
    "Support",
    "Reimbursement",
    "Shared expense",
    "Date/food",
    "Transport",
    "Other"
  ],
  "To Eusebio Gonzalez": ["Transfer to self", "Real spending", "Needs more review"],
  "To Didi Préstamos": ["Debt payment", "Needs more review"]
};
