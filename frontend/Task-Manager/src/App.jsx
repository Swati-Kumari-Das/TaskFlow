import React from 'react'
import { useContext } from 'react';
import { UserContext } from './context/userContext';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  Navigate
} from "react-router-dom";
import Login from './pages/Auth/Login';
import SignUp from './pages/Auth/SignUp';
import Dashboard from './pages/Admin/Dashboard';
import CreateTask from './pages/Admin/CreateTask';
import ManageTasks from './pages/Admin/ManageTasks';
import ManageUsers from './pages/Admin/ManageUsers';
import UserDashboard from './pages/User/UserDashboard';
import MyTasks from './pages/User/MyTasks';
import PrivateRoute from './routes/PrivateRoute';
import ViewTaskDetails from './pages/User/ViewTaskDetails';
import './index.css';
import UserProvider from './context/userContext';
import NotificationPage from './pages/NotificationPage';


import NotificationProvider from './context/NotificationContext';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
  <UserProvider>
      <NotificationProvider>
   <div>
    <Router>
      <Routes>
        <Route path='/login' element={<Login/>}/>
         <Route path='/signUp' element={<SignUp/>}/>
         <Route path="/notifications" element={<NotificationPage />} />

         {/* Admin Routes */}
         <Route element={<PrivateRoute allowedRoles={["admin"]}/>}>
           <Route path='/admin/dashboard' element={<Dashboard/>}/>
           <Route path='/admin/tasks' element={<ManageTasks />}/>
            <Route path='/admin/create-task' element={<CreateTask />}/>
             <Route path='/admin/users' element={<ManageUsers />}/>
         </Route>

         {/* User Routes */}
         <Route element={<PrivateRoute allowedRoles={["user"]}/>}>
           <Route path='/user/dashboard' element={<UserDashboard/>}/>
           <Route path='/user/tasks' element={<MyTasks/>}/> 
          <Route path='/user/task-details/:id' element={<ViewTaskDetails/>}/> 
          </Route>

              {/* default Route */}

            <Route path="/" element={<Root/>} />
      </Routes>

    </Router>
   </div>

   <Toaster
    toastOptions={{
      className:"",
      style:{
       fontSize:"13px",
      },
    }}/>
    </NotificationProvider>
   </UserProvider>
  );
};

const Root = () => {
    const { user, loading } = useContext(UserContext);

    if (loading) return <Outlet />;

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return user.role === "admin" 
        ? <Navigate to="/admin/dashboard" replace /> 
        : <Navigate to="/user/dashboard" replace />;
};


export default App
