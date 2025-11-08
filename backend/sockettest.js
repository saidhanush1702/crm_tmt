import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

socket.on("connect", () => {
  console.log("Connected to Socket:", socket.id);

  const projectId = "690e1874de3f7552ae2f9d9e"; // existing project
  const adminId = "690e23bad4dc5bbe84e9e44d"; // admin _id

  socket.emit("joinProject", projectId);
  console.log("Joined project:", projectId);

  socket.emit("sendMessage", {
    projectId,
    senderId: adminId,
    message: "Admin backend test via Node script 🚀",
  });
});

socket.on("receiveMessage", (msg) => {
  console.log("Message received in room:", msg);
});

socket.on("disconnect", () => {
  console.log("Disconnected.");
});
