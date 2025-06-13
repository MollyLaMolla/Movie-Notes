import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

// 🔄 Crea un pool di connessioni con timeout e keep-alive
const createPool = () => {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10, // Limita a 10 connessioni simultanee (evita sovraccarico)
        idleTimeoutMillis: 10000, // Aumenta il timeout di inattività (10s)
        keepAlive: true, // Mantiene la connessione sempre attiva
    });
};

let db = createPool();

// 🔹 Gestione errori → Riconnessione automatica senza crash
db.on("error", (err) => {
    console.error("❌ Errore database:", err);
    console.log("🔄 Tentativo di riconnessione...");
    db = createPool(); // Ricrea il pool di connessione
});

// 🔹 Protezione da errori critici che potrebbero chiudere il server
process.on("uncaughtException", (err) => {
    console.error("🚨 Errore critico:", err);
});

process.on("unhandledRejection", (err) => {
    console.error("🚨 Promessa rifiutata:", err);
});

export default db;

