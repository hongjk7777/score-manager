import express from "express"

const router = express.Router();

router.get("/", (req, res) => res.render("settings/profile"));

export default router;