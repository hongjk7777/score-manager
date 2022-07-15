import express from "express"
import {isAuthenticated} from "../auth/auth.js"

const router = express.Router();

router.get("/", isAuthenticated, (req, res) => res.render("settings/profile"));

export default router;