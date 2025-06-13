import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

const createPool = () => {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10, // Limita connessioni simultanee
        idleTimeoutMillis: 5000, // Chiude connessioni inattive dopo 5s
    });
};

let db = createPool();

// Gestione errori → Riconnessione automatica
db.on("error", (err) => {
    console.error("❌ Errore database:", err);
    console.log("🔄 Riconnessione al database...");
    db = createPool(); // Ricrea il pool
});

export default db;

