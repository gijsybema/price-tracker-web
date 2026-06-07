import { pool } from "./db";

export type SearchResult = {
  id: number;
  name: string;
  brand: string;
  category: string;
  slug: string;
  image_url: string | null;
  current_price: number | null;
  price_diff: number | null;
  drop_percentage: number | null;
};

export async function searchProducts(query: string): Promise<SearchResult[]> {
  try {
    const result = await pool.query<SearchResult>(
      `
      SELECT
        p.id,
        p.name,
        p.brand,
        p.category,
        p.slug,
        p.image_url,
        ph.price AS current_price,
        CASE WHEN p30.high_30d > ph.price
             THEN p30.high_30d - ph.price
             ELSE NULL END AS price_diff,
        CASE WHEN p30.high_30d > ph.price AND p30.high_30d > 0
             THEN ROUND(((p30.high_30d - ph.price) / p30.high_30d * 100)::numeric, 1)
             ELSE NULL END AS drop_percentage
      FROM products p
      LEFT JOIN LATERAL (
        SELECT price
        FROM price_history
        WHERE product_id = p.id
        ORDER BY scraped_at DESC
        LIMIT 1
      ) ph ON true
      LEFT JOIN LATERAL (
        SELECT MAX(price) AS high_30d
        FROM price_history
        WHERE product_id = p.id
          AND scraped_at >= NOW() - INTERVAL '30 days'
      ) p30 ON true
      WHERE p.active = true
        AND to_tsvector('simple', coalesce(p.name, '') || ' ' || coalesce(p.brand, ''))
            @@ plainto_tsquery('simple', $1)
      ORDER BY ts_rank(
        to_tsvector('simple', coalesce(p.name, '') || ' ' || coalesce(p.brand, '')),
        plainto_tsquery('simple', $1)
      ) DESC
      LIMIT 10
      `,
      [query]
    );
    return result.rows;
  } catch (error) {
    console.error("Database error in searchProducts:", error);
    return [];
  }
}
