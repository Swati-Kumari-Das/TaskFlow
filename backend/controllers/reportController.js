// backend/controllers/reportController.js
const Task = require("../models/Task");
const User = require("../models/User");
const excelJS = require("exceljs");

/**
 * @desc    Export all tasks as an Excel file
 * @route   GET /api/reports/export/tasks
 * @access  Private (Admin)
 */
const exportTasksReport = async (req, res) => {
    try {
        // Implementation for exporting tasks
        // Would include:
        // 1. Fetching all tasks
        // 2. Creating Excel workbook
        // 3. Formatting data
        // 4. Sending the file
                const tasks = await Task.find()
    .populate("assignedTo", "name email")
    .lean(); // Convert to plain JavaScript objects

const workbook = new excelJS.Workbook(); // Fixed typo: Morkbook → Workbook
const worksheet = workbook.addWorksheet("Tasks Report");

// Define worksheet columns
worksheet.columns = [
    { header: "Task ID", key: "_id", width: 25 },
    { header: "Title", key: "title", width: 30 },
    { header: "Description", key: "description", width: 50 },
    { header: "Priority", key: "priority", width: 15 },
    { header: "Status", key: "status", width: 20 },
    { 
        header: "Due Date", 
        key: "dueDate", 
        width: 20,
        // style: { numFmt: 'yyyy-mm-dd' } // Format dates consistently
    },
    { 
        header: "Assigned To", 
        key: "assignedTo", 
        width: 30,
        // Custom value mapper for populated user data
       
    }
];
      // Process tasks and add to worksheet
tasks.forEach((task) => {
    // Format assigned users
    const assignedTo = task.assignedTo
        .map((user) => `${user.name} (${user.email})`).join(", ")
     

   
    // Add row to worksheet
    worksheet.addRow({
        _id: task._id.toString(), // Ensure ObjectId is converted to string
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
        dueDate: task.dueDate.toISOString().split("T")[0],
        assignedTo: assignedTo|| "Unassigned",
    });
});

// Set response headers for Excel download
res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);
res.setHeader(
    "Content-Disposition",
    `attachment; filename="tasks-report.xlsx"`
);

    return workbook.xlsx.write(res).then(()=>{
       res.end();
    });
    
    } catch (error) {
        res.status(500).json({ 
            message: "Error exporting tasks report", 
            error: error.message 
        });
    }
};

/**
 * @desc    Export user-task assignments report as an Excel file
 * @route   GET /api/reports/export/users
 * @access  Private (Admin)
 */



const exportUsersReport = async (req, res) => {
    try {
        // Implementation for exporting user-task relationships
        const users = await User.find().select("name email").lean(); // Changed email_id to email
        const userTasks = await Task.find().populate(
            "assignedTo",
            "name email" // Changed email_id to email
        ).lean();

        const userTaskMap = {};
        users.forEach((user) => { // Fixed arrow function syntax
            userTaskMap[user._id] = { // Fixed bracket notation
                name: user.name,
                email: user.email,
                taskCount: 0,
                pendingTasks: 0,
                inProgressTasks: 0,
                completedTasks: 0,
            };
        });

        userTasks.forEach((task) => {
            if (task.assignedTo) {
                if (Array.isArray(task.assignedTo)) { // Added array check
                    task.assignedTo.forEach((assignedUser) => {
                        if (assignedUser && userTaskMap[assignedUser._id]) {
                            userTaskMap[assignedUser._id].taskCount += 1;
                            if (task.status === "Pending") {
                                userTaskMap[assignedUser._id].pendingTasks += 1;
                            } else if (task.status === "In Progress") {
                                userTaskMap[assignedUser._id].inProgressTasks += 1;
                            } else if (task.status === "Completed") {
                                userTaskMap[assignedUser._id].completedTasks += 1;
                            }
                        }
                    });
                } else if (task.assignedTo._id) { // Handle single user assignment
                    if (userTaskMap[task.assignedTo._id]) {
                        userTaskMap[task.assignedTo._id].taskCount += 1;
                        if (task.status === "Pending") {
                            userTaskMap[task.assignedTo._id].pendingTasks += 1;
                        } else if (task.status === "In Progress") {
                            userTaskMap[task.assignedTo._id].inProgressTasks += 1;
                        } else if (task.status === "Completed") {
                            userTaskMap[task.assignedTo._id].completedTasks += 1;
                        }
                    }
                }
            }
        });

        const workbook = new excelJS.Workbook();
        const worksheet = workbook.addWorksheet("User Task Report");

        worksheet.columns = [
            { header: "User Name", key: "name", width: 30 },
            { header: "Email", key: "email", width: 40 },
            { header: "Total Assigned Tasks", key: "taskCount", width: 20 },
            { header: "Pending Tasks", key: "pendingTasks", width: 20 },
            { 
                header: "In Progress Tasks",
                key: "inProgressTasks",
                width: 20 
            },
            { header: "Completed Tasks", key: "completedTasks", width: 20 }
        ];

        Object.values(userTaskMap).forEach((user) => {
            worksheet.addRow(user);
        });

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="users_report.xlsx"'
        );

       return workbook.xlsx.write(res).then(()=>{
        res.end();
       });

    } catch (error) {
        res.status(500).json({ 
            message: "Error exporting users report", 
            error: error.message 
        });
    }
};
module.exports = {
    exportTasksReport,
    exportUsersReport
};