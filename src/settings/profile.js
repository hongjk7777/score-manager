import express from "express"
import { isAuthenticated } from "../auth/authMiddleware";

const router = express.Router();

router.get("/", isAuthenticated, (req, res) => res.render("settings/profile", {user: req.user}));

export default router;