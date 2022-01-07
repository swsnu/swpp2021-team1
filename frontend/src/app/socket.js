import React from "react";

const socket = new WebSocket("ws://localhost:8000/ws/notifications/");

const SocketContext = React.createContext();

export { socket, SocketContext };
