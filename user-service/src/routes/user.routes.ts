import { Router } from "express";
import { getProfile, syncProfile } from "../controllers/user.controller";

const router = Router();

router.get("/profile", getProfile);
router.post("/sync", syncProfile);

export default router;

