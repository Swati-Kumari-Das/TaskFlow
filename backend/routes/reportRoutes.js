// backend/routes/reportRoutes.js
const express = require("express");
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const {
    exportTasksReport,
    exportUsersReport
} = require('../controllers/reportController');

const router = express.Router();

// Report Generation Routes
router.get("/export/tasks", protect, adminOnly, exportTasksReport); // Export all tasks (Excel/PDF)
router.get("/export/users", protect, adminOnly, exportUsersReport); // Export user-task assignments report

module.exports = router;