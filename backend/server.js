import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import userRoutes from "./routes/userRoutes.js";

// Models
import Message from "./models/Message.js";
import Project from "./models/Project.js";
import User from "./models/User.js";

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// ---------- Middlewares ----------
app.use(cors());
app.use(express.json());

// ---------- API Routes ----------
app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Root test route
app.get("/", (req, res) => {
  res.send("✅ Task Manager API running successfully");
});

// ---------- SOCKET.IO Logic ----------
io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // Join a project room
  socket.on("joinProject", (projectId) => {
    if (!projectId) return;
    socket.join(projectId);
    console.log(`📁 Socket ${socket.id} joined project room ${projectId}`);
  });

  // Handle sending messages
  socket.on("sendMessage", async (msg) => {
    try {
      const { projectId, senderId, message } = msg;

      if (!projectId || !senderId || !message) return;

      // Validate project & membership
      const project = await Project.findById(projectId);
      if (!project) return console.log("❌ Project not found");

      const isMember = project.members.some(
        (id) => id.toString() === senderId.toString()
      );

      if (!isMember) {
        console.log(`❌ Sender ${senderId} not part of project ${projectId}`);
        return;
      }

      // Find sender info
      const sender = await User.findById(senderId);
      if (!sender) return console.log("❌ Sender not found");

      // Save message
      const newMsg = await Message.create({
        projectId,
        senderId,
        message,
      });

      // Populate message object with sender name
      const fullMsg = {
        ...newMsg.toObject(),
        senderName: sender.name,
      };

      // Emit message to all members in that project room
      io.to(projectId).emit("receiveMessage", fullMsg);
      console.log(`💬 [${projectId}] ${sender.name}: ${message}`);
    } catch (err) {
      console.error("⚠️ Error handling sendMessage:", err.message);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
