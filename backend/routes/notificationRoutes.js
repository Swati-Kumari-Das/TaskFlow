const express = require("express");
const {
  getNotifications,
  markAllAsSeen,
  deleteNotification,
  clearAllNotifications,
} = require("../controllers/notificationController");

const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

// Protect all routes
router.use(protect);

router.get("/", getNotifications);
router.patch("/mark-all-seen", markAllAsSeen);
router.delete("/:id", deleteNotification);
router.delete("/", clearAllNotifications);

module.exports = router;
