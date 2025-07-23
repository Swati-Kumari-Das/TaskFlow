// src/utils/socket.js
import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_API_BASE_URL, {
  
  withCredentials: true,
  autoConnect: false, // we'll manually connect after login
    transports: ["websocket"],

    
});

export default socket;
