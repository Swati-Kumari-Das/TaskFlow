# 🧩 Task Manager Web Application

A full-stack **Task Management System** designed for teams and admins to efficiently manage, assign, track, and complete tasks. Built with **MERN Stack** (MongoDB, Express.js, React, Node.js) and styled using **Tailwind CSS**, this app provides real-time notifications using **Socket.IO** and supports **file attachments**, **due date reminders**, and **local image uploads** for user profiles.

---

## 🚀 Live Demo

🔗 [https://taskflow-nu-taupe.vercel.app](https://taskflow-nu-taupe.vercel.app)

---

## 📸 Screenshots

> Here are a few key pages from the project:

### ✅ Admin Dashboard

- View total, pending, completed, and in-progress tasks.
- See graphical stats for task distribution and priority levels.

![Admin Dashboard](screenshots/admin-dashboard.png)

---

### 📝 Create Task

- Create tasks with title, description, priority, due date, and assign members.
- Add subtasks/checklists and file attachments.

![Create Task](screenshots/create-task.png)

---

### 📂 Manage Tasks

- Track task status, progress bars, and deadlines.
- Filter tasks by status (All, Pending, In Progress, Completed).

![Manage Tasks](screenshots/manage-tasks.png)

---

### 👥 Team Members

- View all team members with their respective task statuses.
- Option to delete a member and download reports.

![Team Members](screenshots/team-members.png)

---

### 🔔 Notifications

- Real-time notifications using **Socket.IO** with sound alert when task is assigned.
- Members can delete individual notifications or clear all.

![Notifications](screenshots/notifications.png)

---

### 📌 My Tasks (Team Member View)

- Track tasks assigned to you.
- Status and progress of each assigned task.

![My Tasks](screenshots/my-tasks.png)

---

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
- ✅ File link input for task attachments
- ✅ Due Date Reminders visible on task cards
- ✅ Responsive UI built using **Tailwind CSS**

---



