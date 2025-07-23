// // backend/utils/notifyUsers.js
// const Notification = require("../models/Notification"); // ⬅️ Import

// const notifyUsers = (io, connectedUsers, userIds, eventName, payload) => {
//   console.log("📣 [notifyUsers] Triggered for event:", eventName);
//   console.log("👥 User IDs to notify:", userIds);
//   console.log("📦 Payload:", payload);

//   userIds.forEach((userId) => {
//     const userIdStr = userId.toString();
//     const socketId = connectedUsers.get(userIdStr);

//     if (socketId) {
//       console.log(`✅ Found socket for user ${userIdStr}: ${socketId}`);
//       io.to(socketId).emit(eventName, payload);
//       console.log(`📤 Emitted '${eventName}' to socket ID: ${socketId}`);
//     } else {
//       console.warn(`⚠️ No active socket found for user: ${userIdStr}`);
//     }
//   });
// };

// module.exports = notifyUsers;

// const Notification = require("../models/Notification"); // ⬅️ Import

// const notifyUsers = async (io, connectedUsers, userIds, eventName, payload) => {
//   console.log("📣 [notifyUsers] Triggered for event:", eventName);
//   console.log("👥 User IDs to notify:", userIds);
//   console.log("📦 Payload:", payload);

//   for (const userId of userIds) {
//     const userIdStr = userId.toString();
//     const socketId = connectedUsers.get(userIdStr);

//     if (socketId) {
//       console.log(`✅ Found socket for user ${userIdStr}: ${socketId}`);
//       io.to(socketId).emit(eventName, payload);
//       console.log(`📤 Emitted '${eventName}' to socket ID: ${socketId}`);
//     } else {
//       console.warn(`⚠️ No active socket found for user: ${userIdStr}`);

//       // 💾 Save notification to DB
//       await Notification.create({
//         user: userIdStr,
//         type: payload.type,
//         taskId: payload.taskId,
//         taskTitle: payload.taskTitle,
//         message: payload.message,
//         seen: false,
//       });
//     }
//   }
// };

// module.exports = notifyUsers;

// const Notification = require("../models/Notification");

// const notifyUsers = async (io, connectedUsers, userIds, eventName, payload) => {
//   console.log("📣 [notifyUsers] Triggered for event:", eventName);
//   console.log("👥 User IDs to notify:", userIds);
//   console.log("📦 Payload:", payload);

//   for (const userId of userIds) {
//     const userIdStr = userId.toString();

//     // 💾 Always save to DB — even if socket found
//     await Notification.create({
//       user: userIdStr,
//       type: payload.type,
//       task: payload.taskId,
//       taskTitle: payload.taskTitle,
//       message: payload.message,
//       seen: false,
//     });
//     console.log(`💾 Notification saved for user: ${userIdStr}`);

//     // 📤 Emit if socket exists
//     const socketId = connectedUsers.get(userIdStr);
//     if (socketId) {
//       io.to(socketId).emit(eventName, {
//         ...payload,
//         user: userIdStr, // Optional
//       });
//       console.log(`📤 Emitted '${eventName}' to socket ID: ${socketId}`);
//     } else {
//       console.warn(`⚠️ No active socket for user: ${userIdStr}`);
//     }
//   }
// };

// module.exports = notifyUsers;



// const Notification = require("../models/Notification");

// const notifyUsers = async (io, connectedUsers, userIds, eventName, payload) => {
//   console.log("📣 [notifyUsers] Triggered for event:", eventName);
//   console.log("👥 User IDs to notify:", userIds);
//   console.log("📦 Payload:", payload);

//   for (const userId of userIds) {
//     const userIdStr = userId.toString();

//     // 💾 Always save to DB — ensures persistence
//     await Notification.create({
//       user: userIdStr,
//       type: payload.type,
//       task: payload.taskId,
//       taskTitle: payload.taskTitle,
//       message: payload.message,
//       seen: false,
//     });
//     console.log(`💾 Notification saved for user: ${userIdStr}`);

//     // 📤 Emit to all active sockets for that user
//     const socketSet = connectedUsers.get(userIdStr);
//     if (socketSet && socketSet.size > 0) {
//       for (const socketId of socketSet) {
//         io.to(socketId).emit(eventName, {
//           ...payload,
//           user: userIdStr,
//         });
//         console.log(`📤 Emitted '${eventName}' to socket ID: ${socketId}`);
//       }
//     } else {
//       console.warn(`⚠️ No active sockets for user: ${userIdStr}`);
//     }
//   }
// };

// module.exports = notifyUsers;


// const Notification = require("../models/Notification");

// const notifyUsers = async (io, connectedUsers, userIds, eventName, payload) => {
//   console.log("📣 [notifyUsers] Triggered for event:", eventName);
//   console.log("👥 User IDs to notify:", userIds);
//   console.log("📦 Payload:", payload);

//   for (const userId of userIds) {
//     const userIdStr = userId.toString();

//     // 💾 Always save to DB — ensures persistence
//     await Notification.create({
//       user: userIdStr,
//       type: payload.type,
//       task: payload.taskId,
//       taskTitle: payload.taskTitle,
//       message: payload.message,
//       seen: false,
//     });
//     console.log(`💾 Notification saved for user: ${userIdStr}`);

//     // 📤 Emit to all active sockets for that user (object-based access)
//     const socketIds = connectedUsers[userIdStr]; // <- FIXED
//     if (socketIds && socketIds.length > 0) {
//       for (const socketId of socketIds) {
//         io.to(socketId).emit(eventName, {
//           ...payload,
//           user: userIdStr,
//         });
//         console.log(`📤 Emitted '${eventName}' to socket ID: ${socketId}`);
//       }
//     } else {
//       console.warn(`⚠️ No active sockets for user: ${userIdStr}`);
//     }
//   }
// };

// module.exports = notifyUsers;

const Notification = require("../models/Notification");

const notifyUsers = async (io, connectedUsers, userIds, eventName, payload) => {
  console.log("📣 [notifyUsers] Triggered for event:", eventName);
  console.log("👥 User IDs to notify:", userIds);
  console.log("📦 Payload:", payload);

  console.log("🔍 connectedUsers snapshot:", Object.fromEntries(
    Array.from(connectedUsers.entries()).map(([uid, sockets]) => [uid, Array.from(sockets)])
  ));

  for (const userId of userIds) {
    const userIdStr = userId.toString();

    // 💾 Save to DB
    await Notification.create({
      user: userIdStr,
      type: payload.type,
      task: payload.taskId,
      taskTitle: payload.taskTitle,
      message: payload.message,
      seen: false,
    });
    console.log(`💾 Notification saved for user: ${userIdStr}`);

    // ✅ FIXED: Proper Map access
    const socketSet = connectedUsers.get(userIdStr);
    const socketIds = socketSet ? Array.from(socketSet) : [];
  console.log(`📬 Notifying user ${userIdStr} at sockets:`, socketIds);
    if (socketIds.length > 0) {
      for (const socketId of socketIds) {
        io.to(socketId).emit(eventName, {
          ...payload,
          user: userIdStr,
        });
        console.log(`📤 Emitted '${eventName}' to socket ID: ${socketId}`);
      }
    } else {
      console.warn(`⚠️ No active sockets for user: ${userIdStr}`);
     
    }
  }
};

module.exports = notifyUsers;
