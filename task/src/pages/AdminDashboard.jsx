import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import InternsPanel from "../components/admin/InternsPanel";
import ProjectsPanel from "../components/admin/ProjectsPanel";
import ChatsPanel from "../components/admin/ChatsPanel";

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("interns");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-6">
              <div className="text-xl font-bold text-gray-800">
                Task Manager — Admin
              </div>
              <nav className="flex items-center gap-2">
                <TabBtn active={activeTab === "interns"} onClick={() => setActiveTab("interns")}>
                  Interns
                </TabBtn>
                <TabBtn active={activeTab === "projects"} onClick={() => setActiveTab("projects")}>
                  Projects
                </TabBtn>
                <TabBtn active={activeTab === "chats"} onClick={() => setActiveTab("chats")}>
                  Chats
                </TabBtn>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-700">{user?.name}</div>
              <button
                onClick={logout}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Tabs */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "interns" && <InternsPanel />}
        {activeTab === "projects" && <ProjectsPanel />}
        {activeTab === "chats" && <ChatsPanel user={user} />}
      </main>
    </div>
  );
}

function TabBtn({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-md text-sm font-medium transition ${
        active ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
      }`}
    >
      {children}
    </button>
  );
}
