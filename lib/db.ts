import { Pool } from "pg";

declare global {
  // voorkomt te veel pools tijdens local hot reload
  // eslint-disable-next-line no-var
  var _pool: Pool | undefined;
}

export const pool =
  global._pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
  });

if (process.env.NODE_ENV !== "production") {
  global._pool = pool;
}