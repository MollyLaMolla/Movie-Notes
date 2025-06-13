import pg from "pg";
const { Pool } = pg;
import dotenv from "dotenv";
dotenv.config();

// 🔄 Funzione per creare un nuovo pool di connessioni
const createPool = () => {
    return new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        max: 10, // Limita a 10 connessioni simultanee (evita sovraccarico)
        idleTimeoutMillis: 60000, // Chiude connessioni inattive dopo 60s
        keepAlive: true, // Mantiene la connessione sempre attiva
    });
};

// 🔹 Gestione del pool con riconnessione automatica
let db = createPool();

const reconnectDB = async () => {
    console.log("🔄 Tentativo di riconnessione al database...");
    try {
        await db.end(); // Chiude il pool attuale prima di ricrearlo
    } catch (closeErr) {
        console.error("⚠ Errore nella chiusura del pool:", closeErr);
    }
    db = createPool(); // Ricrea il pool dopo aver chiuso il precedente
};

// 🔹 Gestione errori → Riconnessione automatica senza crash
db.on("error", (err) => {
    console.error("❌ Errore database:", err);
    reconnectDB();
});

// 🔹 Protezione da errori critici che potrebbero chiudere il server
process.on("uncaughtException", (err) => {
    console.error("🚨 Eccezione non gestita:", err);
    reconnectDB();
});

process.on("unhandledRejection", (err) => {
    console.error("🚨 Promessa rifiutata:", err);
    reconnectDB();
});

// 🔹 Funzione per ottenere sempre il pool attuale
export const getDB = () => db;

export default db;