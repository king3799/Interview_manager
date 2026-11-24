import { Pool } from "pg";

const pool = new Pool({
  host: "localhost",
  port: 5433,
  user: "postgres",
  password: "qwer1234",
  database: "interviewjob",
  max: 2,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export default pool;
