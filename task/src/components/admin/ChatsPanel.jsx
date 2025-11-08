import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import socket from "../../utils/socket";
import ChatBox from "../ChatBox";
import ProjectCard from "../ProjectCard";

export default function ChatsPanel({ user }) {
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    fetchProjects();
    socket.auth = { token: user?.token };
    if (!socket.connected) socket.connect();
    return () => socket.disconnect();
  }, []);

  const fetchProjects = async () => {
    const res = await axios.get("/projects");
    setProjects(res.data);
  };

  const handleSelectProject = (p) => {
    setSelectedProject(p);
    socket.emit("joinProject", p._id);
  };

  return (
    <div className="flex h-[70vh] bg-white rounded-lg shadow-md overflow-hidden">
      {/* Sidebar */}
      <div className="w-1/4 border-r p-4 overflow-y-auto">
        <h4 className="font-semibold mb-3">Projects</h4>
        {projects.map((p) => (
          <div
            key={p._id}
            className={`mb-2 cursor-pointer ${
              selectedProject?._id === p._id
                ? "ring-2 ring-blue-500 rounded"
                : "hover:bg-gray-50"
            }`}
            onClick={() => handleSelectProject(p)}
          >
            <ProjectCard project={p} />
          </div>
        ))}
      </div>

      {/* Chat area */}
      <div className="flex-1 p-4">
        {selectedProject ? (
          <ChatBox user={user} project={selectedProject} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            Select a project to chat
          </div>
        )}
      </div>
    </div>
  );
}
