import express from "express";
import db from "../db/dbConfig";

const isAuthenticated = function (req, res, next) {
    if(req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/login");
    }
  };