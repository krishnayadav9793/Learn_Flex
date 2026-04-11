import { io } from "socket.io-client";

const socket = io("https://learn-flex-puce.vercel.app", {
  withCredentials: true,
});

export default socket;