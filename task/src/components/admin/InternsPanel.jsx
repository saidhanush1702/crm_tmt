import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";

export default function InternsPanel() {
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [newIntern, setNewIntern] = useState({ name: "", email: "", password: "" });

  useEffect(() => {
    fetchInterns();
  }, []);

  const fetchInterns = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/users");
      setInterns(res.data.filter((u) => u.role === "intern"));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await axios.post("/auth/register-intern", newIntern);
      setNewIntern({ name: "", email: "", password: "" });
      fetchInterns();
      alert("Intern created");
    } catch (err) {
      alert(err.response?.data?.msg || "Failed to create intern");
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
        <h3 className="text-lg font-semibold">Interns</h3>
        <div className="text-sm text-gray-500">Manage interns — add, view</div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Add new intern */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-md">
          <h4 className="font-semibold mb-2">Create New Intern</h4>
          <form onSubmit={handleCreate} className="space-y-2">
            <input required value={newIntern.name} onChange={(e) => setNewIntern({ ...newIntern, name: e.target.value })} placeholder="Name" className="w-full border p-2 rounded" />
            <input required value={newIntern.email} onChange={(e) => setNewIntern({ ...newIntern, email: e.target.value })} placeholder="Email" className="w-full border p-2 rounded" />
            <input required value={newIntern.password} onChange={(e) => setNewIntern({ ...newIntern, password: e.target.value })} placeholder="Password" type="password" className="w-full border p-2 rounded" />
            <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded">Create Intern</button>
          </form>
        </div>

        {/* All interns */}
        <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow-md">
          <h4 className="font-semibold mb-4">All Interns</h4>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="space-y-2">
              {interns.map((i) => (
                <div key={i._id} className="flex items-center justify-between border p-2 rounded">
                  <div>
                    <div className="font-medium">{i.name}</div>
                    <div className="text-xs text-gray-500">{i.email}</div>
                  </div>
                  <div className="text-sm text-gray-500">Assigned: {i.assignedProjects?.length || 0}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
