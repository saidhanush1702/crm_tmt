import { useState, useEffect, useContext } from "react";
import axios from "../utils/axiosInstance";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import ProjectCard from "../components/ProjectCard";
// (Optional: For future admin chat viewing)
// import ChatBox from "../components/ChatBox";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [interns, setInterns] = useState([]);
  const [projects, setProjects] = useState([]);
  const [newIntern, setNewIntern] = useState({ name: "", email: "", password: "" });
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [assignData, setAssignData] = useState({ projectId: "", memberIds: [] });

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

  // Assign members
  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      await axios.put("/projects/assign", assignData);
      alert("✅ Members assigned successfully!");
      setAssignData({ projectId: "", memberIds: [] });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.msg || "Assignment failed");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Navbar */}
      <Navbar title="Admin Dashboard" />

      {/* Page content */}
      <div className="p-6 space-y-6">
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
          <h2 className="text-xl font-semibold mb-2">Assign Interns to Project</h2>
          <form onSubmit={handleAssign} className="grid grid-cols-3 gap-2">
            <select
              className="border p-2 rounded"
              value={assignData.projectId}
              onChange={(e) =>
                setAssignData({ ...assignData, projectId: e.target.value })
              }
            >
              <option value="">Select Project</option>
              {projects.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name}
                </option>
              ))}
            </select>

            <select
              multiple
              className="border p-2 rounded h-24"
              value={assignData.memberIds}
              onChange={(e) =>
                setAssignData({
                  ...assignData,
                  memberIds: Array.from(e.target.selectedOptions, (opt) => opt.value),
                })
              }
            >
              {interns.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600"
            >
              Assign Members
            </button>
          </form>
        </div>

        {/* Section 4 - All Projects */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">All Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((p) => (
              <ProjectCard key={p._id} project={p} />
            ))}
          </div>
        </div>

        {/* (Optional future section)
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Project Chat (coming soon)</h2>
          <ChatBox user={user} project={selectedProject} />
        </div>
        */}
      </div>
    </div>
  );
};

export default AdminDashboard;
