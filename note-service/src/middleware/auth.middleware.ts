import type { Request, Response, NextFunction } from "express";
const jwt = require("jsonwebtoken");

export interface AuthRequest extends Request {
    userId?: string;
    username?: string;
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        res.status(401).json({ error: "Access token required" });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
        req.userId = decoded.userId;
        req.username = decoded.username;
        next();
    } catch (error) {
        res.status(403).json({ error: "Invalid or expired token" });
    }
};

