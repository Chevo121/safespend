import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

// A capable, cost-reasonable vision model for reading a clean transaction list.
const MODEL = "claude-sonnet-5";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

type ExtractedTransaction = {
  merchant: string;
  rawDescription?: string;
  amountMxn: number;
  transactionDate: string;
  direction?: "in" | "out";
  confidence: number;
};

const recordTool = {
  name: "record_transactions",
  description: "Record every transaction found in the bank screenshot.",
  input_schema: {
    type: "object" as const,
    properties: {
      transactions: {
        type: "array",
        items: {
          type: "object",
          properties: {
            merchant: {
              type: "string",
              description:
                "Clean payee/merchant name, e.g. 'Uber', 'Uber Eats', 'Amazon', 'Apple', 'MercadoPago', 'HBO Max', 'Transfer to girlfriend', 'Transfer to myself', 'Didi Préstamos'."
            },
            rawDescription: {
              type: "string",
              description: "The raw text as shown on the statement line."
            },
            amountMxn: {
              type: "number",
              description:
                "Amount in MXN. NEGATIVE for money leaving the account (spending), POSITIVE for money coming in (deposits/income)."
            },
            transactionDate: {
              type: "string",
              description: "ISO date YYYY-MM-DD. If the year is not shown, assume the current year."
            },
            direction: { type: "string", enum: ["in", "out"] },
            confidence: {
              type: "number",
              description: "0 to 1 — how confident you are this row was read correctly."
            }
          },
          required: ["merchant", "amountMxn", "transactionDate", "confidence"]
        }
      }
    },
    required: ["transactions"]
  }
};

const PROMPT = `This is a screenshot of a transaction list from ARQ (formerly DolarApp), a Mexican fintech app. Extract every transaction you can see.

Rules:
- Amounts are in MXN. Use a NEGATIVE amount for money leaving the account (purchases, transfers out) and a POSITIVE amount for money coming in (deposits, income, refunds).
- Clean up merchant names (e.g. "MERCADOPAGO *AES" → "MercadoPago"). For transfers to a person, use "Transfer to <name>"; if the name matches the account owner use "Transfer to myself".
- Give an ISO date (YYYY-MM-DD) for each; if the year is missing assume the current year.
- Set confidence per row based on how clearly you could read it.
- Do not invent transactions. If the image has none, return an empty list.
Return the result by calling the record_transactions tool.`;

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Server missing ANTHROPIC_API_KEY." }, { status: 500 });
  }

  const expectedCode = process.env.APP_ACCESS_CODE;
  const providedCode = request.headers.get("x-access-code") ?? "";
  if (expectedCode && providedCode !== expectedCode) {
    return NextResponse.json({ error: "Invalid access code." }, { status: 401 });
  }

  let body: { image?: { media_type?: string; data?: string } };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const mediaType = body.image?.media_type;
  const data = body.image?.data;
  if (!data || !mediaType) {
    return NextResponse.json({ error: "No image provided." }, { status: 400 });
  }

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch(ANTHROPIC_URL, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: 4096,
        tools: [recordTool],
        tool_choice: { type: "tool", name: "record_transactions" },
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data } },
              { type: "text", text: PROMPT }
            ]
          }
        ]
      })
    });
  } catch {
    return NextResponse.json({ error: "Could not reach the extraction service." }, { status: 502 });
  }

  if (!anthropicResponse.ok) {
    const detail = await anthropicResponse.text().catch(() => "");
    console.error("Anthropic error", anthropicResponse.status, detail.slice(0, 500));
    return NextResponse.json(
      { error: "Extraction failed. Please try again." },
      { status: 502 }
    );
  }

  const result = (await anthropicResponse.json()) as {
    content?: Array<{ type: string; name?: string; input?: { transactions?: ExtractedTransaction[] } }>;
  };

  const toolUse = result.content?.find(
    (block) => block.type === "tool_use" && block.name === "record_transactions"
  );
  // The model sometimes returns the array already parsed and sometimes as a
  // JSON string — handle both.
  let raw: unknown = toolUse?.input?.transactions;
  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      raw = [];
    }
  }
  const transactions = (Array.isArray(raw) ? raw : []) as ExtractedTransaction[];

  // Basic sanity filter so a malformed row can't poison the import.
  const clean = transactions.filter(
    (tx) =>
      typeof tx.merchant === "string" &&
      typeof tx.amountMxn === "number" &&
      Number.isFinite(tx.amountMxn) &&
      typeof tx.transactionDate === "string" &&
      /^\d{4}-\d{2}-\d{2}$/.test(tx.transactionDate)
  );

  return NextResponse.json({ transactions: clean });
}
