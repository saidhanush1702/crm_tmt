import express from "express";
import http from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import inboxRoutes from "./routes/inboxRoutes.js";


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

// Socket.IO setup
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
app.use("/api/upload", uploadRoutes); // for file uploads
app.use("/api/intern-apply", inboxRoutes);


// Root route
app.get("/", (req, res) => {
  res.send("✅ Task Manager API running successfully");
});

// ---------- SOCKET.IO Logic ----------
io.on("connection", (socket) => {
  console.log(`⚡ User connected: ${socket.id}`);

  // Join project room
  socket.on("joinProject", (projectId) => {
    if (!projectId) return;
    socket.join(projectId);
    console.log(`📁 Socket ${socket.id} joined project room ${projectId}`);
  });

  // Handle sending messages (text + file)
  socket.on("sendMessage", async (msg) => {
    try {
      const { projectId, senderId, message, fileUrl, fileType, originalName } = msg;

      // ✅ Validate minimal content
      if (!projectId || !senderId || (!message && !fileUrl)) {
        console.log("❌ Invalid message: missing content or file");
        return;
      }

      // Validate project and membership
      const project = await Project.findById(projectId);
      if (!project) return console.log("❌ Project not found");

      const isMember = project.members.some(
        (id) => id.toString() === senderId.toString()
      );
      if (!isMember) {
        console.log(`❌ Sender ${senderId} not part of project ${projectId}`);
        return;
      }

      // Fetch sender details
      const sender = await User.findById(senderId);
      if (!sender) return console.log("❌ Sender not found");

      // ✅ Create message document
      const newMsg = await Message.create({
        projectId,
        senderId,
        message: message || "",
        fileUrl: fileUrl || null,
        fileType: fileType || null,
        originalName: originalName || null,
      });

      // ✅ Emit to project room
      const fullMsg = {
        ...newMsg.toObject(),
        senderName: sender.name,
      };

      io.to(projectId).emit("receiveMessage", fullMsg);
      console.log(
        `💬 [${projectId}] ${sender.name}: ${
          message || `[file uploaded: ${fileType}]`
        }`
      );
    } catch (err) {
      console.error("⚠️ Error handling sendMessage:", err.message);
    }
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ---------- Start Server ----------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`)
);
