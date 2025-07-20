const Task = require("../models/Task");

// @desc    Get all tasks (Admin: all, User: only assigned tasks)
// @route    GET /api/tasks/
// @access  Private
const getTasks = async (req, res) => {
    try {
        const {status}=req.query;
        let filter={};
        if(status){
         filter.status=status;
        }
        let tasks;

        if(req.user.role==="admin"){
            tasks=await Task.find(filter).populate(
                "assignedTo",
                "name email profileImageUrl"
            );

        }else{
            tasks=await Task.find({...filter,assignedTo:req.user._id}).populate(
                "assignedTo",
                "name email profileImageUrl"
            );
        }

        // Add completed todoChecklist count to each task
tasks = await Promise.all(
    tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
            (item) => item.completed
        ).length;
        return {
            ...task._doc,
            completedTodoCount: completedCount
        };
    })
);

// Status summary counts
const allTasks = await Task.countDocuments(
    req.user.role === "admin" ? {} : { assignedTo: req.user._id }
);

const pendingTasks = await Task.countDocuments({
    ...filter,
   // status: "Pending",
    status: { $regex: /^pending$/i },
    ...(req.user.role !== "admin" && { assignedTo: req.user._id }),

});

const inProgressTasks = await Task.countDocuments({
    ...filter,
    //status: "In Progress",
    status: { $regex: /^in progress$/i },
    ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
});

const completedTasks = await Task.countDocuments({
    ...filter,
   // status: "Completed",
    status: { $regex: /^completed$/i }, 
    ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
});

res.json({
    tasks,
    statusSummary: {
        all: allTasks,
        pending: pendingTasks,
        inProgress: inProgressTasks,
        completed: completedTasks,
    },
});
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Get task by ID
// @route    GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res) => {
    try {
        const task=await Task.findById(req.params.id).populate(
            "assignedTo",
            "name email profileImageUrl"
        );
        if(!task) return res.status(404).json({message:"Task not found"});
        res.json(task);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// @desc    Create a new task (Admin only)
// @route    POST /api/tasks/
// @access  Private (Admin)
const createTask = async (req, res) => {
    try {

       //   console.log("🔍 Request Body:", req.body);            // ✅ Step 1
       // console.log("👤 req.user:", req.user);   
        const{
            title,
            description,
            priority,
            dueDate,
            assignedTo,
            attachments,
            todoChecklist,

        }=req.body;
        if(!Array.isArray(assignedTo)){
            return res.status(400).json({message:"assignedTo must be an array of user IDs"});
        }

        const formattedPriority =
  priority?.charAt(0).toUpperCase() + priority?.slice(1).toLowerCase();
        const task=await Task.create({
            title,
            description,
            //priority,
              priority: formattedPriority,
            dueDate,
            assignedTo,
            createdBy:req.user._id,
            todoChecklist,
            attachments,
        });
        res.status(201).json({message:"Task created successfully",task});
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// @desc    Update task details
// @route    PUT /api/tasks/:id
// @access  Private
// const updateTask = async (req, res) => {
//     try {
//          const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });
    
//     // Update task fields if provided in request
//     task.title = req.body.title || task.title;
//     task.description = req.body.description || task.description;
//     task.priority = req.body.priority || task.priority;
//     task.dueDate = req.body.dueDate || task.dueDate;
//     task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
//     task.attachments = req.body.attachments || task.attachments;

//     // Validate and update assigned users
//     if (req.body.assignedTo) {
//         if (!Array.isArray(req.body.assignedTo)) {
//             return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
//         }
//         task.assignedTo = req.body.assignedTo;
//     }

//     const updatedTask = await task.save();
//     res.json({ message: "Task updated successfully", updatedTask });
//     } catch (error) {
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// }

const updateTask = async (req, res) => {
    try {
        console.log("🔧 Incoming update request:", req.body);

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ message: "Task not found" });

        task.title = req.body.title || task.title;
        task.description = req.body.description || task.description;
       // task.priority = req.body.priority || task.priority;
       // Normalize and validate priority
if (req.body.priority) {
    const normalizedPriority =
        req.body.priority.charAt(0).toUpperCase() + req.body.priority.slice(1).toLowerCase();
    
    const allowedPriorities = ["Low", "Medium", "High"];
    if (allowedPriorities.includes(normalizedPriority)) {
        task.priority = normalizedPriority;
    } else {
        return res.status(400).json({ message: "Invalid priority value" });
    }
}

        task.dueDate = req.body.dueDate || task.dueDate;
        task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
        task.attachments = req.body.attachments || task.attachments;

        if (req.body.assignedTo) {
            if (!Array.isArray(req.body.assignedTo)) {
                console.log("❌ assignedTo is not an array:", req.body.assignedTo);
                return res.status(400).json({ message: "assignedTo must be an array of user IDs" });
            }
            task.assignedTo = req.body.assignedTo;
        }

        const updatedTask = await task.save();
        console.log("✅ Task updated:", updatedTask);

        res.json({ message: "Task updated successfully", updatedTask });
    } catch (error) {
        console.error("❌ Error in updateTask:", error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


// @desc    Delete a task (Admin only)
// @route    DELETE /api/tasks/:id
// @access  Private (Admin)
const deleteTask = async (req, res) => {
    try {
        const task=await Task.findById(req.params.id);
        if(!task) return res.status(404).json({message:"Task not Found"});
        await task.deleteOne();
        res.json({ message: "Task deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// @desc    Update task status
// @route    PUT /api/tasks/:id/status
// @access  Private
const updateTaskStatus = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
if (!task) {
    return res.status(404).json({ message: "Task not found" });
}

// Check if user is assigned to task or is admin
const isAssigned = task.assignedTo.some(
    (userId) => userId.toString() === req.user._id.toString()
);

if (!isAssigned && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized" });
}

// Update task status
task.status = req.body.status || task.status;

// If task is marked as completed, update all checklist items
if (task.status === "Completed") {
    task.todoChecklist.forEach((item) => {
        item.completed = true;
    });
    task.progress = 100;
}

await task.save();
res.json({ 
    message: "Task status updated successfully", 
    task 
});
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// @desc    Update task checklist
// @route    PUT /api/tasks/:id/todo
// @access  Private
const updateTaskChecklist = async (req, res) => {
    try {
        const { todoChecklist } = req.body;
const task = await Task.findById(req.params.id);

if (!task) {
    return res.status(404).json({ message: "Task not found" });
}

// Check authorization (either assigned user or admin)
if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
    return res.status(403).json({ message: "Not authorized to update checklist" });
}

// Update the checklist
task.todoChecklist = todoChecklist;

// Calculate progress based on completed checklist items
const completedCount = task.todoChecklist.filter(
    (item) => item.completed
).length;
const totalItems = task.todoChecklist.length;
task.progress = totalItems > 0 ? Math.round((completedCount / totalItems) * 100) : 0;
 
//Auto-mark task as completed if all items are checked
if(task.progress===100){
    task.status="Completed";
}else if(task.progress>0){
    task.status="In Progress";
}else{
    task.status="Pending";
}
await task.save();
const updatedTask=await Task.findById(req.params.id).populate(
    "assignedTo",
    "name email profileImaageUrl"
);
res.json({ 
    message: "Task Checklist updated successfully", 
    task:updateTask
});
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// @desc    Dashboard Data (Admin only)
// @route    GET /api/tasks/dashboard-data
// @access  Private
const getDashboardData = async (req, res) => {
    try {
        // Get task statistics for dashboard
     const totalTasks = await Task.countDocuments();
     const pendingTasks = await Task.countDocuments({ status: "Pending" });
     const completedTasks = await Task.countDocuments({ status: "Completed" });
     const overdueTasks = await Task.countDocuments({
    status: { $ne: "Completed" },
    dueDate: { $lt: new Date() }
    });

    // Get task distribution by status
    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await Task.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            },
        },
    ]);



// Format task distribution by status
const taskDistribution = taskStatuses.reduce((acc, status) => {
    const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for response
    acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
    return acc;
}, {});

taskDistribution["All"] = totalTasks; // Add total count to taskDistribution

// Get task priority distribution
const taskPriorities = ["Low", "Medium", "High"];
const taskPriorityLevelsRaw = await Task.aggregate([
    {
        $group: {
            _id: "$priority",
            count: { $sum: 1 }
        }
    }
]);

// Format priority distribution
const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
    acc[priority] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
    return acc;
}, {});

// Fetch recent 10 tasks
const recentTasks = await Task.find()
    .sort({ createdAt: -1 })  // Newest first
    .limit(10)
    .select("title status priority dueDate createdAt");
  // Convert to plain JavaScript objects

// Return comprehensive dashboard data
res.status(200).json({
    statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
    },
    charts: {
        taskDistribution,
        taskPriorityLevels,
    },
    recentTasks,
});


    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// @desc      Dashboard Data (User-specific)
// @route    GET /api/tasks/user-dashboard-data
// @access  Private
const getUserDashboardData = async (req, res) => {
    try {

        const userId = req.user._id; // Only fetch data for the logged-in user

// Fetch statistics for user-specific tasks
const totalTasks = await Task.countDocuments({ assignedTo: userId });
const pendingTasks = await Task.countDocuments({ 
    assignedTo: userId, 
    status: "Pending" 
});
const completedTasks = await Task.countDocuments({ 
    assignedTo: userId, 
    status: "Completed" 
});
const overdueTasks = await Task.countDocuments({
    assignedTo: userId,
    status: { $ne: "Completed" },
    dueDate: { $lt: new Date() },
});

// Task distribution by status
const taskStatuses = ["Pending", "In Progress", "Completed"];
const taskDistributionRaw = await Task.aggregate([
    { 
        $match: { assignedTo: userId } 
    },
    { 
        $group: { 
            _id: "$status", 
            count: { $sum: 1 } 
        } 
    }
]);
// Format task distribution by status
const taskDistribution = taskStatuses.reduce((acc, status) => {
    const formattedKey = status.replace(/\s+/g, ""); // Remove spaces for keys
    acc[formattedKey] = taskDistributionRaw.find((item) => item._id === status)?.count || 0;
    return acc;
}, {});

taskDistribution["All"] = totalTasks; // Add total count

// Get task distribution by priority
const taskPriorities = ["Low", "Medium", "High"];
const taskPriorityLevelsRaw = await Task.aggregate([
    { 
        $match: { assignedTo: userId } 
    },
    { 
        $group: { 
            _id: "$priority", 
            count: { $sum: 1 } 
        } 
    }
]);

// Format priority distribution
const taskPriorityLevels = taskPriorities.reduce((acc, priority) => {
    acc[priority] = taskPriorityLevelsRaw.find((item) => item._id === priority)?.count || 0;
    return acc;
}, {});

// Fetch recent 10 tasks for the logged-in user with lean() for better performance
const recentTasks = await Task.find({ assignedTo: userId })
    .sort({ createdAt: -1 })  // Newest first
    .limit(10)
    .select("title status priority dueDate createdAt");
    // Convert to plain JavaScript objects

// Return comprehensive user dashboard data
res.status(200).json({
    statistics: {
        totalTasks,
        pendingTasks,
        completedTasks,
        overdueTasks,
    },
    charts: {
        taskDistribution,
        taskPriorityLevels,
    },
    recentTasks,
});

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

module.exports = {
    getTasks,
    getTaskById,
    createTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    updateTaskChecklist,
    getDashboardData,
    getUserDashboardData,
};