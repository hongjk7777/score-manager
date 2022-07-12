import express from "express";
import auth from "../auth/auth.js"

const router = express.Router();


// console.log(auth);
router.get("/", auth.isAuthenticated, function(req, res) {
    res.render("classes");
});


module.exports = router;