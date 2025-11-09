import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance";
import { 
    Loader2, 
    FolderPlus, 
    FolderKanban, 
    Users, 
    Check, 
    X, 
    Search
} from "lucide-react";

/**
 * @component LoadingSpinner
 */
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full py-10">
        <Loader2 size={28} className="animate-spin text-blue-600" />
    </div>
);

/**
 * @component AssignMembersModal
 */
function AssignMembersModal({ project, interns, assignIds, onToggle, onSave, onClose, isSaving }) {
    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-xl shadow-lg w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 sm:p-8 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                        <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                                Assign Interns
                            </h3>
                            <p className="text-sm text-gray-600">
                                For project: <span className="font-medium text-blue-600">{project.name}</span>
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Intern List */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-3">
                    {interns.length > 0 ? interns.map((i) => (
                        <label
                            key={i._id}
                            htmlFor={`modal-${i._id}`}
                            className={`flex items-center gap-3 p-3 rounded-lg transition-colors border cursor-pointer ${
                                assignIds.includes(i._id)
                                    ? "bg-blue-50 border-blue-300"
                                    : "bg-white hover:bg-gray-100 border-gray-200"
                            }`}
                        >
                            <input
                                id={`modal-${i._id}`}
                                type="checkbox"
                                className="h-4 w-4 rounded text-blue-600 border-gray-300 focus:ring-blue-500"
                                checked={assignIds.includes(i._id)}
                                onChange={() => onToggle(i._id)}
                            />
                            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-slate-600 text-xs">
                                {i.name?.[0]?.toUpperCase() || 'I'}
                            </div>
                            <div className="min-w-0">
                                <div className="font-medium text-sm text-gray-800 truncate">{i.name}</div>
                                <div className="text-xs text-gray-500 truncate">{i.email}</div>
                            </div>
                        </label>
                    )) : (
                        <p className="text-gray-500 text-center p-10">No interns available to assign.</p>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 sm:p-8 border-t border-gray-200 bg-gray-50">
                    <div className="flex gap-3 justify-end">
                        <button
                            onClick={onClose}
                            className="flex justify-center items-center gap-2 bg-gray-200 text-gray-800 px-5 py-2.5 rounded-lg font-medium hover:bg-gray-300 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                        >
                            <X size={18} />
                            <span>Cancel</span>
                        </button>
                        <button
                            onClick={onSave}
                            disabled={isSaving}
                            className="flex justify-center items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-400 disabled:cursor-not-allowed"
                        >
                            {isSaving ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <Check size={18} />
                            )}
                            <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * @component ProjectsPanel
 */
export default function ProjectsPanel() {
    const [projects, setProjects] = useState([]);
    const [interns, setInterns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newProject, setNewProject] = useState({ name: "", description: "" });
    const [editProject, setEditProject] = useState(null);
    const [assignIds, setAssignIds] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState(""); // ✅ Added search state

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
        setIsCreating(true);
        try {
            await axios.post("/projects", newProject);
            setNewProject({ name: "", description: "" });
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to create project");
        } finally {
            setIsCreating(false);
        }
    };

    const handleOpenModal = (project) => {
        setEditProject(project);
        setAssignIds(project.members.map((m) => m._id));
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditProject(null);
        setAssignIds([]);
    };

    const toggleAssign = (id) => {
        setAssignIds((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );
    };

    const saveAssign = async () => {
        if (!editProject) return;
        setIsSaving(true);
        try {
            await axios.put("/projects/assign", {
                projectId: editProject._id,
                memberIds: assignIds,
            });
            handleCloseModal();
            fetchAll();
        } catch (err) {
            alert(err.response?.data?.msg || "Failed to update members");
        } finally {
            setIsSaving(false);
        }
    };

    // ✅ Filter projects based on searchTerm
    const filteredProjects = projects.filter(
        (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8">
            {/* Create Project */}
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                    <FolderPlus className="text-green-600" size={24} />
                    <h3 className="text-xl font-semibold text-gray-900">
                        Create New Project
                    </h3>
                </div>

                <form onSubmit={handleCreateProject} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                        <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                            Project Name
                        </label>
                        <input
                            id="projectName"
                            required
                            value={newProject.name}
                            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                            placeholder="e.g. E-commerce Platform"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label htmlFor="projectDesc" className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <input
                            id="projectDesc"
                            value={newProject.description}
                            onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                            placeholder="Brief project description..."
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="md:col-span-3 flex justify-center items-center gap-2 bg-green-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-green-700 transition-colors duration-200 disabled:bg-green-400"
                    >
                        {isCreating ? <Loader2 size={20} className="animate-spin" /> : <FolderPlus size={18} />}
                        <span>{isCreating ? "Creating..." : "Create Project"}</span>
                    </button>
                </form>
            </div>

            {/* All Projects */}
            <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                    <div className="flex items-center gap-3">
                        <FolderKanban className="text-gray-700" size={24} />
                        <h3 className="text-xl font-semibold text-gray-900">
                            All Projects ({filteredProjects.length})
                        </h3>
                    </div>

                    {/* ✅ Search Bar */}
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search projects..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredProjects.length > 0 ? (
                            filteredProjects.map((p) => (
                                <div 
                                    key={p._id} 
                                    className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col overflow-hidden"
                                >
                                    <div className="p-6 flex-1">
                                        <p className="font-semibold text-gray-800 text-lg">{p.name}</p>
                                        <p className="text-sm text-gray-600 mt-2 line-clamp-3 h-[60px]">
                                            {p.description || "No description provided."}
                                        </p>
                                    </div>
                                    <div className="p-6 bg-gray-50 border-t border-gray-200">
                                        <div className="text-sm font-medium text-gray-700 mb-3">
                                            {p.members.length} {p.members.length === 1 ? "Member" : "Members"}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2 overflow-hidden">
                                                {p.members.slice(0, 4).map(member => (
                                                    <div 
                                                        key={member._id}
                                                        title={member.name}
                                                        className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center font-semibold text-slate-600 text-xs"
                                                    >
                                                        {member.name?.[0]?.toUpperCase() || 'I'}
                                                    </div>
                                                ))}
                                                {p.members.length > 4 && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-700 border-2 border-white flex items-center justify-center font-medium text-white text-xs">
                                                        +{p.members.length - 4}
                                                    </div>
                                                )}
                                            </div>
                                            <button 
                                                onClick={() => handleOpenModal(p)}
                                                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800"
                                            >
                                                <Users size={16} />
                                                Manage
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center md:col-span-2 xl:col-span-3 py-10">
                                No matching projects found.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <AssignMembersModal
                    project={editProject}
                    interns={interns}
                    assignIds={assignIds}
                    onToggle={toggleAssign}
                    onSave={saveAssign}
                    onClose={handleCloseModal}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
}
