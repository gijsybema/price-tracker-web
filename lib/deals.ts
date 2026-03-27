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

export async function getDealpageDeals(): Promise<Deal[]> {
  const result = await pool.query(`
    SELECT *
    FROM dealpage_topdeals
  `);
  return result.rows;
}

export async function getHomepageDeals(): Promise<Deal[]> {
  const result = await pool.query(`
    SELECT *
    FROM homepage_topdeals
  `);
  return result.rows;
}

export async function getDealCandidates(): Promise<Deal[]> {
  const result = await pool.query(`
    SELECT *
    FROM deal_candidates
  `);
  return result.rows;
}