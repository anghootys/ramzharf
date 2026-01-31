import { Router } from "express";
import * as noteController from "../controllers/note.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();

// Protected routes - require authentication (must be before /:id)
router.get("/my-notes", authenticateToken, noteController.getAll);
router.post("/create", authenticateToken, noteController.create);
router.delete("/:id", authenticateToken, noteController.deleteById);

// Public route - anyone can get note by URL
router.get("/:id", noteController.getById);

export default router;

