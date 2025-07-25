import React from 'react';
import defaultImage from '../../assets/images/default-image.jpg';
import { MdDelete } from "react-icons/md";

const UserCard = ({ userInfo,onDelete }) => {
    return (
        <div className="user-card p-2 relative">
             
               <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => onDelete(userInfo._id)}
                title="Delete User"
            >
                <MdDelete size={16} />
            </button>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img 
                        src={userInfo?.profileImageUrl || defaultImage}
                        alt="Avatar"
                        className="w-12 h-12 rounded-full border-2 border-white"
                    />
                    <div>
                        <p className="text-sm font-medium">{userInfo?.name}</p>
                        <p className="text-xs text-gray-500">{userInfo?.email}</p>
                    </div>
                </div>
            </div>

        <div className="flex items-end gap-3 mt-5">
        <StatCard
        label="Pending"
        count={userInfo?.pendingTasks || 0}
        status="pending"
        />
         <StatCard
        label="In Progress"
        count={userInfo?.inProgressTasks || 0}
        status="In Progress"
        />
         <StatCard
        label="Completed"
        count={userInfo?.completedTasks || 0}
        status="Completed"
        />
       </div>
    </div>
    );
};


export default UserCard;

const StatCard = ({ label, count, status }) => {
    const getStatusTagColor = () => {
        switch (status) {
            case "In Progress":
                return "text-cyan-500 bg-cyan-50";
            case "Completed":
                return "text-indigo-500 bg-indigo-50";
            default:
                return "text-violet-500 bg-violet-50";
        }
    };
     return (
        <div className={`flex-1 text-[10px] font-medium ${getStatusTagColor()} px-4 py-0.5 rounded`}>
            <span className="text-[12px] font-semibold">{count}</span> <br /> {label}
        </div>
    );

}

