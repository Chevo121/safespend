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
    category: "Girlfriend",
    beneficiary: "girlfriend",
    countsTowardGirlfriend: true,
    girlfriendAmountMxn: 1300,
    needsClarification: true,
    clarificationQuestion: "What was this transfer to Corina for?",
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
    clarificationQuestion: "Is this a transfer between your own accounts?",
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
    ...base,
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
    ...base,
    id: "txn-self-10000",
    merchant: "To Eusebio Gonzalez",
    rawDescription: "To Eusebio Gonzalez",
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
    ...base,
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
    ...base,
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
