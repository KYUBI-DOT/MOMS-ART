const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

//  Registration
router.post("/register", authController.register);

//  Login
router.post("/login", authController.loginUser);

//  Forgot Password - Request Reset
router.get("/forgot-password", (req, res) => {
  res.render("forgot-password", { message: null });
});

router.post("/forgot-password", authController.sendResetLink);

//  Password Reset - With Token
router.get("/password-reset/:token", authController.renderResetForm);
router.post("/password-reset/:token", authController.resetPassword);

module.exports = router;
