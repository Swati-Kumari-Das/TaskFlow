// import { createContext, useState, useEffect, useContext } from "react";
// import { UserContext } from "./userContext";
// import socket from "../utils/socket";
// import { Howl } from "howler"; // for sound

// export const NotificationContext = createContext();

// const NotificationProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);
//   const { user } = useContext(UserContext);

//   const notificationSound = new Howl({
//     src: ["/notification.wav"], // 🔔 Add this mp3 in `public/` folder
//   });

//   useEffect(() => {
//     if (!user?._id) return;

//     // Connect + join socket room
//     socket.connect();
//     socket.emit("join", user._id);

//     // Listen for incoming notifications
//     socket.on("taskAssigned", (payload) => {
//       setNotifications((prev) => [...prev, { ...payload, seen: false }]);
//       notificationSound.play();
//     });

//     socket.on("taskCompleted", (payload) => {
//       setNotifications((prev) => [...prev, { ...payload, seen: false }]);
//       notificationSound.play();
//     });

//     return () => {
//       socket.off("taskAssigned");
//       socket.off("taskCompleted");
//     };
//   }, [user]);

//   const markAllAsSeen = () => {
//     setNotifications((prev) =>
//       prev.map((noti) => ({
//         ...noti,
//         seen: true,
//       }))
//     );
//   };

//   return (
//     <NotificationContext.Provider
//       value={{ notifications, setNotifications, markAllAsSeen }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export default NotificationProvider;

//2nd try

// import axios from "axios";

// import { useRef } from "react";
// import { createContext, useState, useEffect, useContext } from "react";
// import { UserContext } from "./userContext";
// import socket from "../utils/socket";
// import { Howl } from "howler";
// import toast from "react-hot-toast";

// export const NotificationContext = createContext();

// const NotificationProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);
//   const { user } = useContext(UserContext);
//   const joinedRef = useRef(false); // ✅ track if already joined

//   const notificationSound = new Howl({
//     src: ["/notification.wav"], // Place this in public/
//   });

//   useEffect(() => {
//     if (!user?._id) return;
    
   
//     console.log("🔌 Connecting socket...");
//     socket.connect();
//    // socket.emit("join", user._id);
//     socket.on("connect", () => {
//   console.log("✅ Socket connected:", socket.id);

//    if (!joinedRef.current) {
//         socket.emit("join", user._id);
//         console.log("📡 Emitted join for user:", user._id);
//         joinedRef.current = true;
//       }
// });

// socket.on("disconnect", () => {
//   console.log("❌ Socket disconnected:", socket.id);
//    joinedRef.current = false; // Reset so we rejoin on reconnect
// });
//     //socket.emit("identify", user._id);
//      console.log("📡 Emitted join for user:", user._id);

//     const handleNewNotification = (payload) => {
//         console.log("📥 Received taskAssigned notification:", payload);
//       const newNotification = { ...payload, seen: false, timestamp: Date.now() };
//       setNotifications((prev) => [...prev, newNotification]);
//       notificationSound.play();
//         console.log("🔔 Notification added to context state");

//       // Toast message
//       toast(
//         payload.type === "assigned"
//           ? `📝 New task assigned: ${payload.taskTitle}`
//           : `✅ Task completed: ${payload.taskTitle}`,
//         { icon: "🔔" }
//       );
//     };

//     socket.on("taskAssigned", handleNewNotification);
//     socket.on("taskCompleted", handleNewNotification);

//     return () => {
//        console.log("🧹 Cleaning up socket listeners...");
//       socket.off("taskAssigned");
//       socket.off("taskCompleted");
//     };
//   }, [user]);

//   const markAllAsSeen = () => {
//       console.log("👀 Marking all notifications as seen");
//     setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
//   };

//   const deleteNotification = (index) => {
//      console.log(`🗑️ Deleting notification at index ${index}`);
//     setNotifications((prev) => prev.filter((_, i) => i !== index));
//   };

//   const clearAllNotifications = () => {
//     console.log("🧼 Clearing all notifications");
//     setNotifications([]);
//   };

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         setNotifications,
//         markAllAsSeen,
//         deleteNotification,
//         clearAllNotifications,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export default NotificationProvider;


// import { useRef, createContext, useState, useEffect, useContext } from "react";
// import { UserContext } from "./userContext";
// import socket from "../utils/socket";
// import { Howl } from "howler";
// import toast from "react-hot-toast";
// import axios from "axios";

// export const NotificationContext = createContext();

// const NotificationProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);
//   const { user } = useContext(UserContext);
//   const joinedRef = useRef(false);

//   const notificationSound = new Howl({
//     src: ["/notification.wav"], // Ensure this file exists in public/
//   });

//   // 🔄 Fetch notifications from DB on login
//   useEffect(() => {
//     if (!user?._id) return;

//     const fetchNotifications = async () => {
//       try {
//         const res = await axios.get("/api/notifications");
//         setNotifications(res.data);
//         console.log("📥 Loaded notifications from DB:", res.data);
//       } catch (err) {
//         console.error("❌ Failed to load notifications", err);
//       }
//     };

//     fetchNotifications();
//   }, [user]);

//   // 🔌 Socket Setup
//   useEffect(() => {
//     if (!user?._id) return;

//     console.log("🔌 Connecting socket...");
//     socket.connect();

//     socket.on("connect", () => {
//       console.log("✅ Socket connected:", socket.id);

//       if (!joinedRef.current) {
//         socket.emit("join", user._id);
//         console.log("📡 Emitted join for user:", user._id);
//         joinedRef.current = true;
//       }
//     });

//     socket.on("disconnect", () => {
//       console.log("❌ Socket disconnected:", socket.id);
//       joinedRef.current = false;
//     });

//     const handleNewNotification = (payload) => {
//       console.log("📥 Received notification:", payload);
//       const newNotification = { ...payload, seen: false, timestamp: Date.now() };
//       setNotifications((prev) => [...prev, newNotification]);
//       notificationSound.play();

//       // Toast message
//       toast(
//         payload.type === "assigned"
//           ? `📝 New task assigned: ${payload.taskTitle}`
//           : `✅ Task completed: ${payload.taskTitle}`,
//         { icon: "🔔" }
//       );
//     };

//     socket.on("taskAssigned", handleNewNotification);
//     socket.on("taskCompleted", handleNewNotification);

//     return () => {
//       console.log("🧹 Cleaning up socket listeners...");
//       socket.off("taskAssigned");
//       socket.off("taskCompleted");
//     };
//   }, [user]);

//   // ✅ Mark all as seen (with DB sync)
//   const markAllAsSeen = async () => {
//     try {
//       await axios.patch("/api/notifications/mark-all-seen");
//       setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
//       console.log("✅ All notifications marked as seen in DB");
//     } catch (err) {
//       console.error("❌ Failed to mark notifications as seen", err);
//     }
//   };

//   // ✅ Delete a single notification (by index)
//   const deleteNotification = async (index) => {
//     const noti = notifications[index];
//     try {
//       await axios.delete(`/api/notifications/${noti._id}`);
//       setNotifications((prev) => prev.filter((_, i) => i !== index));
//       console.log(`🗑️ Deleted notification ${noti._id}`);
//     } catch (err) {
//       console.error("❌ Failed to delete notification", err);
//     }
//   };

//   // ✅ Clear all notifications
//   const clearAllNotifications = async () => {
//     try {
//       await axios.delete("/api/notifications");
//       setNotifications([]);
//       console.log("🧼 Cleared all notifications from DB");
//     } catch (err) {
//       console.error("❌ Failed to clear notifications", err);
//     }
//   };

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         setNotifications,
//         markAllAsSeen,
//         deleteNotification,
//         clearAllNotifications,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export default NotificationProvider;




// import { useRef, createContext, useState, useEffect, useContext } from "react";
// import { UserContext } from "./userContext";
// import socket from "../utils/socket";
// import { Howl } from "howler";
// import toast from "react-hot-toast";
// import axios from "../utils/axiosInstance";


// export const NotificationContext = createContext();

// const NotificationProvider = ({ children }) => {
//   const [notifications, setNotifications] = useState([]);
//   const { user } = useContext(UserContext);
//   const joinedRef = useRef(false);

//   const notificationSound = new Howl({
//     src: ["/notification.wav"], // Ensure this file exists in public/
//   });

//   const BASE_URL = import.meta.env.VITE_API_BASE_URL;

//   // 🔄 Fetch notifications from DB on login
//   useEffect(() => {
//     if (!user?._id) return;

//     const fetchNotifications = async () => {
//       try {
//         const res = await axios.get(`${BASE_URL}/api/notifications`);
//         setNotifications(res.data);
//         console.log("📥 Loaded notifications from DB:", res.data);
//       } catch (err) {
//         console.error("❌ Failed to load notifications", err);
//       }
//     };

//     fetchNotifications();
//   }, [user]);

//   // 🔌 Socket Setup
//   useEffect(() => {
//     if (!user?._id) return;

//     console.log("🔌 Connecting socket...");
//     socket.connect();

//     socket.on("connect", () => {
//       console.log("✅ Socket connected:", socket.id);

//       if (!joinedRef.current) {
//         socket.emit("join", user._id);
//         console.log("📡 Emitted join for user:", user._id);
//         joinedRef.current = true;
//       }
//     });

//     // socket.on("disconnect", () => {
//     //   console.log("❌ Socket disconnected:", socket.id);
//     //   joinedRef.current = false;
//     // });
//     socket.on("disconnect", (reason) => {
//   console.log("❌ Socket disconnected. Reason:", reason);
//   joinedRef.current = false;
// });

//     const handleNewNotification = (payload) => {
//       console.log("📥 Received notification:", payload);
//       const newNotification = { ...payload, seen: false, timestamp: Date.now() };
//       setNotifications((prev) => [...prev, newNotification]);
//       notificationSound.play();

//       // Toast message
//       toast(
//         payload.type === "assigned"
//           ? `📝 New task assigned: ${payload.taskTitle}`
//           : `✅ Task completed: ${payload.taskTitle}`,
//         { icon: "🔔" }
//       );
//     };

//     socket.on("taskAssigned", handleNewNotification);
//     socket.on("taskCompleted", handleNewNotification);

//     return () => {
//       console.log("🧹 Cleaning up socket listeners...");
//       socket.off("taskAssigned");
//       socket.off("taskCompleted");
//     };
//   }, [user]);

//   // ✅ Mark all as seen (with DB sync)
//   const markAllAsSeen = async () => {
//     try {
//       await axios.patch(`${BASE_URL}/api/notifications/mark-all-seen`);
//       setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
//       console.log("✅ All notifications marked as seen in DB");
//     } catch (err) {
//       console.error("❌ Failed to mark notifications as seen", err);
//     }
//   };

//   // ✅ Delete a single notification (by index)
//   const deleteNotification = async (index) => {
//     const noti = notifications[index];
//     try {
//       await axios.delete(`${BASE_URL}/api/notifications/${noti._id}`);
//       setNotifications((prev) => prev.filter((_, i) => i !== index));
//       console.log(`🗑️ Deleted notification ${noti._id}`);
//     } catch (err) {
//       console.error("❌ Failed to delete notification", err);
//     }
//   };

//   // ✅ Clear all notifications
//   const clearAllNotifications = async () => {
//     try {
//       await axios.delete(`${BASE_URL}/api/notifications`);
//       setNotifications([]);
//       console.log("🧼 Cleared all notifications from DB");
//     } catch (err) {
//       console.error("❌ Failed to clear notifications", err);
//     }
//   };

//   return (
//     <NotificationContext.Provider
//       value={{
//         notifications,
//         setNotifications,
//         markAllAsSeen,
//         deleteNotification,
//         clearAllNotifications,
//       }}
//     >
//       {children}
//     </NotificationContext.Provider>
//   );
// };

// export default NotificationProvider;


import { useRef, createContext, useState, useEffect, useContext } from "react";
import { UserContext } from "./userContext";
import socket from "../utils/socket";
import { Howl } from "howler";
import toast from "react-hot-toast";
import axios from "../utils/axiosInstance";

export const NotificationContext = createContext();

const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const { user } = useContext(UserContext);
  const joinedRef = useRef(false);

  const notificationSound = new Howl({
    src: ["/notification.wav"], // Ensure this file is in public/
  });

  const BASE_URL = import.meta.env.VITE_API_BASE_URL;

  // 🔄 Fetch notifications from DB on login
  useEffect(() => {
    if (!user?._id) return;

    const fetchNotifications = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/notifications`);
        setNotifications(res.data);
        console.log("📥 Loaded notifications from DB:", res.data);
      } catch (err) {
        console.error("❌ Failed to load notifications", err);
      }
    };

    fetchNotifications();
  }, [user]);

  // ✅ Add this just below 👇
useEffect(() => {
  if (user?._id) {
    console.log("🔔 NotificationProvider mounted for user:", user.name);
  }
}, [user]);

  // 🔌 Socket Setup
  useEffect(() => {
    if (!user?._id) return;

    if (!socket.connected) {
      console.log("🔌 Connecting socket...");
      socket.connect();
    }

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);

      if (!joinedRef.current) {
        socket.emit("join", user._id);
        console.log("📡 Emitted join for user:", user._id);
        joinedRef.current = true;
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected. Reason:", reason);
      joinedRef.current = false;
    });

    const handleNewNotification = (payload) => {
      console.log("📥 Received notification:", payload);
       console.log("🧪 payload.type:", payload.type);
      const newNotification = {
        ...payload,
        seen: false,
        timestamp: payload.createdAt || Date.now(),
      };
      setNotifications((prev) => [newNotification, ...prev]); // Add to top
      notificationSound.stop(); // Prevent overlapping
      notificationSound.play();

      toast(
        payload.type === "assigned"
          ? `📝 New task assigned: ${payload.taskTitle}`
          : `✅ Task completed: ${payload.taskTitle}`,
        { icon: "🔔" }
      );
    };

    socket.on("taskAssigned", handleNewNotification);
    socket.on("taskCompleted", handleNewNotification);



    return () => {
      console.log("🧹 Cleaning up socket listeners...");
      socket.off("taskAssigned");
      socket.off("taskCompleted");
      socket.off("connect");
      socket.off("disconnect");

      if (socket.connected) {
        socket.disconnect();
        console.log("🔌 Socket disconnected during cleanup");
      }

      joinedRef.current = false;
    };
  }, [user]);

  // ✅ Mark all as seen
  const markAllAsSeen = async () => {
    try {
      await axios.patch(`${BASE_URL}/api/notifications/mark-all-seen`);
      setNotifications((prev) => prev.map((n) => ({ ...n, seen: true })));
      console.log("✅ All notifications marked as seen in DB");
    } catch (err) {
      console.error("❌ Failed to mark notifications as seen", err);
    }
  };

  // ✅ Delete a single notification
  const deleteNotification = async (index) => {
    const noti = notifications[index];
    try {
      await axios.delete(`${BASE_URL}/api/notifications/${noti._id}`);
      setNotifications((prev) => prev.filter((_, i) => i !== index));
      console.log(`🗑️ Deleted notification ${noti._id}`);
    } catch (err) {
      console.error("❌ Failed to delete notification", err);
    }
  };

  // ✅ Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await axios.delete(`${BASE_URL}/api/notifications`);
      setNotifications([]);
      console.log("🧼 Cleared all notifications from DB");
    } catch (err) {
      console.error("❌ Failed to clear notifications", err);
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        setNotifications,
        markAllAsSeen,
        deleteNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
