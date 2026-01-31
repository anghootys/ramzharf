import type { Request, Response } from "express";
import { getUserById, createUser } from "../models/user.model";

export const getProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.headers["x-user-id"] as string;

        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const user = await getUserById(userId);

        if (!user) {
            res.status(404).json({ error: "User not found" });
            return;
        }

        res.status(200).json(user);
    } catch (error) {
        console.error("Get profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const syncProfile = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id, username } = req.body;

        if (!id || !username) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const user = await createUser(id, username);
        res.status(200).json(user);
    } catch (error) {
        console.error("Sync profile error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

