const express = require("express");
const passport = require("passport");
const userController = require("../controllers/userController");
const authRouter = express.Router();

authRouter.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    res.redirect(`https://frontend-839795182838.us-central1.run.app/login?userId=${req.user._id}`);
  }
);

authRouter.post("/register", userController.registerUser);

authRouter.post("/login", userController.loginUser);

authRouter.post("/logout", userController.logoutUser);

module.exports = authRouter;
