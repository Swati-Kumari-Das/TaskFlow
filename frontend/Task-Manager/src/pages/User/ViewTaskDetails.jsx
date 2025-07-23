import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import AvatarGroup from '../../components/layouts/AvatarGroup';
import moment from 'moment';
import { LuSquareArrowOutUpRight } from 'react-icons/lu';
import toast from 'react-hot-toast';
const ViewTaskDetails = () => {
    const { id } = useParams();
    const [task, setTask] = useState(null);

    const getStatusTagColor = (status) => {
        switch (status) {
            case "In Progress":
                return "text-cyan-500 bg-cyan-50 border border-cyan-500/10";
            case "Completed":
                return "text-lime-500 bg-lime-50 border border-lime-500/20";
            default:
                return "text-violet-500 bg-violet-50 border border-violet-500/10";
        }
    };

    // Get Task info by ID
// Get Task info by ID
const getTaskDetailsByID = async () => {
    try {
        const response = await axiosInstance.get(
            API_PATHS.TASKS.GET_TASK_BY_ID(id)
        );
        
        if (response.data) {
            const taskInfo = response.data;
            setTask(taskInfo);
        }
    } catch (error) {
        console.error("Error fetching task details:", error);
        toast.error("Failed to load task details. Please try again.");
    } 
};
    // Handle todo checklist update
  // handle todo check
// const updateTodoChecklist = async (index) => {
//     const todoChecklist = [...task?.todoChecklist];
//     const taskId = id;

//     if (todoChecklist && todoChecklist[index]) {
//     todoChecklist[index].completed = !todoChecklist[index].completed;

//     try {
//     const response = await axiosInstance.put(
//     API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
//     { todoChecklist }
//     );
//     if (response.status === 200) {
//     setTask(response.data?.task || task);
//     } else {
//     // Optionally revert the toggle if the API call fails.
//     todoChecklist[index].completed = !todoChecklist[index].completed;
//     }
//     } catch (error) {
//     todoChecklist[index].completed = !todoChecklist[index].completed;
//     }
//     };
// };
// const updateTodoChecklist = async (index) => {
//   if (!task || !task.todoChecklist || !task.todoChecklist[index]) return;

//   const todoChecklist = [...task.todoChecklist];
//   const taskId = id;

//   todoChecklist[index].completed = !todoChecklist[index].completed;

//   try {
//     const response = await axiosInstance.put(
//       API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(taskId),
//       { todoChecklist }
//     );

//     if (response.status === 200) {
//       setTask(response.data?.task || task);
//     } else {
//       todoChecklist[index].completed = !todoChecklist[index].completed;
//       toast.error("Failed to update checklist.");
//     }
//   } catch (error) {
//     todoChecklist[index].completed = !todoChecklist[index].completed;
//     toast.error("An error occurred. Please try again.");
//   }
// };

//2nd try
// const updateTodoChecklist = async (index) => {
//   if (!task || !task.todoChecklist || !task.todoChecklist[index]) return;

//   // Optimistically toggle in local copy
//   const updatedChecklist = [...task.todoChecklist];
//   updatedChecklist[index] = {
//     ...updatedChecklist[index],
//     completed: !updatedChecklist[index].completed,
//   };

//   // Update UI immediately
//   setTask((prevTask) => ({
//     ...prevTask,
//     todoChecklist: updatedChecklist,
//   }));

//   try {
//     const response = await axiosInstance.put(
//       API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(task._id),
//       { todoChecklist: updatedChecklist }
//     );

//     // Optionally update again with fresh task from backend
//     if (response.data?.task) {
//       setTask(response.data.task);
//     }
//   } catch (error) {
//     // Revert change on error
//     updatedChecklist[index].completed = !updatedChecklist[index].completed;

//     setTask((prevTask) => ({
//       ...prevTask,
//       todoChecklist: updatedChecklist,
//     }));

//     toast.error("Failed to update checklist. Please try again.");
//   }
// };


const updateTodoChecklist = async (index) => {
  if (!task || !task.todoChecklist || !task.todoChecklist[index]) return;

  const updatedChecklist = [...task.todoChecklist];
  updatedChecklist[index] = {
    ...updatedChecklist[index],
    completed: !updatedChecklist[index].completed,
  };

  setTask((prevTask) => ({
    ...prevTask,
    todoChecklist: updatedChecklist,
  }));

  try {
    // 1️⃣ Update checklist
    const response = await axiosInstance.put(
      API_PATHS.TASKS.UPDATE_TODO_CHECKLIST(task._id),
      { todoChecklist: updatedChecklist }
    );

    if (response.data?.task) {
      const updatedTask = response.data.task;
      setTask(updatedTask);

      // 2️⃣ If all checklist items are now completed, update task status to "Completed"
      const allDone = updatedTask.todoChecklist.every((item) => item.completed);

      if (allDone && updatedTask.status !== "Completed") {
        const statusResponse = await axiosInstance.patch(
          API_PATHS.TASKS.UPDATE_TASK_STATUS(updatedTask._id),
          { status: "Completed" }
        );

        if (statusResponse.data?.task) {
          setTask(statusResponse.data.task); // update task again
          toast.success("Task marked as Completed!");
        }
      }
    }
  } catch (error) {
    // revert on error
    updatedChecklist[index].completed = !updatedChecklist[index].completed;

    setTask((prevTask) => ({
      ...prevTask,
      todoChecklist: updatedChecklist,
    }));

    toast.error("Failed to update checklist. Please try again.");
  }
};

    const handleLinkClick=(link)=>{
       if(!/^https?:\/\//i.test(link)){
        link="https://"+link; //Default to HTTPS
       }
         window.open(link,"_blank")
    }
    // Handle attachment download/delete
    const handleAttachment = (action, attachmentId) => {
        // Add your attachment handling logic here
    };

    useEffect(() => {
      if(id){
       getTaskDetailsByID();
      }
     return ()=>{};  
    }, [id]);

    return (
        <DashboardLayout activeMenu="My Tasks">
  <div className="mt-5">
   { task && (<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
      <div className="form-card col-span-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm md:text-xl font-medium">
            {task?.title}
          </h2>
          <div
            className={`text-[11px] md:text-[13px] font-medium ${getStatusTagColor(
              task?.status
            )} px-4 py-0.5 rounded`}
          >
            {task?.status}
          </div>
        </div>
      
       <div className='mt-4'>
        <InfoBox label="Description" value={task?.description}/>

       </div>
        
    <div className="grid grid-cols-12  gap-4 mt-4">
    {/* Priority */}
    <div className="col-span-6 md:col-span-4">
        <InfoBox label="Priority" value={task?.priority} />
    </div>

    {/* Due Date */}
    <div className="col-span-6 md:col-span-4 ">
        <InfoBox
            label="Due Date"
            value={
                task?.dueDate
                    ? moment(task.dueDate).format("Do MMM YYYY")
                    : "N/A"
            }
        />
    </div>

    {/* Assigned To */}
    <div className="col-span-6 md:col-span-4">
        <label className="text-xs font-medium text-slate-500">
            Assigned To
        </label>
        <AvatarGroup
            avatars={task?.assignedTo?.map((item) => item?.profileImageUrl) || []}
            maxVisible={5}
            className="mt-0.5"
        />
    </div>
</div>
      
          <div className="mt-2">
            <label className="text-xs font-medium text-slate-500">
                Todo Checklist
            </label>
            {task?.todoChecklist?.map((item, index) => (
                <TodoCheckList
                    key={`todo_${index}`}
                    text={item.text}
                    isChecked={item.completed}
                    onChange={() => updateTodoChecklist(index)}
                />
            ))}
        </div>  

         <div className="mt-2">
  {task?.attachments?.length > 0 && (
    <div className="mt-2">
      <label className="text-xs font-medium text-slate-500">
        Attachments
      </label>
      <div className="mt-1 space-y-1">
        {task?.attachments?.map((link, index) => (
          <Attachment
            key={`link_${index}`}
            link={link}
            index={index}
            onClick={() => handleLinkClick(link)}
          />
        ))}
      </div>
    </div>
  )}
        </div>

        

      </div>
    </div>)}
  </div>
</DashboardLayout>
    );
};

export default ViewTaskDetails;

const InfoBox = ({ label, value }) => {
    return (
        <div className="mb-3">
            <label className="text-xs font-medium text-slate-500">
                {label}
            </label>
            <p className="text-[12px] md:text-[13px] font-medium text-gray-700 mt-0.5">
                {value}
            </p>
        </div>
    );
};

const TodoCheckList = ({ text, isChecked, onChange }) => (
  <div className="flex items-center gap-3 p-3">
    <input
      type="checkbox"
      checked={isChecked}
      onChange={onChange}
      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded-sm outline-none cursor-pointer"
    />
    <p className={`text-[13px] text-gray-800 ${isChecked ? 'line-through' : ''}`}>
      {text}
    </p>
  </div>
);

const Attachment = ({ link, index, onClick }) => {
  return (
    <div 
      className="flex justify-between items-center bg-gray-50 border border-gray-100 px-3 py-2 rounded cursor-pointer hover:bg-gray-100"
      onClick={onClick}
    >
      <div className="flex-1 flex items-center gap-3">
        <span className="text-xs text-gray-400 font-semibold mr-2">
          {index < 9 ? `0${index + 1}` : index + 1}&nbsp;&nbsp;
        </span>
        <p className="text-xs text-black truncate">{link}</p>
      </div>
      <LuSquareArrowOutUpRight className="text-gray-400 " />
    </div>
  );
};
