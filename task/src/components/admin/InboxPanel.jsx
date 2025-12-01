import React, { useEffect, useState } from "react";
import { Trash2, CheckCircle, FileText, Loader2, User, Mail, Smartphone, Building2, Calendar, BookOpen, Briefcase } from "lucide-react";

export default function InboxPanel() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("all"); // all | selected

  // 🔹 Fetch applications from backend
  const fetchInbox = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/intern-apply/all");
      const data = await res.json();
      // Simulate network delay for better loading state visibility (optional, remove in production)
      // await new Promise(resolve => setTimeout(resolve, 500)); 
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

  // 🔹 Move Forward (Selected)
  const moveForward = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/intern-apply/forward/${id}`, {
        method: "PATCH",
      });

      if (res.ok) {
        setApplications((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, movedForward: true } : item
          )
        );
      }
    } catch (error) {
      console.error("Move forward error:", error);
    }
  };

  useEffect(() => {
    fetchInbox();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="animate-spin text-blue-500 mr-2" size={24} />
        <p className="text-xl font-medium text-gray-600">Loading applications...</p>
      </div>
    );
  }

  // Filter based on tab
  const filteredApps =
    tab === "all"
      ? applications
      : applications.filter((app) => app.movedForward);

  // Helper component for applicant info
  const ApplicantInfo = ({ icon: Icon, label, value }) => (
    <div className="flex items-center text-sm text-gray-700">
      <Icon size={16} className="text-blue-500 mr-2 flex-shrink-0" />
      <span className="font-medium mr-1">{label}:</span>
      <span className="truncate">{value}</span>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-2">
        📥 Internship Applications
      </h2>

      {/* 🔹 Tabs */}
      <div className="flex flex-wrap gap-3 mb-8">
        <button
          onClick={() => setTab("all")}
          className={`px-5 py-2 rounded-full text-sm transition duration-300 ease-in-out shadow-md ${
            tab === "all"
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          All Applications ({applications.length})
        </button>

        <button
          onClick={() => setTab("selected")}
          className={`px-5 py-2 rounded-full text-sm transition duration-300 ease-in-out shadow-md ${
            tab === "selected"
              ? "bg-teal-600 text-white hover:bg-teal-700"
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-100"
          }`}
        >
          Selected Applications ({applications.filter(app => app.movedForward).length})
        </button>
      </div>

      {filteredApps.length === 0 && (
        <div className="py-12 bg-gray-50 rounded-xl shadow-inner border border-dashed border-gray-300">
          <p className="text-xl text-gray-500 text-center font-medium">
            {tab === "all"
              ? "No applications available in the inbox."
              : "No applicants have been selected yet."}
          </p>
        </div>
      )}

      {/* Applications Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredApps.map((item) => (
          <div
            key={item._id}
            className={`p-6 rounded-2xl shadow-xl transition-all duration-300 ease-in-out hover:shadow-2xl ${
              item.movedForward
                ? "bg-white border-t-4 border-teal-500"
                : "bg-white border-t-4 border-indigo-500"
            }`}
          >
            {/* Title/Header */}
            <div className="flex justify-between items-start mb-4 border-b pb-3">
              <h3 className="text-2xl font-bold text-gray-900">
                <User size={20} className="inline-block mr-2 text-gray-500" />
                {item.fullName}
              </h3>
              {item.movedForward && (
                <span className="inline-flex items-center rounded-full bg-teal-100 px-3 py-0.5 text-sm font-medium text-teal-800">
                  <CheckCircle size={14} className="mr-1" /> Selected
                </span>
              )}
            </div>

            {/* Applicant Details */}
            <div className="space-y-2">
              <ApplicantInfo icon={Mail} label="Email" value={item.email} />
              <ApplicantInfo icon={Smartphone} label="Mobile" value={item.mobile} />
              <ApplicantInfo icon={Building2} label="College" value={item.college} />
              <ApplicantInfo icon={Calendar} label="Year" value={item.year} />
              <ApplicantInfo icon={BookOpen} label="Branch" value={item.branch} />
              <ApplicantInfo icon={Briefcase} label="Role" value={item.role} />
            </div>

            {/* About Section */}
            <div className="mt-4">
              <p className="font-semibold text-gray-800 mb-1">About Applicant:</p>
              <p className="text-sm text-gray-700 h-20 overflow-y-auto bg-gray-50 p-3 rounded-lg border border-gray-200 shadow-inner">
                {item.about}
              </p>
            </div>

            {/* Resume Button */}
            <div className="mt-5">
              <a
                href={item.resumeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-full px-4 py-2 text-blue-600 bg-blue-100 rounded-lg font-semibold hover:bg-blue-200 transition duration-150 text-sm shadow-md"
              >
                <FileText size={18} className="mr-2" />
                View Resume
              </a>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-5 border-t pt-4">
              {!item.movedForward && (
                <button
                  onClick={() => moveForward(item._id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white font-medium hover:bg-green-600 transition duration-150 text-sm shadow-md"
                >
                  <CheckCircle size={16} /> Move Forward
                </button>
              )}

              <button
                onClick={() => deleteApplication(item._id)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition duration-150 text-sm shadow-md"
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