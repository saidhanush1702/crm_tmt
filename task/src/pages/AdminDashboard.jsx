import { useState, useEffect, useContext } from "react";
import axios from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
import ChatBox from "../components/ChatBox";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [interns, setInterns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newIntern, setNewIntern] = useState({ name: "", email: "", password: "" });
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [assignData, setAssignData] = useState({ projectId: "", memberIds: [] });
  const [selectedProject, setSelectedProject] = useState(null); // 👈 new state for chat selection

  // Fetch all projects and interns
  const fetchData = async () => {
    try {
      const [projRes, userRes] = await Promise.all([
        axios.get("/projects"),
        axios.get("/users"),
      ]);
      setProjects(projRes.data);
      setInterns(userRes.data.filter((u) => u.role === "intern"));
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Create new intern
  const handleAddIntern = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register-intern", newIntern);
      alert("✅ Intern created successfully!");
      setNewIntern({ name: "", email: "", password: "" });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create intern");
    }
  };

  // Create new project
  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/projects", newProject);
      alert("✅ Project created!");
      setNewProject({ name: "", description: "" });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create project");
    }
  };

  // Handle project selection for checkbox assignment
  const handleProjectSelect = (projectId) => {
    const selected = projects.find((p) => p._id === projectId);
    const memberIds = selected ? selected.members.map((m) => m._id) : [];
    setAssignData({ projectId, memberIds });
  };

  // Toggle intern checkbox
  const handleCheckboxChange = (internId) => {
    setAssignData((prev) => {
      const isSelected = prev.memberIds.includes(internId);
      const updatedIds = isSelected
        ? prev.memberIds.filter((id) => id !== internId)
        : [...prev.memberIds, internId];
      return { ...prev, memberIds: updatedIds };
    });
  };

  // Assign members to project
  const handleAssign = async (e) => {
    e.preventDefault();
    if (!assignData.projectId) return alert("Please select a project first");
    try {
      await axios.put("/projects/assign", assignData);
      alert("✅ Members updated successfully!");
      setAssignData({ projectId: "", memberIds: [] });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || "Assignment failed");
    }
  };

  // 👇 Handle project click for chat (only if admin is a member)
  const handleProjectClick = (project) => {
    const isAdminMember = project.members.some((m) => m._id === user.id);
    if (isAdminMember) {
      setSelectedProject(project);
    } else {
      alert("You are not a member of this project. Join to view chat.");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      {/* Navbar */}
      <Navbar title="Admin Dashboard" />

      {/* Page content */}
      <div className="p-6 flex-1 overflow-y-auto space-y-6">
        {/* Section 1 - Add Intern */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Add New Intern</h2>
          <form onSubmit={handleAddIntern} className="grid grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Name"
              className="border p-2 rounded"
              value={newIntern.name}
              onChange={(e) => setNewIntern({ ...newIntern, name: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              className="border p-2 rounded"
              value={newIntern.email}
              onChange={(e) => setNewIntern({ ...newIntern, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              className="border p-2 rounded"
              value={newIntern.password}
              onChange={(e) => setNewIntern({ ...newIntern, password: e.target.value })}
            />
            <button
              type="submit"
              className="col-span-3 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            >
              Add Intern
            </button>
          </form>
        </div>

        {/* Section 2 - Create Project */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Create New Project</h2>
          <form onSubmit={handleCreateProject} className="grid grid-cols-2 gap-2">
            <input
              type="text"
              placeholder="Project Name"
              className="border p-2 rounded"
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Description"
              className="border p-2 rounded"
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
            />
            <button
              type="submit"
              className="col-span-2 bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Create Project
            </button>
          </form>
        </div>

        {/* Section 3 - Assign Members */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Assign Interns to Project</h2>

          <div className="mb-4">
            <select
              className="border p-2 rounded w-full"
              value={assignData.projectId}
              onChange={(e) => handleProjectSelect(e.target.value)}
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {assignData.projectId && (
            <form onSubmit={handleAssign}>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                {interns.map((intern) => (
                  <label
                    key={intern._id}
                    className="flex items-center gap-2 border p-2 rounded cursor-pointer hover:bg-gray-50"
                  >
                    <input
                      type="checkbox"
                      checked={assignData.memberIds.includes(intern._id)}
                      onChange={() => handleCheckboxChange(intern._id)}
                    />
                    <span>{intern.name}</span>
                  </label>
                ))}
              </div>
              <button
                type="submit"
                className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
              >
                Save Changes
              </button>
            </form>
          )}
        </div>

        {/* Section 4 - All Projects */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">All Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <div key={p._id} onClick={() => handleProjectClick(p)}>
                <ProjectCard project={p} />
              </div>
            ))}
          </div>
        </div>

        {/* Section 5 - ChatBox for Selected Project */}
        {selectedProject && (
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">
              Chat: {selectedProject.name}
            </h2>
            <ChatBox user={user} project={selectedProject} />
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
