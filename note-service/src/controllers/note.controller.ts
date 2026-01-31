import type { Request, Response } from "express";
import { createNote, getNoteById, deleteNoteById, getUserNotes } from "../models/note.model";
import type { AuthRequest } from "../middleware/auth.middleware";

export const create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { encryptedContent, salt, expiresIn } = req.body;
        const userId = req.userId!;

        if (!encryptedContent || !salt) {
            res.status(400).json({ error: "Encrypted content and salt are required" });
            return;
        }

        let expiresAt: Date | null = null;
        if (expiresIn && expiresIn !== "never") {
            const delayMs = parseInt(expiresIn);
            if (isNaN(delayMs) || delayMs <= 0) {
                res.status(400).json({ error: "Invalid expiration time" });
                return;
            }
            expiresAt = new Date(Date.now() + delayMs);
        }

        const note = await createNote(userId, encryptedContent, salt, expiresAt);
        res.status(201).json(note);
    } catch (error) {
        console.error("Create note error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;

        if (!id) {
            res.status(400).json({ error: "Note ID is required" });
            return;
        }

        const note = await getNoteById(id);

        if (!note) {
            res.status(404).json({ error: "Note not found" });
            return;
        }

        if (note.expires_at && new Date(note.expires_at) < new Date()) {
            res.status(410).json({ error: "Note has expired" });
            return;
        }

        res.status(200).json(note);
    } catch (error) {
        console.error("Get note error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const id = req.params.id as string;
        const userId = req.userId!;

        if (!id) {
            res.status(400).json({ error: "Note ID is required" });
            return;
        }

        const deleted = await deleteNoteById(id, userId);

        if (!deleted) {
            res.status(404).json({ error: "Note not found" });
            return;
        }

        res.status(200).json({ message: "Note deleted successfully" });
    } catch (error) {
        console.error("Delete note error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.userId!;
        const notes = await getUserNotes(userId);
        res.status(200).json(notes);
    } catch (error) {
        console.error("Get all notes error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

