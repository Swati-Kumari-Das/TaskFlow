import React, { useContext, useEffect, useState } from "react";
import { SIDE_MENU_ADMIN_DATA, SIDE_MENU_USER_DATA } from "../../utils/data.js";
import defaultImage from "../../assets/images/default-image.jpg";

import { NotificationContext } from "../../context/NotificationContext.jsx";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../../context/userContext.jsx";
const SideMenu = ({ activeMenu }) => {
    const { user, clearUser } = useContext(UserContext);
    const [sideMenuData, setSideMenuData] = useState([]);
    const navigate = useNavigate();
    
    const { notifications } = useContext(NotificationContext);
   // const unseenCount = notifications.filter((n) => !n.seen).length;
   const unseenCount = Array.isArray(notifications)
  ? notifications.filter((n) => !n.seen).length
  : 0;

    const handleClick = (route) => {
        if (route === "logout") {
            handleLogout();
            return;
        }
        navigate(route);
    };

    const handleLogout = () => {
        localStorage.clear();
        clearUser();
        navigate("/login");
    };

    useEffect(() => {
        if (user) {
            setSideMenuData(
                user?.role === "admin" ? SIDE_MENU_ADMIN_DATA : SIDE_MENU_USER_DATA
            );
        }
    }, [user]);

//     return (
//   <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20">
//     <div className="flex flex-col items-center justify-center mb-7 pt-5">
//       <div className="relative">
//         <img 
//            src={user?.profileImageUrl ? user.profileImageUrl : defaultImage}
//           alt="Profile Image"
//           className="w-20 h-20 bg-slate-400 rounded-full"
//         />
//       </div>

//       {user?.role === "admin" && (
//         <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
//           Admin
//         </div>
//       )}
      
//       <h5 className="text-gray-950 font-medium leading-6 mt-3">
//         {user?.name || ""}
//       </h5>
//       <p className="text-[12px] text-gray-500">{user?.email || ""}</p>
//     </div>

//     {sideMenuData.map((item, index) => (
//       <button
//         key={`menu_${index}`}
//         className={`w-full flex items-center gap-4 text-[15px] ${
//           activeMenu === item.label
//             ? "text-primary bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-3"
//             : ""
//         } py-3 px-6 mb-3 cursor-pointer`}
//         onClick={() => handleClick(item.path)}
//       >
//         <item.icon className="text-xl" />
//         {item.label}
//       </button>
   
//     ))}
//   </div>
// );


return (
  <div className="w-64 h-[calc(100vh-61px)] bg-white border-r border-gray-200/50 sticky top-[61px] z-20">
    <div className="flex flex-col items-center justify-center mb-7 pt-5">
      <div className="relative">
        <img 
          src={user?.profileImageUrl ? user.profileImageUrl : defaultImage}
          alt="Profile Image"
          className="w-20 h-20 bg-slate-400 rounded-full"
        />
      </div>

      {user?.role === "admin" && (
        <div className="text-[10px] font-medium text-white bg-primary px-3 py-0.5 rounded mt-1">
          Admin
        </div>
      )}
      
      <h5 className="text-gray-950 font-medium leading-6 mt-3">
        {user?.name || ""}
      </h5>
      <p className="text-[12px] text-gray-500">{user?.email || ""}</p>
    </div>

    {/* Main Side Menu Items */}
     {/* 🔔 Notifications Menu Button (outside the .map) */}
   {user?.role !== "admin" && (
    <button
      className={`w-full flex items-center gap-4 text-[15px] py-3 px-6 mb-3 cursor-pointer ${
        activeMenu === "Notifications"
          ? "text-primary bg-blue-50/50 border-r-3"
          : ""
      }`}
      onClick={() => navigate("/notifications")}
    >
     <span className="text-xl">🔔</span>
      Notifications
      {unseenCount > 0 && (
        <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {unseenCount}
        </span>
      )}
    </button>
    )}
    {sideMenuData.map((item, index) => (
      <button
        key={`menu_${index}`}
        className={`w-full flex items-center gap-4 text-[15px] ${
          activeMenu === item.label
            ? "text-primary bg-linear-to-r from-blue-50/40 to-blue-100/50 border-r-3"
            : ""
        } py-3 px-6 mb-3 cursor-pointer`}
        onClick={() => handleClick(item.path)}
      >
        <item.icon className="text-xl" />
        {item.label}
      </button>
    ))}

   
  </div>
);


};

export default SideMenu;