import { Pool } from 'pg';

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'b2b',
  password: 'your_password', // Replace with your actual password
  port: 5432,
});

export default pool;