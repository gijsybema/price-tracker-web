import { pool } from "./db";

export type PricePoint = {
  date: string;
  price: number;
};

export type CategorySummary = {
  category: string;
  product_count: number;
  deal_count: number;
  image_url: string | null;
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
  ai_description: string | null;
  ai_deal_description: string | null;
  active: boolean;
  current_price: number | null;
  in_stock: boolean | null;
  high_30d: number | null;
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
        p.ai_description,
        p.ai_deal_description,
        p.active,
        ph.price        AS current_price,
        ph.availability AS in_stock,
        p30.high_30d,
        CASE WHEN p30.high_30d > ph.price
             THEN p30.high_30d - ph.price
             ELSE NULL END AS price_diff,
        CASE WHEN p30.high_30d > ph.price AND p30.high_30d > 0
             THEN ROUND(((p30.high_30d - ph.price) / p30.high_30d * 100)::numeric, 1)
             ELSE NULL END AS drop_percentage
      FROM products p
      LEFT JOIN LATERAL (
        SELECT price, availability
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

export async function getProductsByCategory(category: string): Promise<Product[]> {
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
        ph.price        AS current_price,
        ph.availability AS in_stock,
        p30.high_30d,
        CASE WHEN p30.high_30d > ph.price
             THEN p30.high_30d - ph.price
             ELSE NULL END AS price_diff,
        CASE WHEN p30.high_30d > ph.price AND p30.high_30d > 0
             THEN ROUND(((p30.high_30d - ph.price) / p30.high_30d * 100)::numeric, 1)
             ELSE NULL END AS drop_percentage
      FROM products p
      LEFT JOIN LATERAL (
        SELECT price, availability
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
      WHERE p.category = $1
        AND p.active = true
      ORDER BY p.name ASC
      `,
      [category]
    );
    return result.rows;
  } catch (error) {
    console.error("Database error in getProductsByCategory:", error);
    return [];
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

export async function getAllActiveProductSlugs(): Promise<{ category: string; slug: string }[]> {
  try {
    const result = await pool.query<{ category: string; slug: string }>(
      `SELECT category, slug FROM products WHERE active = true ORDER BY category, slug`
    );
    return result.rows;
  } catch (error) {
    console.error("Database error in getAllActiveProductSlugs:", error);
    return [];
  }
}

export async function getCategorySummaries(): Promise<CategorySummary[]> {
  try {
    const result = await pool.query<CategorySummary>(`
      WITH product_prices AS (
        SELECT
          p.category,
          p.image_url,
          ph.price        AS current_price,
          ph.availability AS in_stock,
          CASE WHEN p30.high_30d > ph.price AND ph.price IS NOT NULL
               THEN p30.high_30d - ph.price
               ELSE NULL END AS price_diff
        FROM products p
        LEFT JOIN LATERAL (
          SELECT price, availability
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
          AND p.category IN ('headphones', 'earbuds', 'speakers', 'soundbars')
      ),
      category_images AS (
        SELECT DISTINCT ON (category)
          category,
          image_url
        FROM product_prices
        WHERE in_stock = true
          AND current_price IS NOT NULL
        ORDER BY category, current_price DESC
      )
      SELECT
        pp.category,
        COUNT(*)::int                                        AS product_count,
        COUNT(*) FILTER (
          WHERE pp.in_stock = true
            AND pp.price_diff >= 25
            AND pp.current_price > 100
        )::int                                               AS deal_count,
        ci.image_url
      FROM product_prices pp
      LEFT JOIN category_images ci ON ci.category = pp.category
      GROUP BY pp.category, ci.image_url
    `);
    return result.rows;
  } catch (error) {
    console.error("Database error in getCategorySummaries:", error);
    return [];
  }
}
