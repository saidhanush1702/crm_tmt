import { useState, useEffect, useContext } from "react";
import axios from "../utils/axiosInstance";
import socket from "../utils/socket";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ChatBox from "../components/ChatBox";
import ProjectCard from "../components/ProjectCard";

const InternDashboard = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);

  // Fetch intern's assigned projects
  const fetchProjects = async () => {
    try {
      const res = await axios.get("/projects");
      setProjects(res.data);
    } catch (err) {
      console.error("Error fetching projects:", err);
    }
  };

  useEffect(() => {
    fetchProjects();

    // Connect socket with auth token
    socket.auth = { token: user.token };
    socket.connect();

    return () => {
      socket.disconnect();
    };
  }, []);

  // When a project is selected, join its chat room
  const handleSelectProject = (project) => {
    setSelectedProject(project);
    socket.emit("joinProject", project._id);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Top Navbar */}
      <Navbar title="Intern Dashboard" />

      <div className="flex flex-1">
        {/* Sidebar: Project List */}
        <div className="w-1/4 bg-white border-r shadow-md p-4 overflow-y-auto">
          <h2 className="text-xl font-bold text-gray-800 mb-3">My Projects</h2>
          {projects.length === 0 && (
            <p className="text-gray-500 text-sm text-center mt-10">
              No assigned projects yet.
            </p>
          )}

          {projects.map((p) => (
            <div
              key={p._id}
              className={`mb-3 ${
                selectedProject?._id === p._id
                  ? "ring-2 ring-blue-500 rounded-md"
                  : ""
              }`}
            >
              <ProjectCard project={p} onClick={handleSelectProject} />
            </div>
          ))}
        </div>

        {/* Main Chat Section */}
        <div className="flex-1 flex flex-col">
          {selectedProject ? (
            <ChatBox user={user} project={selectedProject} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a project to start chatting.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InternDashboard;
