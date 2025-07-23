// import React, { useContext, useEffect } from "react";
// import { NotificationContext } from "../context/NotificationContext";
// import { useNavigate } from "react-router-dom";

// const NotificationPage = () => {
//   const { notifications, markAllAsSeen } = useContext(NotificationContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     markAllAsSeen(); // clear count on open
//   }, []);

//   return (
//     <div className="p-6 max-w-3xl mx-auto">
//       <h2 className="text-xl font-semibold mb-4">Notifications</h2>
//       {notifications.length === 0 ? (
//         <p className="text-gray-500">No notifications yet.</p>
//       ) : (
//         <div className="space-y-3">
//           {notifications
//             .slice()
//             .reverse()
//             .map((noti, idx) => (
//               <div
//                 key={idx}
//                 className="p-4 bg-white rounded-lg shadow hover:bg-gray-50 cursor-pointer border border-gray-100"
//                 onClick={() => {
//                   const route =
//                     noti.message.includes("assigned") && noti.taskId
//                       ? `/tasks/${noti.taskId}`
//                       : `/admin/tasks/edit/${noti.taskId}`;
//                   navigate(route);
//                 }}
//               >
//                 <h3 className="text-sm font-medium">{noti.title}</h3>
//                 <p className="text-xs text-gray-500">{noti.message}</p>
//               </div>
//             ))}
//         </div>
//       )}
//     </div>
//   );
// };

// export default NotificationPage;


// import React, { useContext, useEffect } from "react";
// import DashboardLayout from "../components/layouts/DashboardLayout";
// import { NotificationContext } from "../context/NotificationContext";
// import { UserContext } from "../context/userContext";
// import { useNavigate } from "react-router-dom";
// import { MdDelete } from "react-icons/md";

// const NotificationPage = () => {
//   const {
//     notifications,
//     markAllAsSeen,
//     deleteNotification,
//     clearAllNotifications,
//   } = useContext(NotificationContext);
//   const { user } = useContext(UserContext);
//   const navigate = useNavigate();

//   useEffect(() => {
//     console.log("📬 NotificationPage mounted - marking all as seen");
//     markAllAsSeen(); // Mark all as seen on open
//   }, []);

//   const handleClick = (taskId) => {
//     console.log(`🧭 Navigating to task: ${taskId} for user role: ${user.role}`);
//     if (user.role === "admin") {
//       navigate("/admin/create-task", { state: { taskId } });
//     } else {
//       navigate(`/user/task-details/${taskId}`);
//     }
//   };

//   //   const handleClearAll = () => {
//   //   console.log("🧹 Clearing all notifications");
//   //   clearAllNotifications();
//   // };

  
//   // return (
//   //   <DashboardLayout activeMenu="Notifications">
//   //     <div className="p-4">
//   //       <div className="flex justify-between items-center mb-4">
//   //         <h2 className="text-2xl font-semibold">Notifications</h2>
//   //         {notifications.length > 0 && (
//   //           <button
//   //             onClick={clearAllNotifications}
//   //             className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
//   //           >
//   //             Clear All
//   //           </button>
//   //         )}
//   //       </div>

//   //       {notifications.length === 0 ? (
//   //         <p className="text-gray-500">No notifications yet.</p>
//   //       ) : (
//   //         <ul className="space-y-4">
//   //           {notifications.map((n, index) => (
//   //             <li
//   //               key={index}
//   //               className={`bg-white shadow rounded p-4 border relative ${
//   //                 !n.seen ? "border-blue-300" : "border-gray-200"
//   //               }`}
//   //             >
//   //               <p className="text-sm text-gray-700">
//   //                 {n.type === "assigned" && (
//   //                   <>
//   //                     📝{" "}
//   //                     <span
//   //                       className="font-medium text-blue-600 cursor-pointer hover:underline"
//   //                       onClick={() => handleClick(n.taskId)}
//   //                     >
//   //                       {n.taskTitle}
//   //                     </span>{" "}
//   //                     was <strong>assigned</strong> to you.
//   //                   </>
//   //                 )}
//   //                 {n.type === "completed" && (
//   //                   <>
//   //                     ✅{" "}
//   //                     <span
//   //                       className="font-medium text-green-600 cursor-pointer hover:underline"
//   //                       onClick={() => handleClick(n.taskId)}
//   //                     >
//   //                       {n.taskTitle}
//   //                     </span>{" "}
//   //                     has been <strong>completed</strong>.
//   //                   </>
//   //                 )}
//   //               </p>
//   //               <p className="text-xs text-gray-400 mt-1">
//   //                 {new Date(n.timestamp).toLocaleString()}
//   //               </p>

//   //               <button
//   //                 onClick={() => deleteNotification(index)}
//   //                 className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
//   //               >
//   //                 <MdDelete size={18} />
//   //               </button>
//   //             </li>
//   //           ))}
//   //         </ul>
//   //       )}
//   //     </div>
//   //   </DashboardLayout>
//   // );
//  return (
//     <DashboardLayout activeMenu="Notifications">
//       <div className="p-4">
//         <div className="flex justify-between items-center mb-4">
//           <h2 className="text-2xl font-semibold">Notifications</h2>
//           {notifications.length > 0 && (
//             <button
//               onClick={handleClearAll}
//               className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
//             >
//               Clear All
//             </button>
//           )}
//         </div>

//         {notifications.length === 0 ? (
//           <p className="text-gray-500">No notifications yet.</p>
//         ) : (
//           <ul className="space-y-4">
//             {notifications.map((n, index) => (
//               <li
//                 key={index}
//                 className={`bg-white shadow rounded p-4 border relative ${
//                   !n.seen ? "border-blue-300" : "border-gray-200"
//                 }`}
//               >
//                 <p className="text-sm text-gray-700">
//                   {n.type === "assigned" && (
//                     <>
//                       📝{" "}
//                       <span
//                         className="font-medium text-blue-600 cursor-pointer hover:underline"
//                         onClick={() => handleClick(n.taskId)}
//                       >
//                         {n.taskTitle}
//                       </span>{" "}
//                       was <strong>assigned</strong> to you.
//                     </>
//                   )}
//                   {n.type === "completed" && (
//                     <>
//                       ✅{" "}
//                       <span
//                         className="font-medium text-green-600 cursor-pointer hover:underline"
//                         onClick={() => handleClick(n.taskId)}
//                       >
//                         {n.taskTitle}
//                       </span>{" "}
//                       has been <strong>completed</strong>.
//                     </>
//                   )}
//                 </p>
//                 <p className="text-xs text-gray-400 mt-1">
//                   {new Date(n.timestamp).toLocaleString()}
//                 </p>

//                 <button
//                   onClick={() => handleDelete(index)}
//                   className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
//                 >
//                   <MdDelete size={18} />
//                 </button>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </DashboardLayout>
//   );


// };

// export default NotificationPage;


//3rdd try
import React, { useContext, useEffect } from "react";
import DashboardLayout from "../components/layouts/DashboardLayout";
import { NotificationContext } from "../context/NotificationContext";
import { UserContext } from "../context/userContext";
import { useNavigate } from "react-router-dom";
import { MdDelete } from "react-icons/md";

const NotificationPage = () => {
  const {
    notifications,
    markAllAsSeen,
    deleteNotification,
    clearAllNotifications,
  } = useContext(NotificationContext);

  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  // ✅ Mark all as seen on page load
  useEffect(() => {
    console.log("📬 NotificationPage mounted - marking all as seen");
    markAllAsSeen();
  }, []);

  // ✅ Handle task click based on user role
  const handleClick = (taskId) => {
    console.log(`🧭 Navigating to task: ${taskId} for user role: ${user.role}`);
    if (user.role === "admin") {
      navigate("/admin/create-task", { state: { taskId } });
    } else {
      navigate(`/user/task-details/${taskId}`);
    }
  };

  // ✅ Handle delete of single notification
  const handleDelete = (index) => {
    deleteNotification(index);
  };

  // ✅ Handle clearing all notifications
  const handleClearAll = () => {
    clearAllNotifications();
  };

  return (
    <DashboardLayout activeMenu="Notifications">
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Notifications</h2>
          {notifications.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm bg-red-100 text-red-600 px-3 py-1 rounded hover:bg-red-200"
            >
              Clear All
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <p className="text-gray-500">No notifications yet.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((n, index) => (
              <li
                key={n._id || index}
                className={`bg-white shadow rounded p-4 border relative ${
                  !n.seen ? "border-blue-300" : "border-gray-200"
                }`}
              >
                <p className="text-sm text-gray-700">
                  {n.type === "assigned" && (
                    <>
                      📝{" "}
                      <span
                        className="font-medium text-blue-600 cursor-pointer hover:underline"
                        onClick={() => handleClick(n.taskId)}
                      >
                        {n.taskTitle}
                      </span>{" "}
                      was <strong>assigned</strong> to you.
                    </>
                  )}
                  {n.type === "completed" && (
                    <>
                      ✅{" "}
                      <span
                        className="font-medium text-green-600 cursor-pointer hover:underline"
                        onClick={() => handleClick(n.taskId)}
                      >
                        {n.taskTitle}
                      </span>{" "}
                      has been <strong>completed</strong>.
                    </>
                  )}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.timestamp).toLocaleString()}
                </p>

                <button
                  onClick={() => handleDelete(index)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-600"
                >
                  <MdDelete size={18} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationPage;
