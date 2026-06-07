import { NextRequest } from "next/server";
import { searchProducts } from "@/lib/search";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (q.length < 2) {
    return Response.json([]);
  }

  const results = await searchProducts(q);
  return Response.json(results);
}
