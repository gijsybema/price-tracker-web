import { pool } from "./db";

export type Deal = {
  id: number;
  name: string;
  current_price: number;
  previous_price: number;
  price_diff: number;
  price_drop_pct: number;
  url: string;
  price_level_since: string;
};

export async function getDealCandidates(): Promise<Deal[]> {
  try {
    const result = await pool.query(`
      SELECT *
      FROM deal_candidates
    `);
    console.log("deal_candidates rows:", result.rows.length);
    return result.rows;
  } catch (error) {
    console.error("Database error in getDealCandidates:", error);
    return [];
  }
}

export async function getDealpageDeals(): Promise<{
  deals: Deal[];
  error: boolean;
}> {
  try {
    const result = await pool.query(`
      SELECT *
      FROM dealpage_topdeals
    `);

    console.log("dealpage_topdeals rows:", result.rows.length);

    return {
      deals: result.rows,
      error: false,
    };
  } catch (error) {
    console.error("Database error in getDealpageDeals:", error);

    return {
      deals: [],
      error: true,
    };
  }
}

export async function getHomepageDeals(): Promise<{
  deals: Deal[];
  error: boolean;
}> {
  try {
    const result = await pool.query(`
      SELECT *
      FROM homepage_topdeals
    `);

    console.log("homepage_topdeals rows:", result.rows.length);

    return {
      deals: result.rows,
      error: false,
    };
  } catch (error) {
    console.error("Database error in getHomepageDeals:", error);

    return {
      deals: [],
      error: true,
    };
  }
}