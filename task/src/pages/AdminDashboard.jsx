import React, { useState, useContext } from "react";
import { Menu, X, Users, FolderKanban, MessageSquare, LogOut } from "lucide-react";
import { AuthContext } from "../context/AuthContext"; // ✅ use your real auth context
import InternsPanel from "../components/admin/InternsPanel.jsx";
import ProjectsPanel from "../components/admin/ProjectsPanel.jsx";
import ChatsPanel from "../components/admin/ChatsPanel.jsx";



/**
 * @component NavLink
 * A reusable sidebar navigation button.
 */
function NavLink({ children, icon: Icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${active
          ? "bg-blue-600 text-white shadow-lg"
          : "text-slate-300 hover:bg-slate-700 hover:text-white transform hover:translate-x-1"
        }`}
    >
      <Icon size={18} className="mr-3 shrink-0" />
      <span className="truncate">{children}</span>
    </button>
  );
}

/**
 * @component AdminDashboard
 * Main admin layout using real authentication context.
 */
export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext); // ✅ now using real backend user
  const [activeTab, setActiveTab] = useState("interns");
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ fallback if user data is missing temporarily
  const currentUser = {
    _id: user?._id || "690e23bad4dc5bbe84e9e44d", // ✅ always fallback to real admin id
    name: user?.name || "Main Admin",
    email: user?.email || "admin@example.com",
    token: user?.token || "admin-token-123",
    role: user?.role || "admin",
  };


  const tabs = [
    { id: "interns", label: "Interns", icon: Users },
    { id: "projects", label: "Projects", icon: FolderKanban },
    { id: "chats", label: "Chats", icon: MessageSquare },
  ];

  const getTabTitle = () =>
    tabs.find((tab) => tab.id === activeTab)?.label || "Dashboard";

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">
      {/* Overlay for mobile menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900 text-white p-4 flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 border-b border-slate-700 pb-4">
          <span className="text-xl font-bold text-white whitespace-nowrap">
            Task Manager
          </span>
          <button
            onClick={() => setMenuOpen(false)}
            className="md:hidden text-slate-300 hover:text-white"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 mt-6 space-y-2">
          {tabs.map((tab) => (
            <NavLink
              key={tab.id}
              icon={tab.icon}
              active={activeTab === tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMenuOpen(false);
              }}
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="mt-auto border-t border-slate-700 pt-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-semibold">
              {user?.name?.[0]?.toUpperCase() || "A"}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-100 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-slate-400 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center justify-center w-full px-4 py-2.5 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors duration-200"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Topbar */}
        <header className="sticky top-0 z-10 bg-white shadow-sm h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setMenuOpen(true)}
            className="md:hidden text-gray-700"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2 md:ml-0">
            {getTabTitle()}
          </h1>
          <div className="w-8 md:hidden"></div>
        </header>

        {/* Panels */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {activeTab === "interns" && <InternsPanel />}
          {activeTab === "projects" && <ProjectsPanel />}
          {activeTab === "chats" && <ChatsPanel user={user} />}
        </main>
      </div>
    </div>
  );
}
