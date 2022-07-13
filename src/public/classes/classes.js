import express from "express";
import {isAuthenticated} from "../auth/auth.js"

const router = express.Router();

router.get("/", isAuthenticated, function(req, res) {
    res.render("classes");
});


export default router;