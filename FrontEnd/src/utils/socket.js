import { io } from "socket.io-client";

const socket = io("/", {
  path: "/socket.io",
  transports: ["websocket"], // force websocket
  withCredentials: true,
});

export default socket;
