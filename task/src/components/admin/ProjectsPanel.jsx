import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";

export default function ProjectsPanel() {
  const [projects, setProjects] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newProject, setNewProject] = useState({ name: "", description: "" });
  const [editProject, setEditProject] = useState(null);
  const [assignIds, setAssignIds] = useState([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, uRes] = await Promise.all([
        axios.get("/projects"),
        axios.get("/users"),
      ]);
      setProjects(pRes.data);
      setInterns(uRes.data.filter((u) => u.role === "intern"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/projects", newProject);
      setNewProject({ name: "", description: "" });
      fetchAll();
      alert("✅ Project created");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create project");
    }
  };

  const openEdit = (project) => {
    setEditProject(project);
    setAssignIds(project.members.map((m) => m._id));
  };

  const toggleAssign = (id) => {
    setAssignIds((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const saveAssign = async () => {
    try {
      await axios.put("/projects/assign", {
        projectId: editProject._id,
        memberIds: assignIds,
      });
      alert("✅ Members updated");
      setEditProject(null);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to update members");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
        <h3 className="text-lg font-semibold">Projects</h3>
        <div className="text-sm text-gray-500">
          Create and manage projects easily
        </div>
      </div>

      {/* 3-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[75vh]">
        {/* ✅ Left Column - Create Project */}
        <div className="bg-white p-4 rounded-lg shadow-md h-full">
          <h4 className="font-semibold mb-2">Create New Project</h4>
          <form onSubmit={handleCreateProject} className="space-y-2">
            <input
              required
              value={newProject.name}
              onChange={(e) =>
                setNewProject({ ...newProject, name: e.target.value })
              }
              placeholder="Project name"
              className="w-full border p-2 rounded"
            />
            <input
              value={newProject.description}
              onChange={(e) =>
                setNewProject({ ...newProject, description: e.target.value })
              }
              placeholder="Description"
              className="w-full border p-2 rounded"
            />
            <button
              type="submit"
              className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            >
              Create Project
            </button>
          </form>
        </div>

        {/* ✅ Middle Column - Scrollable All Projects List */}
        <div className="bg-white p-4 rounded-lg shadow-md overflow-y-auto h-full">
          <h4 className="font-semibold mb-4">All Projects</h4>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {projects.map((p) => (
                <div
                  key={p._id}
                  className={`border p-3 rounded cursor-pointer transition ${
                    editProject?._id === p._id
                      ? "ring-2 ring-blue-500"
                      : "hover:bg-gray-50"
                  }`}
                  onClick={() => openEdit(p)}
                >
                  <div className="font-semibold text-gray-800">{p.name}</div>
                  <div className="text-sm text-gray-600">{p.description}</div>
                  <div className="text-xs text-gray-500 mt-2">
                    Members: {p.members.length}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ✅ Right Column - Edit Members */}
        <div className="bg-white p-4 rounded-lg shadow-md h-full overflow-y-auto">
          {editProject ? (
            <>
              <h5 className="font-semibold mb-3">
                Edit Members for: {editProject.name}
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[50vh] overflow-y-auto">
                {interns.map((i) => (
                  <label
                    key={i._id}
                    className="flex items-center gap-2 border p-2 rounded cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={assignIds.includes(i._id)}
                      onChange={() => toggleAssign(i._id)}
                    />
                    <div>
                      <div className="font-medium">{i.name}</div>
                      <div className="text-xs text-gray-500">{i.email}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={saveAssign}
                  className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditProject(null)}
                  className="bg-gray-300 px-3 py-1 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div className="text-gray-500 text-sm h-full flex items-center justify-center">
              Select a project to edit members
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
