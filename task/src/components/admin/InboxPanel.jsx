import React, { useEffect, useState } from "react";
import { Trash2, CheckCircle, FileText } from "lucide-react";

export default function InboxPanel() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch applications from backend
  const fetchInbox = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/intern-apply/all");
      const data = await res.json();
      setApplications(data.items || []);
    } catch (error) {
      console.error("Failed to fetch inbox:", error);
    }
    setLoading(false);
  };

  // 🔹 Delete applicant (Not Suitable)
  const deleteApplication = async (id) => {
    if (!confirm("Are you sure? Applicant will be removed permanently.")) return;

    try {
      const res = await fetch(`http://localhost:5000/api/intern-apply/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setApplications((prev) => prev.filter((item) => item._id !== id));
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // 🔹 Mark as Read
  const markAsRead = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/intern-apply/read/${id}`, {
        method: "PATCH",
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, read: true } : item
          )
        );
      }
    } catch (error) {
      console.error("Read error:", error);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  if (loading) {
    return <p className="text-center text-lg text-gray-600">Loading inbox...</p>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Internship Applications</h2>

      {applications.length === 0 && (
        <p className="text-gray-500 text-center text-lg">
          No applications at the moment.
        </p>
      )}

      {/* 3 per row on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {applications.map((item) => (
          <div
            key={item._id}
            className={`p-6 rounded-xl shadow-lg border transition-all ${
              item.read ? "bg-white border-gray-300" : "bg-blue-50 border-blue-300"
            }`}
          >
            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {item.fullName}
            </h3>

            <p className="text-sm text-gray-600"><b>Email:</b> {item.email}</p>
            <p className="text-sm text-gray-600"><b>Mobile:</b> {item.mobile}</p>
            <p className="text-sm text-gray-600"><b>College:</b> {item.college}</p>
            <p className="text-sm text-gray-600"><b>Year:</b> {item.year}</p>
            <p className="text-sm text-gray-600"><b>Branch:</b> {item.branch}</p>
            <p className="text-sm text-gray-600"><b>Role:</b> {item.role}</p>

            {/* About */}
            <p className="text-sm text-gray-700 mt-3 h-20 overflow-y-auto bg-gray-100 p-2 rounded">
              {item.about}
            </p>

            {/* Resume Button */}
            <div className="mt-4">
              <a
                href={item.resumeUrl}
                target="_blank"
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-semibold"
              >
                <FileText size={18} />
                View Resume
              </a>
            </div>

            {/* Actions */}
            <div className="flex justify-between mt-5">
              {!item.read && (
                <button
                  onClick={() => markAsRead(item._id)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 text-sm"
                >
                  <CheckCircle size={16} /> Mark as Read
                </button>
              )}

              <button
                onClick={() => deleteApplication(item._id)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 text-sm"
              >
                <Trash2 size={16} /> Not Suitable
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
