const Task = require("../models/Task");
const notifyUsers = require("../utils/notifyUsers");
const Notification = require("../models/Notification");
const User = require("../models/User"); 
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
  console.log("📝 [Create Task] Request received");
        console.log("🔍 Request Body:", req.body);
        console.log("👤 Authenticated User:", req.user);  
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
             console.log("❌ Invalid 'assignedTo': Must be an array");
            return res.status(400).json({message:"assignedTo must be an array of user IDs"});
        }

        const formattedPriority =
  priority?.charAt(0).toUpperCase() + priority?.slice(1).toLowerCase();
   console.log("📌 Formatted Priority:", formattedPriority);
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
          console.log("✅ Task created successfully:", task);
            // Emit socket notification to assigned users
        console.log("📢 Emitting socket notification to users:", assignedTo);

           // 🔔 Emit socket notification to assigned members
        notifyUsers(
            req.app.get("io"),
            req.app.get("connectedUsers"),
            assignedTo,
            "taskAssigned",
            {
                taskId: task._id,
                taskTitle: task.title,
                message: `You have been assigned a new task: ${task.title}`,
                type: "assigned", 
            },2000);
        res.status(201).json({message:"Task created successfully",task});
    } catch (error) {
          console.error("❌ [Create Task] Error:", error);
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
// const updateTaskStatus = async (req, res) => {
//     try {
//          console.log("🔁 [Update Status] Request received");
//         console.log("📌 Task ID:", req.params.id);
//         console.log("📤 New Status from request body:", req.body.status);
//         console.log("👤 Authenticated User:", req.user);

// const task = await Task.findById(req.params.id);
// if (!task) {
//       console.log("❌ Task not found");
//     return res.status(404).json({ message: "Task not found" });
// }
//  console.log("✅ Task found:", task.title);
// // Check if user is assigned to task or is admin
// const isAssigned = task.assignedTo.some(
//     (userId) => userId.toString() === req.user._id.toString()
// );

// if (!isAssigned && req.user.role !== "admin") {
//       console.log("❌ Unauthorized attempt by user:", req.user._id);
//     return res.status(403).json({ message: "Not authorized" });
// }

// // Update task status
// task.status = req.body.status || task.status;
//    console.log("🛠️ Updating status to:", task.status);

// // If task is marked as completed, update all checklist items
// if (task.status === "Completed") {
//     task.todoChecklist.forEach((item) => {
//         item.completed = true;
//     });
//     task.progress = 100;
//      console.log("✅ All checklist items marked complete");
// }

// await task.save();
//    console.log("💾 Task status saved:", task.status);


//         // ✅ Notify all members + admin only if completed
//         if (task.status === "Completed") {
//             const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");

//             // const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];

//             //  const userIdsToNotify = notifyList.map((user) => user._id);

//             // console.log("📢 Sending socket notification to:", userIdsToNotify);
//             // notifyUsers(
//             //     req.app.get("io"),
//             //     req.app.get("connectedUsers"),
//             //      userIdsToNotify,
//             //     "taskCompleted",
//             //     {
//             //         taskId: populatedTask._id,
//             //         taskTitle: populatedTask.title,
//             //         message: `Task completed: ${populatedTask.title}`,
//             //          type: "completed",
//             //     }
//             // );

//             const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];

// // ✅ FIX: Filter out the user who completed the task
// const userIdsToNotify = notifyList
//   .map((user) => user._id.toString())
//   .filter((id) => id !== req.user._id.toString()); // ← filter line added

// console.log("📢 Sending socket notification to (excluding self):", userIdsToNotify);

// notifyUsers(
//     req.app.get("io"),
//     req.app.get("connectedUsers"),
//     userIdsToNotify,
//     "taskCompleted",
//     {
//         taskId: populatedTask._id,
//         taskTitle: populatedTask.title,
//         message: `${req.user.name} completed the task: ${populatedTask.title}`, // optional message update
//         type: "completed",
//     }
// );

//         }

// res.json({ 
//     message: "Task status updated successfully", 
//     task 
// });
//     } catch (error) {
//         console.error("❌ [Update Status] Error:", error);
//         res.status(500).json({ message: "Server error", error: error.message });
//     }
// }
// const updateTaskStatus = async (req, res) => {
//   try {
//     console.log("🔁 [Update Status] Request received");
//     console.log("📌 Task ID:", req.params.id);
//     console.log("📤 New Status from request body:", req.body.status);
//     console.log("👤 Authenticated User:", req.user);

//     const task = await Task.findById(req.params.id);
//     if (!task) {
//       console.log("❌ Task not found");
//       return res.status(404).json({ message: "Task not found" });
//     }

//     console.log("✅ Task found:", task.title);

//     // Check if user is assigned to task or is admin
//     const isAssigned = task.assignedTo.some(
//       (userId) => userId.toString() === req.user._id.toString()
//     );

//     if (!isAssigned && req.user.role !== "admin") {
//       console.log("❌ Unauthorized attempt by user:", req.user._id);
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     // Update task status
//     task.status = req.body.status || task.status;
//     console.log("🛠️ Updating status to:", task.status);

//     // If task is marked as completed, update checklist items
//     if (task.status === "Completed") {
//       task.todoChecklist.forEach((item) => {
//         item.completed = true;
//       });
//       task.progress = 100;
//       console.log("✅ All checklist items marked complete");
//     }

//     await task.save();
//     console.log("💾 Task status saved:", task.status);

//     // ✅ Notify others if task is completed
//     if (task.status === "Completed") {
//       const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");

//       const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];
      
//         // ✅ Log all intended notification receivers
//       console.log("👥 Notify List (assigned + createdBy):", notifyList.map(u => u._id.toString()));

//       // ✅ Filter out the user who completed the task
//       const userIdsToNotify = notifyList
//         .map((user) => user._id.toString())
//         .filter((id) => id !== req.user._id.toString());

        
//       console.log("📢 Final User IDs to notify (excluding self):", userIdsToNotify);

//       console.log("📢 Sending socket notification to (excluding self):", userIdsToNotify);

//       // ✅ Save to DB
//       await Promise.all(
//         userIdsToNotify.map((userId) =>
//           Notification.create({
//             user: userId,
//             task: populatedTask._id,
//             message: `${req.user.name} completed the task: ${populatedTask.title}`,
//             type: "completed",
//           })
//         )
//       );
//     console.log("📝 Notifications saved to DB");


//       // ✅ Emit socket notification
//       notifyUsers(
//         req.app.get("io"),
//         req.app.get("connectedUsers"),
//         userIdsToNotify,
//         "taskCompleted",
//         {
//           taskId: populatedTask._id,
//           taskTitle: populatedTask.title,
//           message: `${req.user.name} completed the task: ${populatedTask.title}`,
//           type: "completed",
//         }
//       );
//        console.log("📤 taskCompleted event emitted via socket");
//     }

//     res.json({
//       message: "Task status updated successfully",
//       task,
//     });
//   } catch (error) {
//     console.error("❌ [Update Status] Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// const updateTaskStatus = async (req, res) => {
//   try {
//     console.log("🔁 [Update Status] Request received");
//     console.log("📌 Task ID:", req.params.id);
//     console.log("📤 New Status from request body:", req.body.status);
//     console.log("👤 Authenticated User:", req.user);

//     const task = await Task.findById(req.params.id);
//     if (!task) {
//       console.log("❌ Task not found");
//       return res.status(404).json({ message: "Task not found" });
//     }

//     console.log("✅ Task found:", task.title);

//     const isAssigned = task.assignedTo.some(
//       (userId) => userId.toString() === req.user._id.toString()
//     );

//     if (!isAssigned && req.user.role !== "admin") {
//       console.log("❌ Unauthorized attempt by user:", req.user._id);
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     task.status = req.body.status || task.status;
//     console.log("🛠️ Updating status to:", task.status);

//     if (task.status === "Completed") {
//       task.todoChecklist.forEach((item) => {
//         item.completed = true;
//       });
//       task.progress = 100;
//       console.log("✅ All checklist items marked complete");
//     }

//     await task.save();
//     console.log("💾 Task status saved:", task.status);

//     // ✅ Notify others if task is completed
//     if (task.status === "Completed") {
//       const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");

//       const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];

//       console.log("👥 Notify List (assigned + createdBy):", notifyList.map(u => u._id.toString()));

//       const userIdsToNotify = notifyList
//         .map((user) => user._id.toString())
//         .filter((id) => id !== req.user._id.toString());

//       console.log("📢 Final User IDs to notify (excluding self):", userIdsToNotify);

//       if (userIdsToNotify.length > 0) {
//         const createdNotis = await Promise.all(
//           userIdsToNotify.map((userId) =>
//             Notification.create({
//               user: userId,
//               task: populatedTask._id,
//               message: `${req.user.name} completed the task: ${populatedTask.title}`,
//               type: "completed",
//               createdAt: new Date() // Optional, if your schema doesn't auto-handle timestamps
//             })
//           )
//         );

//         console.log("📝 Notifications saved to DB:", createdNotis.map(n => ({
//           id: n._id,
//           user: n.user.toString(),
//           message: n.message,
//         })));

//         notifyUsers(
//           req.app.get("io"),
//           req.app.get("connectedUsers"),
//           userIdsToNotify,
//           "taskCompleted",
//           {
//             taskId: populatedTask._id,
//             taskTitle: populatedTask.title,
//             message: `${req.user.name} completed the task: ${populatedTask.title}`,
//             type: "completed",
//           }
//         );

//         console.log("📤 taskCompleted event emitted via socket");
//       } else {
//         console.log("⚠️ No users to notify — skipping DB + socket notification");
//       }
//     }

//     res.json({
//       message: "Task status updated successfully",
//       task,
//     });
//   } catch (error) {
//     console.error("❌ [Update Status] Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// const updateTaskStatus = async (req, res) => {
//   try {
//     console.log("🔁 [Update Status] Request received");
//     console.log("📌 Task ID:", req.params.id);
//     console.log("📤 New Status:", req.body.status);
//     console.log("👤 Authenticated User:", req.user);

//     const task = await Task.findById(req.params.id);
//     if (!task) {
//       console.log("❌ Task not found");
//       return res.status(404).json({ message: "Task not found" });
//     }

//     console.log("✅ Task found:", task.title);

//     // Authorization check: either admin or assigned user
//     const isAssigned = task.assignedTo.some(
//       (userId) => userId.toString() === req.user._id.toString()
//     );
//     if (!isAssigned && req.user.role !== "admin") {
//       console.log("❌ Unauthorized attempt by user:", req.user._id);
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     task.status = req.body.status || task.status;
//     console.log("🛠️ Updating status to:", task.status);

//     // Auto-complete checklist if task is marked completed
//     if (task.status === "Completed") {
//       task.todoChecklist.forEach((item) => {
//         item.completed = true;
//       });
//       task.progress = 100;
//       console.log("✅ Checklist marked complete & progress set to 100%");
//     }

//     await task.save();
//     console.log("💾 Task status saved");

//     // 🔔 Notify assigned team + admin/creator if task completed
//     if (task.status === "Completed") {
//       const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");

//       const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];

//       const userIdsToNotify = notifyList
//         .map((u) => u._id.toString())
//         .filter((id) => id !== req.user._id.toString());

//       console.log("👥 Notify (excluding actor):", userIdsToNotify);

//       if (userIdsToNotify.length > 0) {
//         await notifyUsers(
//           req.app.get("io"),
//           req.app.get("connectedUsers"),
//           userIdsToNotify,
//           "taskCompleted",
//           {
//             taskId: populatedTask._id,
//             taskTitle: populatedTask.title,
//             message: `${req.user.name} completed the task: ${populatedTask.title}`,
//             type: "completed",
//           }
//         );
//         console.log("📤 Real-time notification sent");
//       } else {
//         console.log("⚠️ No other users to notify");
//       }
//     }

//     return res.status(200).json({
//       message: "Task status updated successfully",
//       task,
//     });

//   } catch (error) {
//     console.error("❌ [Update Status] Error:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// const updateTaskStatus = async (req, res) => {
//   try {
//     console.log("🔁 [Update Status] Request received");
//     console.log("📌 Task ID:", req.params.id);
//     console.log("📤 New Status from request body:", req.body.status);
//     console.log("👤 Authenticated User:", req.user);

//     const task = await Task.findById(req.params.id);
//     if (!task) {
//       console.log("❌ Task not found");
//       return res.status(404).json({ message: "Task not found" });
//     }

//     console.log("✅ Task found:", task.title);

//     // Authorization check: either admin or assigned user
//     const isAssigned = task.assignedTo.some(
//       (userId) => userId.toString() === req.user._id.toString()
//     );
//     if (!isAssigned && req.user.role !== "admin") {
//       console.log("❌ Unauthorized attempt by user:", req.user._id);
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     task.status = req.body.status || task.status;
//     console.log("🛠️ Updating status to:", task.status);

//     // Auto-complete checklist if task is marked completed
//     if (task.status === "Completed") {
//       task.todoChecklist.forEach((item) => {
//         item.completed = true;
//       });
//       task.progress = 100;
//       console.log("✅ Checklist marked complete & progress set to 100%");
//     }

//     await task.save();
//     console.log("💾 Task status saved");

//     // 🔔 Notify team if task completed
//     if (task.status === "Completed") {
//       console.log("🎯 Inside task completed block");

//       const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");

//       const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];
//       console.log("👥 Raw notifyList (assigned + createdBy):", notifyList.map(u => u._id.toString()));

//       const userIdsToNotify = notifyList
//         .map((u) => u._id.toString())
//         .filter((id) => id !== req.user._id.toString());

//       console.log("🧼 Filtered userIdsToNotify (excluding actor):", userIdsToNotify);

//       if (userIdsToNotify.length > 0) {
//         const createdNotis = await Promise.all(
//           userIdsToNotify.map((userId) =>
//             Notification.create({
//               user: userId,
//               task: populatedTask._id,
//               message: `${req.user.name} completed the task: ${populatedTask.title}`,
//               type: "completed",
//               createdAt: new Date(),
//             })
//           )
//         );

//         console.log("📝 Notifications saved in DB:", createdNotis.map(n => ({
//           id: n._id,
//           user: n.user.toString(),
//           message: n.message,
//         })));

//         notifyUsers(
//           req.app.get("io"),
//           req.app.get("connectedUsers"),
//           userIdsToNotify,
//           "taskCompleted",
//           {
//             taskId: populatedTask._id,
//             taskTitle: populatedTask.title,
//             message: `${req.user.name} completed the task: ${populatedTask.title}`,
//             type: "completed",
//           }
//         );

//         console.log("📤 taskCompleted event emitted via socket");
//       } else {
//         console.log("⚠️ No other users to notify (only actor was involved)");
//       }
//     }

//     return res.status(200).json({
//       message: "Task status updated successfully",
//       task,
//     });

//   } catch (error) {
//     console.error("❌ [Update Status] Error:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// const updateTaskStatus = async (req, res) => {
//   try {
//     console.log("🔁 [Update Status] Request received");
//     console.log("📌 Task ID:", req.params.id);
//     console.log("📤 New Status from request body:", req.body.status);
//     console.log("👤 Authenticated User:", req.user);

//     const task = await Task.findById(req.params.id);
//     if (!task) {
//       console.log("❌ Task not found");
//       return res.status(404).json({ message: "Task not found" });
//     }

//     console.log("✅ Task found:", task.title);

//     // Authorization check: either admin or assigned user
//     const isAssigned = task.assignedTo.some(
//       (userId) => userId.toString() === req.user._id.toString()
//     );
//     if (!isAssigned && req.user.role !== "admin") {
//       console.log("❌ Unauthorized attempt by user:", req.user._id);
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     task.status = req.body.status || task.status;
//     console.log("🛠️ Updating status to:", task.status);

//     // Auto-complete checklist if task is marked completed
//     if (task.status === "Completed") {
//       task.todoChecklist.forEach((item) => {
//         item.completed = true;
//       });
//       task.progress = 100;
//       console.log("✅ Checklist marked complete & progress set to 100%");
//     }

//     await task.save();
//     console.log("💾 Task status saved");

//     // 🔔 Notify team if task completed
//     if (task.status === "Completed") {
//       console.log("🎯 Inside task completed block");

//       const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");

//       const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];
//       console.log("👥 Raw notifyList (assigned + createdBy):", notifyList.map(u => u._id.toString()));

//       const userIdsToNotify = notifyList
//         .map((u) => u._id.toString())
//         .filter((id) => id !== req.user._id.toString());

//       console.log("🧼 Filtered userIdsToNotify (excluding actor):", userIdsToNotify);

//       if (userIdsToNotify.length > 0) {
//         await notifyUsers(
//           req.app.get("io"),
//           req.app.get("connectedUsers"),
//           userIdsToNotify,
//           "taskCompleted",
//           {
//             taskId: populatedTask._id,
//             taskTitle: populatedTask.title,
//             message: `${req.user.name} completed the task: ${populatedTask.title}`,
//             type: "completed",
//           }
//         );

//         console.log("📤 taskCompleted event emitted via socket");
//       } else {
//         console.log("⚠️ No other users to notify (only actor was involved)");
//       }
//     }

//     return res.status(200).json({
//       message: "Task status updated successfully",
//       task,
//     });

//   } catch (error) {
//     console.error("❌ [Update Status] Error:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };


// const updateTaskStatus = async (req, res) => {
//   try {
//     console.log("🔁 [Update Status] Request received");
//     console.log("📌 Task ID:", req.params.id);
//     console.log("📤 New Status from request body:", req.body.status);
//     console.log("👤 Authenticated User:", req.user);

//     const task = await Task.findById(req.params.id);
//     if (!task) {
//       console.log("❌ Task not found");
//       return res.status(404).json({ message: "Task not found" });
//     }

//     console.log("✅ Task found:", task.title);

//     // Authorization: admin or assigned user only
//     const isAssigned = task.assignedTo.some(
//       (userId) => userId.toString() === req.user._id.toString()
//     );
//     if (!isAssigned && req.user.role !== "admin") {
//       console.log("❌ Unauthorized attempt by user:", req.user._id);
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     // Update task status
//     task.status = req.body.status || task.status;
//     console.log("🛠️ Updating status to:", task.status);

//     // If marked Completed: auto-complete checklist and set progress
//     if (task.status === "Completed") {
//       task.todoChecklist.forEach((item) => {
//         item.completed = true;
//       });
//       task.progress = 100;
//       console.log("✅ Checklist marked complete & progress set to 100%");
//     }

//     await task.save();
//     console.log("💾 Task status saved");

//     // 🔔 Notify teammates and creator if marked Completed
//     if (task.status === "Completed") {
//       console.log("🎯 Inside task completed block");

//       // Re-populate assignedTo and createdBy for user info
//       const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");

//       const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];
//       console.log("👥 Raw notifyList (assigned + createdBy):", notifyList.map(u => u._id.toString()));

//       // Exclude current user (completing the task)
//       const userIdsToNotify = notifyList
//         .map((u) => u._id.toString())
//         .filter((id) => id !== req.user._id.toString());

//       console.log("🧼 Filtered userIdsToNotify (excluding actor):", userIdsToNotify);

//       if (userIdsToNotify.length > 0) {
//         const io = req.app.get("io");
//         const connectedUsers = req.app.get("connectedUsers");

//         await notifyUsers(
//           io,
//           connectedUsers,
//           userIdsToNotify,
//           "taskCompleted",
//           {
//             taskId: populatedTask._id,
//             taskTitle: populatedTask.title,
//             message: `${req.user.name} completed the task: ${populatedTask.title}`,
//             type: "completed",
//           }
//         );

//         console.log("📤 taskCompleted event emitted via socket");
//       } else {
//         console.log("⚠️ No other users to notify (only actor was involved)");
//       }
//     }

//     return res.status(200).json({
//       message: "Task status updated successfully",
//       task,
//     });

//   } catch (error) {
//     console.error("❌ [Update Status] Error:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };




// const updateTaskStatus = async (req, res) => {
//   try {
//     console.log("🔁 [Update Status] Request received");
//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const isAssigned = task.assignedTo.some(
//       (userId) => userId.toString() === req.user._id.toString()
//     );
//     if (!isAssigned && req.user.role !== "admin")
//       return res.status(403).json({ message: "Not authorized" });

//     task.status = req.body.status || task.status;
//     if (task.status === "Completed") {
//       task.todoChecklist.forEach((item) => (item.completed = true));
//       task.progress = 100;
//     }

//     await task.save();

//     if (task.status === "Completed") {
//       const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");
//       const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];
//       const userIdsToNotify = notifyList
//         .map((u) => u._id.toString())
//         .filter((id) => id !== req.user._id.toString());

//       let finalNotifyUsers = userIdsToNotify;

//       // ✅ Fallback: notify all admins if no one else involved
//       if (finalNotifyUsers.length === 0) {
//         const admins = await User.find({ role: "admin", _id: { $ne: req.user._id } });
//         finalNotifyUsers = admins.map((admin) => admin._id.toString());
//         console.log("🛎️ Notifying fallback admins:", finalNotifyUsers);
//       }

//       if (finalNotifyUsers.length > 0) {
//         await notifyUsers(
//           req.app.get("io"),
//           req.app.get("connectedUsers"),
//           finalNotifyUsers,
//           "taskCompleted",
//           {
//             taskId: populatedTask._id,
//             taskTitle: populatedTask.title,
//             message: `${req.user.name} completed the task: ${populatedTask.title}`,
//             type: "completed",
//           }
//         );

//         console.log("📤 taskCompleted event emitted via socket");
//       }
//     }

//     return res.status(200).json({
//       message: "Task status updated successfully",
//       task,
//     });
//   } catch (error) {
//     console.error("❌ [Update Status] Error:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// const updateTaskStatus = async (req, res) => {
//   try {
//     console.log("🔁 [Update Status] Request received");

//     const task = await Task.findById(req.params.id);
//     if (!task) return res.status(404).json({ message: "Task not found" });

//     const isAssigned = task.assignedTo.some(
//       (userId) => userId.toString() === req.user._id.toString()
//     );
//     if (!isAssigned && req.user.role !== "admin") {
//       return res.status(403).json({ message: "Not authorized" });
//     }

//     // ✅ Update status and progress if completed
//     task.status = req.body.status || task.status;
//     if (task.status === "Completed") {
//       task.todoChecklist.forEach((item) => (item.completed = true));
//       task.progress = 100;
//     }

//     await task.save();

//     // ✅ If completed, notify others
//     if (task.status === "Completed") {
//       const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");
//       const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];
//       const userIdsToNotify = notifyList
//         .map((u) => u._id.toString())
//         .filter((id) => id !== req.user._id.toString());

//       console.log("🔍 userIdsToNotify (excluding actor):", userIdsToNotify);

//       let finalNotifyUsers = userIdsToNotify;

//       // 🔁 Fallback: notify other admins if no one else involved
//       if (finalNotifyUsers.length === 0) {
//         console.log("⚠️ No assigned/created users left (excluding actor), falling back to admins");

//         const admins = await User.find({
//           role: "admin",
//           _id: { $ne: req.user._id },
//         });

//         finalNotifyUsers = admins.map((admin) => admin._id.toString());

//         console.log("🧑‍💼 Found fallback admins:", finalNotifyUsers);
//       }

//       // 🔔 Notify via socket if recipients exist
//       if (finalNotifyUsers.length > 0) {
//         console.log("📡 Emitting taskCompleted to users:", finalNotifyUsers);

//         await notifyUsers(
//           req.app.get("io"),
//           req.app.get("connectedUsers"),
//           finalNotifyUsers,
//           "taskCompleted",
//           {
//             taskId: populatedTask._id,
//             taskTitle: populatedTask.title,
//             message: `${req.user.name} completed the task: ${populatedTask.title}`,
//             type: "completed",
//           }
//         );

//         console.log("📤 taskCompleted event emitted via socket");
//       } else {
//         console.log("🚫 No one to notify (no assigned, creator, or other admins)");
//       }
//     }

//     return res.status(200).json({
//       message: "Task status updated successfully",
//       task,
//     });
//   } catch (error) {
//     console.error("❌ [Update Status] Error:", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

const updateTaskStatus = async (req, res) => {
  try {
    console.log("🔁 [Update Status] Request received");

    // 📝 Fetch the task
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // 🔐 Check if user is assigned or admin
    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );
    if (!isAssigned && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 🔄 Save old status to detect changes
    const oldStatus = task.status;

    // ✅ Update task status
    task.status = req.body.status || task.status;

    // 🧹 Auto-complete checklist if marked as "Completed"
    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => (item.completed = true));
      task.progress = 100;
    }

    // 💾 Save changes
    await task.save();

    // ✅ Notify only if status changed from something else to "Completed"
    if (oldStatus !== "Completed" && task.status === "Completed") {
      const populatedTask = await Task.findById(task._id).populate("assignedTo createdBy");

      // 👥 List of users to notify (assigned + creator, excluding actor)
      const notifyList = [...populatedTask.assignedTo, populatedTask.createdBy];
      const userIdsToNotify = notifyList
        .map((u) => u._id.toString())
        .filter((id) => id !== req.user._id.toString());

      console.log("🔍 userIdsToNotify (excluding actor):", userIdsToNotify);

      let finalNotifyUsers = userIdsToNotify;

      // 🔁 Fallback to other admins if no one else is left
      if (finalNotifyUsers.length === 0) {
        console.log("⚠️ No assigned/created users left (excluding actor), falling back to admins");

        const admins = await User.find({
          role: "admin",
          _id: { $ne: req.user._id },
        });

        finalNotifyUsers = admins.map((admin) => admin._id.toString());

        console.log("🧑‍💼 Found fallback admins:", finalNotifyUsers);
      }

      // 📢 Emit taskCompleted notification via socket
      if (finalNotifyUsers.length > 0) {
        console.log("📡 Emitting taskCompleted to users:", finalNotifyUsers);

        await notifyUsers(
          req.app.get("io"),
          req.app.get("connectedUsers"),
          finalNotifyUsers,
          "taskCompleted",
          {
            taskId: populatedTask._id,
            taskTitle: populatedTask.title,
            message: `${req.user.name} completed the task: ${populatedTask.title}`,
            type: "completed",
          }
        );

        console.log("📤 taskCompleted event emitted via socket");
      } else {
        console.log("🚫 No one to notify (no assigned, creator, or other admins)");
      }
    }

    return res.status(200).json({
      message: "Task status updated successfully",
      task,
    });
  } catch (error) {
    console.error("❌ [Update Status] Error:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};


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
    task:updatedTask
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