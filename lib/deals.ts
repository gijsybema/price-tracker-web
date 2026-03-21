import { pool } from "./db";

export type Deal = {
  id: number;
  name: string;
  current_price: number;
  previous_price: number;
  price_diff: number;
  price_drop_pct: number;
  retailer: string;
  url: string;
  detected_at: string;
};

export async function getLatestDeals(): Promise<Deal[]> {
  const query = `
    SELECT
      pd.product_id AS id,
      p.name,
      pd.old_price AS previous_price,
      pd.new_price AS current_price,
      pd.price_diff,
      pd.drop_percentage AS price_drop_pct,
      p.product_url AS url,
      pd.new_scraped_at::text AS detected_at
    FROM price_drops pd
    JOIN products p
      ON p.id = pd.product_id
    JOIN price_history ph
      ON ph.product_id = pd.product_id
     AND ph.scraped_at = CURRENT_DATE
    WHERE pd.new_scraped_at = CURRENT_DATE
      AND ph.availability = TRUE
    ORDER BY pd.price_diff DESC
    LIMIT 20;
  `;

  const result = await pool.query(query);
  return result.rows;
}