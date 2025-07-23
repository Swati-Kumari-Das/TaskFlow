const Notification = require("../models/Notification");

// @desc    Get all notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications", error: error.message });
  }
};

// @desc    Mark all notifications as seen
// @route   PATCH /api/notifications/mark-all-seen
const markAllAsSeen = async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user._id, seen: false },
      { $set: { seen: true } }
    );
    res.status(200).json({ message: "All notifications marked as seen" });
  } catch (error) {
    res.status(500).json({ message: "Failed to mark as seen", error: error.message });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
const deleteNotification = async (req, res) => {
  try {
    await Notification.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    res.status(200).json({ message: "Notification deleted" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete notification", error: error.message });
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/notifications
const clearAllNotifications = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.status(200).json({ message: "All notifications cleared" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear notifications", error: error.message });
  }
};

module.exports = {
  getNotifications,
  markAllAsSeen,
  deleteNotification,
  clearAllNotifications,
};
