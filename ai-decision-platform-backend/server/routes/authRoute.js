const express = require('express');
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.Login);
router.post("/logout", authController.logout);
router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "This is a protected route", userId: req.user });
});
router.get("/profile", authMiddleware, authController.getProfile);

module.exports = router;