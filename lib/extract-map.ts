import type { Transaction } from "./types";

export type ExtractedTransaction = {
  merchant: string;
  rawDescription?: string;
  amountMxn: number;
  transactionDate: string;
  direction?: "in" | "out";
  confidence?: number;
};

const exchangeRate = 18.25;

// Turns the model's extracted rows into full app transactions. Spending lands
// as needs_review (the review flow derives the right question per merchant);
// incoming money is approved and simply shown in activity.
export function toTransactions(extracted: ExtractedTransaction[]): Transaction[] {
  return extracted.map((row, index) => {
    const income = row.amountMxn >= 0;
    const confidence = typeof row.confidence === "number" ? row.confidence : 0.6;

    return {
      id: `ext-${Date.now()}-${index}-${Math.round(Math.random() * 1e6)}`,
      merchant: row.merchant,
      rawDescription: row.rawDescription || row.merchant,
      transactionDate: row.transactionDate,
      amountMxn: row.amountMxn,
      amountUsdc: Number((row.amountMxn / exchangeRate).toFixed(2)),
      sourceAccount: "ARQ",
      category: income ? "Income" : "Uncategorized",
      beneficiary: income ? "me" : "unknown",
      countsTowardGirlfriend: false,
      girlfriendAmountMxn: 0,
      purchaseNote: "",
      needsClarification: !income,
      clarificationQuestion: "",
      clarificationAnswer: "",
      status: income ? "approved" : "needs_review",
      confidence
    };
  });
}
