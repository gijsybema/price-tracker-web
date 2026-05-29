import { pool } from "./db";

export type PricePoint = {
  date: string;
  price: number;
};

export type Product = {
  id: number;
  name: string;
  brand: string;
  category: string;
  slug: string;
  product_url: string;
  image_url: string | null;
  specs: Record<string, unknown> | null;
  active: boolean;
  current_price: number | null;
  in_stock: boolean | null;
  old_price: number | null;
  price_diff: number | null;
  drop_percentage: number | null;
};

export async function getProductBySlug(
  category: string,
  slug: string
): Promise<Product | null> {
  try {
    const result = await pool.query<Product>(
      `
      SELECT
        p.id,
        p.name,
        p.brand,
        p.category,
        p.slug,
        p.product_url,
        p.image_url,
        p.specs,
        p.active,
        ph.price       AS current_price,
        ph.availability AS in_stock,
        pd.old_price,
        pd.price_diff,
        pd.drop_percentage
      FROM products p
      LEFT JOIN LATERAL (
        SELECT price, availability
        FROM price_history
        WHERE product_id = p.id
        ORDER BY scraped_at DESC
        LIMIT 1
      ) ph ON true
      LEFT JOIN LATERAL (
        SELECT old_price, price_diff, drop_percentage
        FROM price_drops
        WHERE product_id = p.id
        ORDER BY new_scraped_at DESC
        LIMIT 1
      ) pd ON true
      WHERE p.category = $1 AND p.slug = $2
      `,
      [category, slug]
    );

    return result.rows[0] ?? null;
  } catch (error) {
    console.error("Database error in getProductBySlug:", error);
    return null;
  }
}

export async function getPriceHistory(
  productId: number,
  days: number
): Promise<PricePoint[]> {
  try {
    const result = await pool.query<{ date: string; price: number }>(
      `
      SELECT DISTINCT ON (scraped_at::date)
        scraped_at::date::text AS date,
        price
      FROM price_history
      WHERE product_id = $1
        AND scraped_at >= NOW() - ($2 * INTERVAL '1 day')
      ORDER BY scraped_at::date ASC, scraped_at DESC
      `,
      [productId, days]
    );
    return result.rows;
  } catch (error) {
    console.error("Database error in getPriceHistory:", error);
    return [];
  }
}
