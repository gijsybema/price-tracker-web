import OpenAI from "openai";

declare global {
  // voorkomt te veel clients tijdens local hot reload
  // eslint-disable-next-line no-var
  var _openai: OpenAI | undefined;
}

const openai =
  global._openai ??
  new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

if (process.env.NODE_ENV !== "production") {
  global._openai = openai;
}

// Embeds text with text-embedding-3-small, returns a 1536-dim vector.
// Throws on failure — callers (Server Action) handle the error.
export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  return response.data[0].embedding;
}
