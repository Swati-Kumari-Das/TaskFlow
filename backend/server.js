// require("dotenv").config();
// const express=require("express");
// const cors=require("cors");
// const path=require("path");
// const connectDB =require("./config/db");
// const authRoutes=require("./routes/authRoutes")
// const userRoutes = require("./routes/userRoutes");
// const taskRoutes=require("./routes/taskRoutes");
// const reportRoutes=require("./routes/reportRoutes");
// const notificationRoutes = require("./routes/notificationRoutes");

// const app=express();


// //middleware to handle CORS
// app.use(
//     cors({
//      origin:process.env.CLIENT_URL || "*",
//      methods: ["GET","POST","PUT","DELETE"],
//      allowedHeaders:["Content-Type","Authorization"],
//     })
// );

// //Middleware
// app.use(express.json());

// //Connect Database
// connectDB();

// //Routes
// app.use("/api/auth",authRoutes);
// app.use("/api/users",userRoutes);
// app.use("/api/tasks",taskRoutes);
// app.use("/api/reports",reportRoutes);
// app.use("/api/notifications", notificationRoutes);


// //Server uploads folder
// app.use("/uploads",express.static(path.join(__dirname,"uploads")));


// const http = require("http");
// const { Server } = require("socket.io");

// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: process.env.CLIENT_URL ,
//     methods: ["GET", "POST", "PUT","PATCH", "DELETE"],
//       allowedHeaders: ["Content-Type", "Authorization"],
//   },
// });

// const connectedUsers = new Map();

// io.on("connection", (socket) => {
//   console.log("New socket connected:", socket.id);

//   // User identifies themselves
//   // socket.on("identify", (userId) => {
//   //   connectedUsers.set(userId, socket.id);
//   //   console.log(`User ${userId} mapped to socket ${socket.id}`);
//   //    console.log("🗺️ Current connectedUsers map:", Array.from(connectedUsers.entries()));

//   // });
//   socket.on("join", (userId) => {
//     console.log(`📡 Received 'join' for user ${userId} from socket ${socket.id}`);
//   connectedUsers.set(userId.toString(), socket.id);
//    console.log("🗺️ Updated connectedUsers map:", Array.from(connectedUsers.entries()));
// });

//   socket.on("disconnect", () => {
//     for (let [userId, socketId] of connectedUsers.entries()) {
//       if (socketId === socket.id) {
//         connectedUsers.delete(userId);
//         console.log(`User ${userId} disconnected`);
//         break;
//       }
//     }
//         console.log("🗑️ Updated connectedUsers map:", Array.from(connectedUsers.entries()));
//   });
// });

// // Attach io and user map globally
// app.set("io", io);
// app.set("connectedUsers", connectedUsers);
// //Start Server
// const PORT=process.env.PORT || 5000;
// //app.listen(PORT,()=>console.log(`Server running on port ${PORT}`))
// server.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });




require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const reportRoutes = require("./routes/reportRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

// 🔐 CORS middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// 📦 JSON body parser
app.use(express.json());

// 🧩 Connect MongoDB
connectDB();

// 🔗 API Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/notifications", notificationRoutes);

// 📁 Serve uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ⚡ Socket Setup
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  },
});

// 🧠 Track connected users with Set<socketId>
const connectedUsers = new Map(); // Map<userId, Set<socketIds>>

io.on("connection", (socket) => {
  console.log("🔌 New socket connected:", socket.id);

  socket.on("join", (userId) => {
    console.log(`📡 Received 'join' for user ${userId} from socket ${socket.id}`);
    const socketSet = connectedUsers.get(userId) || new Set();
    socketSet.add(socket.id);
    connectedUsers.set(userId, socketSet);

    console.log("🗺️ Updated connectedUsers map:", Object.fromEntries(
      Array.from(connectedUsers.entries()).map(([uid, sockets]) => [uid, Array.from(sockets)])
    ));
  });

  socket.on("disconnect", () => {
    for (const [userId, socketSet] of connectedUsers.entries()) {
      if (socketSet.has(socket.id)) {
        socketSet.delete(socket.id);
        if (socketSet.size === 0) {
          connectedUsers.delete(userId);
        } else {
          connectedUsers.set(userId, socketSet); // reassign cleaned set
        }
        console.log(`❌ Disconnected ${socket.id} from user ${userId}`);
        break;
      }
    }

    console.log("🗑️ Updated connectedUsers map:", Object.fromEntries(
      Array.from(connectedUsers.entries()).map(([uid, sockets]) => [uid, Array.from(sockets)])
    ));
  });
});

// 🔧 Attach globally
app.set("io", io);
app.set("connectedUsers", connectedUsers);

// 🚀 Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
