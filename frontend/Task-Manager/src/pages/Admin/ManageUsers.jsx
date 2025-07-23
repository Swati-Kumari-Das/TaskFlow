import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";// Make sure to import axiosInstance
import { API_PATHS } from "../../utils/apiPaths"; // Adjust import path as needed
import { LuFileSpreadsheet } from "react-icons/lu";
import UserCard from "../../components/Cards/UserCard";
import toast from "react-hot-toast";
const ManageUsers = () => {
    const [allUsers, setAllUsers] = useState([]);

    const getAllUsers = async () => {
        try {
            const response = await axiosInstance.get(API_PATHS.USERS.GET_ALL_USERS);
            if (response.data?.length > 0) {
                setAllUsers(response.data);
            }
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };
const handleDeleteUser = async (userId) => {
  if (!window.confirm("Are you sure you want to delete this user?")) return;

  try {
      await axiosInstance.delete(API_PATHS.USERS.DELETE_USER(userId));
    setAllUsers(prev => prev.filter(user => user._id !== userId));
     toast.success("User deleted successfully");
  } catch (error) {
    console.error("Failed to delete user:", error);
     toast.error(error.response?.data?.message || "Failed to delete user");
  }
};

  //Download task Report
 // download task report
const handleDownloadReport = async () => {
    try {
        const response = await axiosInstance.get(API_PATHS.REPORTS.EXPORT_USERS, {
            responseType: "blob",
        });

        // Create a URL for the blob
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "user_details.xlsx");
        document.body.appendChild(link);
        link.click();
        
        // Clean up
        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error("Error downloading user details:", error);
        toast.error("Failed to download user details. Please try again.");
    }
};

  useEffect(() =>{
    getAllUsers();
    return () => {};
  }, []);

    return (
        <DashboardLayout activeMenu="Team Members">
  <div className="mt-5 mb-10">
    <div className="flex md:flex-row md:items-center justify-between">
      <h2 className="text-xl md:text-xl font-medium">Team Members</h2>

      <button 
        className="flex md:flex download-btn" 
        onClick={handleDownloadReport}
      >
        <LuFileSpreadsheet className="text-lg"/>
        Download Report
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
    {allUsers?.map((user) => (
        <UserCard key={user._id} userInfo={user} onDelete={handleDeleteUser} />
    ))}
  </div>
  </div>
</DashboardLayout>
    );
};

export default ManageUsers;