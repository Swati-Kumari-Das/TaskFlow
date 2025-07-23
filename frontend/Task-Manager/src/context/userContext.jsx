import React, { createContext, useState, useEffect } from "react";
import axiosInstance from "../utils/axiosInstance";
import { API_PATHS } from "../utils/apiPaths";
import socket from "../utils/socket"; // 👈 import socket
export const UserContext = createContext();

const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) return;

        const accessToken = localStorage.getItem("token");
        if (!accessToken) {
            setLoading(false);
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await axiosInstance.get(API_PATHS.AUTH.GET_PROFILE);
                setUser(response.data);
            } catch (error) {
                console.error("User not authenticated", error);
                clearUser();
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);
 
      // ✅ Connect socket after user is loaded
    useEffect(() => {
        if (user?._id) {
            socket.connect();
            socket.emit("join", user._id); // Backend joins this user to their socket room
        }

        return () => {
            socket.disconnect();
        };
    }, [user]);

    const updateUser = (userData) => {
        setUser(userData);
        if (userData.token) {
            localStorage.setItem("token", userData.token);
        }
        setLoading(false);
    };

    const clearUser = () => {
        setUser(null);
        localStorage.removeItem("token");
    };

    return (
        <UserContext.Provider value={{
            user,
            loading,
            updateUser,
            clearUser
        }}>
            {children}
        </UserContext.Provider>
    );
};

export default UserProvider;