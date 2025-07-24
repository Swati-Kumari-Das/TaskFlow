

#  TaskFlow – Task Management & Project Collaboration Tool

A full-stack **Task Management and Project Collaboration Tool** designed for teams and admins to efficiently manage, assign, track, and complete tasks.

Built with the **MERN Stack** (MongoDB, Express.js, React.js, Node.js) and styled using **Tailwind CSS**, this powerful system provides real-time updates via **Socket.IO**, supports **local image uploads**, **task attachments**, **due date reminders**, and ensures smooth task coordination within teams.

---

## 🚀 Live Demo

🔗 [https://taskflow-nu-taupe.vercel.app](https://taskflow-nu-taupe.vercel.app)

---

## 📸 Screenshots

> Here are a few key pages from the project:

### ✅ Admin Dashboard

- View total, pending, completed, and in-progress tasks.
- See graphical stats for task distribution and priority levels.
<img width="1901" height="883" alt="image" src="https://github.com/user-attachments/assets/0f8380fa-5d33-45fa-ba4c-231f8933d2e0" />

<img width="1897" height="911" alt="image" src="https://github.com/user-attachments/assets/96f1b31e-6576-4f0b-9ce4-6c39b0d64558" />

---

### 📝 Create Task

- Create tasks with title, description, priority, due date, and assign members.
- Add subtasks/checklists and file attachments.
<img width="1896" height="916" alt="image" src="https://github.com/user-attachments/assets/e7059af0-2dbc-4aed-9a29-71d63e0105f1" />


---

### 📂 Manage Tasks

- Track task status, progress bars, and deadlines.
- Filter tasks by status (All, Pending, In Progress, Completed).
<img width="1915" height="875" alt="image" src="https://github.com/user-attachments/assets/748f19c3-2cbd-464b-a0ed-68f122f67b3b" />

---

### 📂 Update Tasks
- Modify any existing task's:
  - **Title**
  - **Description**
  - **Priority**
  - **Due Date**
  - **Assigned Members**
  - **TODO Checklist**
  - **Attachments (Links)**
- Reorder or delete individual subtasks
- Changes are immediately reflected for assigned users
 Admins can also **delete the task** using the `Delete` button at the top right.
<img width="1758" height="913" alt="image" src="https://github.com/user-attachments/assets/795461ef-cdb6-4340-b159-f6e89850f4bd" />
---

### 👥 Team Members

- View all team members with their respective task statuses.
- Option to delete a member and download reports.
<img width="1895" height="879" alt="image" src="https://github.com/user-attachments/assets/4da736ba-66cf-47f3-b83b-8e4761d0b141" />
---

### 🔔 Notifications For Team Members

- Real-time notifications using **Socket.IO** with sound alert when task is assigned.
- Members can delete individual notifications or clear all.
<img width="1882" height="914" alt="image" src="https://github.com/user-attachments/assets/731144ce-16ef-46d8-af64-7d7c2ae89377" />
---

### 📌 My Tasks (Team Member View)

- Track tasks assigned to you.
- Status and progress of each assigned task.
<img width="1908" height="858" alt="image" src="https://github.com/user-attachments/assets/53736ae6-71f8-467a-b0ce-811e0347e957" />


---
### ✅ User Dashboard
- View total, pending, completed, and in-progress tasks.
- See graphical stats for task distribution and priority levels.
 <img width="1897" height="923" alt="image" src="https://github.com/user-attachments/assets/16a606b7-3d7c-46c3-b4ee-66a34851d58b" />
 ---
### Tasks Detail (Team Member View)
- View details of the Task.
-can update status of the task.
<img width="1817" height="900" alt="image" src="https://github.com/user-attachments/assets/b2dafb18-0062-478a-8d55-6b47bcb7ee15" />

## 🛠️ Tech Stack

### ✅ Frontend

- **React.js**
- **Tailwind CSS**
- **Axios** for API calls
- **Socket.IO Client** for real-time updates

### ✅ Backend

- **Node.js**, **Express.js**
- **MongoDB Atlas** for cloud database
- **Socket.IO Server**
- **Multer** for local file uploads (profile images and attachments)
- **JWT Authentication**

---

## 🧩 Core Features

### 👨‍💼 Admin Features

- Secure Admin Login
- Dashboard with charts and statistics
- Create/Update/Delete Tasks
- Assign tasks to one or multiple team members
- Add attachments and TODO checklist
- Set task priority and due date
- View and manage all team members
- Download team task reports (CSV or Excel)

---

### 👩‍💻 Team Member Features

- Secure Member Login
- Dashboard with charts and statistics
- View tasks assigned to them
- Track progress, status, and deadlines
- Mark subtasks as complete
- Get real-time notifications with sound on new assignments
- Delete seen notifications

---

### 📦 Additional Features

- ✅ Real-time notifications via **Socket.IO**
- ✅ Sound alerts for new notifications
- ✅ Local image upload (using **Multer**) for profile pictures
- ✅ link input for task attachments
- ✅ Due Date Reminders visible on task cards
- ✅ Responsive UI built using **Tailwind CSS**

---



