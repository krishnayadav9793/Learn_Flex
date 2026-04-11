import { io } from "socket.io-client";

const socket = io("https://learn-flex-2.onrender.com/", {
  withCredentials: true,
});

export default socket;