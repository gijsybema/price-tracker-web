import OpenAI from "openai";
import type { SearchResult } from "./search";

declare global {
  // voorkomt te veel clients tijdens local hot reload
  // eslint-disable-next-line no-var
  var _openaiChat: OpenAI | undefined;
}

const openai =
  global._openaiChat ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  global._openaiChat = openai;
}

const MODEL = "gpt-4o-mini";

const SYSTEM_PROMPT = `Je schrijft één korte alinea in het Nederlands die uitlegt waarom het best passende product uit een zoekresultaat goed past bij de zoekopdracht van de gebruiker. Gebruik uitsluitend de meegeleverde productgegevens (naam, merk, prijs, voorraadstatus, beschrijving) — verzin geen specificaties, prijzen of eigenschappen die niet expliciet gegeven zijn. Noem alleen het best passende product (het eerste product in de lijst); ga niet in op de overige resultaten. Maximaal 2 zinnen. Geen opsommingen, geen markdown.`;

function buildUserMessage(query: string, topResult: SearchResult): string {
  const lines = [
    `Zoekopdracht: "${query}"`,
    "",
    "Best passende product:",
    `Naam: ${topResult.name}`,
    `Merk: ${topResult.brand}`,
    `Prijs: €${topResult.current_price ?? "onbekend"}`,
    `Op voorraad: ${topResult.in_stock ? "ja" : "nee"}`,
  ];
  if (topResult.ai_description) {
    lines.push(`Beschrijving: ${topResult.ai_description}`);
  }
  return lines.join("\n");
}

// Generates a one-paragraph Dutch summary grounded on a single search result
// (name/brand/price/in_stock/ai_description). Throws on failure — callers
// (Route Handler) handle the error.
export async function generateSearchSummary(
  query: string,
  topResult: SearchResult
): Promise<string> {
  const response = await openai.chat.completions.create({
    model: MODEL,
    temperature: 0.3,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserMessage(query, topResult) },
    ],
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}
