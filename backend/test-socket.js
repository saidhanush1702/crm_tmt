import { io } from "socket.io-client";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGUxNzdiZGUzZjc1NTJhZTJmOWQ5YSIsInJvbGUiOiJpbnRlcm4iLCJpYXQiOjE3NjI1MzEzMDMsImV4cCI6MTc2MjYxNzcwM30.QVc27ITAb8t9pwZjLmNAfSnUZayG3VaXCvI2sVS8RA8";
const PROJECT_ID = "690e1874de3f7552ae2f9d9e";
const SENDER_ID = "690e177bde3f7552ae2f9d9a";

const socket = io("http://localhost:5000", {
  auth: { token: TOKEN },
});

socket.on("connect", () => {
  console.log("✅ Connected to Socket.IO server");
  socket.emit("joinProject", PROJECT_ID);

  const messageData = {
    projectId: PROJECT_ID,
    senderId: SENDER_ID,
    message: "Intern started the first task!"
  };

  socket.emit("sendMessage", messageData);
});

socket.on("receiveMessage", (msg) => {
  console.log("💬 New message:", msg);
});
