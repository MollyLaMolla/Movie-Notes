import express from "express";
import jwt from "jsonwebtoken";
import db from "./db.js";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const result = await db.query("SELECT * FROM users WHERE username = $1", [username]);

        if (result.rows.length === 0) {
            return res.status(401).json({ error: "Utente non trovato" });
        }

        const user = result.rows[0];

        // Verifica la password (usa bcrypt per maggiore sicurezza)
        if (password !== user.password) {
            return res.status(403).json({ error: "Password errata" });
        }

        // Crea il token JWT con id e ruolo
        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, password: user.password },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ token });
    } catch (error) {
        console.error("Errore nel login:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

export default router;