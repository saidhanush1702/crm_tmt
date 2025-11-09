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
    <div className="flex flex-col lg:flex-row bg-gradient-to-b from-gray-50 to-gray-100 rounded-2xl shadow-lg border overflow-hidden h-[80vh] max-h-[80vh]">
      {/* Sidebar */}
      <div className="lg:w-1/3 xl:w-1/4 bg-white border-r p-4 overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-between">
          Projects
          <span className="text-sm text-gray-500 font-normal">
            {projects.length}
          </span>
        </h3>

        {projects.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-10">
            No projects available
          </p>
        ) : (
          <div className="space-y-3">
            {projects.map((p) => (
              <div
                key={p._id}
                className={`transition-transform ${
                  selectedProject?._id === p._id
                    ? "scale-[1.02]"
                    : "hover:scale-[1.01]"
                }`}
                onClick={() => handleSelectProject(p)}
              >
                <ProjectCard
                  project={p}
                  onClick={handleSelectProject}
                  unread={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white p-4 rounded-tr-2xl rounded-br-2xl flex flex-col shadow-inner">
        {selectedProject ? (
          <ChatBox user={user} project={selectedProject} />
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 text-gray-500">
            <img
              src="https://cdn-icons-png.flaticon.com/512/4712/4712105.png"
              alt="Chat illustration"
              className="w-24 h-24 mb-4 opacity-60"
            />
            <p className="text-base">Select a project to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
