import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

console.log("Password:", typeof process.env.DB_PASSWORD);

// const db = new Pool({
//     user: process.env.DB_USER,
//     host: process.env.DB_HOST,
//     database: process.env.DB_NAME,
//     password: process.env.DB_PASSWORD,
//     port: process.env.DB_PORT || 5432,
// });

const db = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false // Neon richiede SSL per connessioni remote
    }
});

export default db;

