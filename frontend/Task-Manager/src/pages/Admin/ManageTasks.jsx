import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layouts/DashboardLayout";
import axiosInstance from "../../utils/axiosInstance";
import { API_PATHS } from "../../utils/apiPaths";
import { LuFileSpreadsheet } from "react-icons/lu";
const ManageTasks = () => {
    const [allTasks, setAllTasks] = useState([]);
    const [tabs, setTabs] = useState([]);
    const [filterStatus, setFilterStatus] = useState("All");
    const navigate = useNavigate();

   const getAllTasks = async () => {
  try {
    const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS, {
      params: {
        status: filterStatus === "All" ? "" : filterStatus,
      },
    });
    setAllTasks(response.data?.tasks?.length >0 ?response.data.tasks : []);
    // Handle response here (e.g., set state)

    //Map status Summary data with fixed labels and order 
   const statusSummary = response.data?.statusSummary || {};

const statusArray = [
    { label: "All", count: statusSummary.all || 0 },
    { label: "Pending", count: statusSummary.pendingTasks || 0 },
    { label: "In Progress", count: statusSummary.inProgress || 0 },
    { label: "Completed", count: statusSummary.completed || 0 }
];

setTabs(statusArray);
    console.log("Tasks fetched:", response.data);
  } catch (error) {
    console.error("Error fetching tasks:", error);
  }
};


    const handleClick = (taskData) => {
        navigate('/admin/create-task', { state: { taskId: taskData._id } });
    };

    // download tasks function would go here
   const handleDownloadReport=async()=>{

   };
   useEffect(() =>{
    getAllTasks(filterStatus);
    return () => {};
   },[filterStatus]); 

    return (
        <DashboardLayout activeMenu="Manage Tasks">
            <div className="my-5">
            <div className="flex flex-col md:flex-row md:items-center">
            <div className="flex items-center justify-between">
                 <h2 className="text-xl md:text-2xl font-medium">Manage Tasks</h2>
                 
            <button
             className="flex md:hidden download-btn"
             onClick={handleDownloadReport}
            > <LuFileSpreadsheet className="text-lg"/>
                     Download Report
            </button>
            </div>
           </div>


            </div>
        </DashboardLayout>
    );
};

export default ManageTasks;