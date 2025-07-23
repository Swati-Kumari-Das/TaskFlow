const express = require("express");
const { adminOnly, protect } = require("../middlewares/authMiddleware");
const router = express.Router();
const {getUsers,getUserById, deleteUser}=require("../controllers/userController")

// User Management Routes
router.get("/", protect, adminOnly, getUsers);         // Get all users (Admin only)
router.get("/:id", protect, getUserById);             // Get a specific user
router.delete("/:id", protect, adminOnly, deleteUser); // Delete user (Admin only)

module.exports = router;