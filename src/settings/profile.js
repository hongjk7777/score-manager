import express from "express"
import { isAuthenticated } from "../auth/authMiddleware";

const router = express.Router();

export default (app) => {
    app.use('/settings', router)

    router.get("/", isAuthenticated, (req, res) => res.render("settings/profile", {user: req.user}));
}
