import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Neon richiede SSL per connessioni remote
    }
});

export default db;