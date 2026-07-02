import type { GirlfriendTag, Transaction } from "./types";

export type FlowOption = {
  label: string;
  reply: string;
  next?: string;
  patch: (tx: Transaction) => Partial<Transaction>;
};

export type FlowStep = {
  question: string;
  options: FlowOption[];
};

const girlfriendFull = (tx: Transaction, tag: GirlfriendTag): Partial<Transaction> => ({
  beneficiary: "girlfriend",
  countsTowardGirlfriend: true,
  girlfriendAmountMxn: Math.abs(tx.amountMxn),
  girlfriendTag: tag
});

const girlfriendHalf = (tx: Transaction, tag: GirlfriendTag): Partial<Transaction> => ({
  beneficiary: "shared",
  countsTowardGirlfriend: true,
  girlfriendAmountMxn: Math.round(Math.abs(tx.amountMxn) / 2),
  girlfriendTag: tag
});

const girlfriendNone: Partial<Transaction> = {
  countsTowardGirlfriend: false,
  girlfriendAmountMxn: 0
};

function girlfriendCountStep(): FlowStep {
  return {
    question: "Should it count toward girlfriend spend?",
    options: [
      {
        label: "Yes, all of it",
        reply: "Counted in full toward girlfriend spend.",
        patch: (tx) => ({
          countsTowardGirlfriend: true,
          girlfriendAmountMxn: Math.abs(tx.amountMxn)
        })
      },
      {
        label: "Split 50/50",
        reply: "Half counted toward girlfriend spend.",
        patch: (tx) => ({
          beneficiary: "shared",
          countsTowardGirlfriend: true,
          girlfriendAmountMxn: Math.round(Math.abs(tx.amountMxn) / 2)
        })
      },
      {
        label: "No",
        reply: "Noted — it won't count toward girlfriend spend.",
        patch: () => girlfriendNone
      }
    ]
  };
}

function rideStep(tx: Transaction, isFood: boolean): FlowStep {
  const tag: GirlfriendTag = isFood ? "Food" : "Uber for her";

  return {
    question: isFood ? "Who was this order for?" : "Who was this ride for?",
    options: [
      {
        label: "Me",
        reply: isFood ? "Logged as your order." : "Logged as your ride.",
        patch: () => ({ beneficiary: "me", ...girlfriendNone })
      },
      {
        label: "Girlfriend",
        reply: "Added to girlfriend spend.",
        patch: (t) => girlfriendFull(t, tag)
      },
      {
        label: "Shared",
        reply: "Split 50/50 with girlfriend spend.",
        patch: (t) => girlfriendHalf(t, isFood ? "Food" : "Shared expenses")
      },
      {
        label: "Someone else",
        reply: "Got it — still your spend, tagged for someone else.",
        patch: () => ({ beneficiary: "friend", ...girlfriendNone })
      }
    ]
  };
}

const amazonCategories: Array<{ label: string; category: string }> = [
  { label: "Clothes", category: "Clothes shopping" },
  { label: "Tech", category: "Electronics" },
  { label: "Home", category: "Home" },
  { label: "Pet", category: "Pet" },
  { label: "Supplement", category: "Health" },
  { label: "Gift", category: "Gifts" }
];

const mercadoPagoCategories: Array<{ label: string; category: string }> = [
  { label: "Food", category: "Food & drinks" },
  { label: "Shopping", category: "Shopping" },
  { label: "Service", category: "Services" },
  { label: "Transfer", category: "Transfers" }
];

const appleCategories: Array<{ label: string; category: string }> = [
  { label: "iCloud", category: "Digital services" },
  { label: "App", category: "Digital services" },
  { label: "Subscription", category: "Subscriptions" },
  { label: "Device", category: "Devices" },
  { label: "Other", category: "Digital services" }
];

function categoryOption(label: string, category: string): FlowOption {
  return {
    label,
    reply: `Categorized as ${category}.`,
    patch: () => ({ category, beneficiary: "me" })
  };
}

const girlfriendPurchaseOption: FlowOption = {
  label: "Girlfriend",
  reply: "Tagged for your girlfriend.",
  next: "girlfriend-count",
  patch: (tx) => ({ ...girlfriendFull(tx, "Gifts"), category: "Girlfriend" })
};

const corinaTags: Array<{ label: string; tag: GirlfriendTag }> = [
  { label: "Gift", tag: "Gifts" },
  { label: "Support", tag: "Support" },
  { label: "Reimbursement", tag: "Reimbursements" },
  { label: "Shared expense", tag: "Shared expenses" },
  { label: "Date / food", tag: "Dates" },
  { label: "Transport", tag: "Transport" },
  { label: "Other", tag: "Other" }
];

export function getFlowStep(tx: Transaction, stepId = "start"): FlowStep {
  if (stepId === "girlfriend-count") {
    return girlfriendCountStep();
  }

  const merchant = tx.merchant.toLowerCase();

  if (merchant.includes("uber eats")) {
    return rideStep(tx, true);
  }

  if (merchant.includes("uber")) {
    return rideStep(tx, false);
  }

  if (merchant.includes("amazon")) {
    return {
      question: "What was this Amazon purchase?",
      options: [
        ...amazonCategories.map(({ label, category }) => categoryOption(label, category)),
        girlfriendPurchaseOption,
        categoryOption("Other", "Shopping")
      ]
    };
  }

  if (merchant.includes("mercadopago")) {
    return {
      question: "What was this MercadoPago payment for?",
      options: [
        ...mercadoPagoCategories.map(({ label, category }) => categoryOption(label, category)),
        girlfriendPurchaseOption,
        categoryOption("Other", "Shopping")
      ]
    };
  }

  if (merchant.includes("apple")) {
    return {
      question: "What was this Apple charge?",
      options: appleCategories.map(({ label, category }) => categoryOption(label, category))
    };
  }

  if (merchant.includes("corina")) {
    return {
      question: "What was this transfer to Corina for?",
      options: corinaTags.map(({ label, tag }) => ({
        label,
        reply: `Tagged as ${label.toLowerCase()}.`,
        next: "girlfriend-count",
        patch: () => ({
          category: "Girlfriend",
          beneficiary: "girlfriend",
          girlfriendTag: tag
        })
      }))
    };
  }

  if (merchant.includes("eusebio")) {
    return {
      question:
        Math.abs(tx.amountMxn) >= 5000
          ? "This is a large transfer to yourself. Move between your own accounts?"
          : "Is this a transfer between your own accounts?",
      options: [
        {
          label: "Yes, exclude it",
          reply: "Excluded — transfers to yourself don't count as spending.",
          patch: () => ({ status: "ignored", category: "Transfer to self" })
        },
        {
          label: "No, real spending",
          reply: "Kept as real spending.",
          patch: () => ({ category: "Uncategorized", beneficiary: "me" })
        }
      ]
    };
  }

  if (merchant.includes("didi")) {
    return {
      question: "Confirm this payment to Didi Préstamos as a debt payment?",
      options: [
        {
          label: "Confirm debt payment",
          reply: "Confirmed as a debt payment.",
          patch: () => ({ category: "Debt payment" })
        },
        {
          label: "Something else",
          reply: "Okay — left uncategorized for now.",
          patch: () => ({ category: "Uncategorized" })
        }
      ]
    };
  }

  return {
    question: tx.clarificationQuestion || "How should this be recorded?",
    options: [
      {
        label: "Approve",
        reply: "Approved.",
        patch: () => ({})
      },
      {
        label: "Ignore",
        reply: "Ignored — it won't affect your totals.",
        patch: () => ({ status: "ignored" })
      }
    ]
  };
}
