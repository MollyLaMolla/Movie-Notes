import jwt from "jsonwebtoken";

export function authenticateToken(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ error: "Token richiesto" });

    jwt.verify(token.replace("Bearer ", ""), process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: "Token non valido" });
        req.user = user; // Ora req.user contiene id e role
        next();
    });
}


