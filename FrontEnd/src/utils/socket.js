import { io } from "socket.io-client";

const socket = io("http://localhost:5000", {
  path: "/socket.io",
  transports: ["websocket"], // force websocket
  withCredentials: true,
});

export default socket;
