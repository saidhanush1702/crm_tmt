import React, { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import InternsPanel from "../components/admin/InternsPanel";
import ProjectsPanel from "../components/admin/ProjectsPanel";
import ChatsPanel from "../components/admin/ChatsPanel";
import { Menu, X } from "lucide-react"; // icons for mobile nav

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("interns");
  const [menuOpen, setMenuOpen] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false); // auto close on mobile
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white shadow sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Logo + Nav */}
            <div className="flex items-center gap-4">
              <div className="text-lg sm:text-xl font-bold text-gray-800 whitespace-nowrap">
                Task Manager — Admin
              </div>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-2">
                <TabBtn active={activeTab === "interns"} onClick={() => handleTabChange("interns")}>
                  Interns
                </TabBtn>
                <TabBtn active={activeTab === "projects"} onClick={() => handleTabChange("projects")}>
                  Projects
                </TabBtn>
                <TabBtn active={activeTab === "chats"} onClick={() => handleTabChange("chats")}>
                  Chats
                </TabBtn>
              </nav>
            </div>

            {/* Right: User + Logout */}
            <div className="flex items-center gap-3">
              <span className="hidden sm:block text-sm text-gray-700 truncate max-w-[100px]">
                {user?.name}
              </span>
              <button
                onClick={logout}
                className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
              >
                Logout
              </button>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden text-gray-700 focus:outline-none"
              >
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden bg-gray-100 border-t border-gray-200 flex flex-col items-start px-4 py-2 space-y-2 animate-slideDown">
            <TabBtn active={activeTab === "interns"} onClick={() => handleTabChange("interns")}>
              Interns
            </TabBtn>
            <TabBtn active={activeTab === "projects"} onClick={() => handleTabChange("projects")}>
              Projects
            </TabBtn>
            <TabBtn active={activeTab === "chats"} onClick={() => handleTabChange("chats")}>
              Chats
            </TabBtn>
          </div>
        )}
      </header>

      {/* Main Tabs */}
      <main className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 w-full overflow-y-auto">
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
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition w-full md:w-auto text-left ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "text-gray-700 hover:bg-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
