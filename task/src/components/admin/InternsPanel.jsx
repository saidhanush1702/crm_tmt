import { useState, useEffect } from "react";
import axios from "../../utils/axiosInstance"; // Assuming this path is correct
import { Loader2, UserPlus, Users } from "lucide-react";

/**
 * @component LoadingSpinner
 * A simple centered loading spinner.
 */
const LoadingSpinner = () => (
    <div className="flex justify-center items-center py-10">
        <Loader2 size={28} className="animate-spin text-blue-600" />
    </div>
);

/**
 * @component InternsPanel
 * A panel for managing and creating intern accounts.
 */
export default function InternsPanel() {
    const [interns, setInterns] = useState([]);
    const [loadingList, setLoadingList] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [newIntern, setNewIntern] = useState({ name: "", email: "", password: "" });

    useEffect(() => {
        fetchInterns();
    }, []);

    const fetchInterns = async () => {
        setLoadingList(true);
        try {
            const res = await axios.get("/users");
            setInterns(res.data.filter((u) => u.role === "intern"));
        } catch (err) {
            console.error("Failed to fetch interns:", err);
            // In a real app, show a toast notification
        } finally {
            setLoadingList(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await axios.post("/auth/register-intern", newIntern);
            setNewIntern({ name: "", email: "", password: "" }); // Reset form
            fetchInterns(); // Refresh the list
            // Success alert removed for cleaner UX; the list refresh is feedback
        } catch (err) {
            console.error("Failed to create intern:", err);
            alert(err.response?.data?.msg || "Failed to create intern");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        // Use a grid for the main layout, matching the user's original structure
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* --- Card 1: Create New Intern --- */}
            <div className="lg:col-span-1 bg-white p-6 sm:p-8 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                    <UserPlus className="text-blue-600" size={24} />
                    <h3 className="text-xl font-semibold text-gray-900">
                        Create New Intern
                    </h3>
                </div>
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label 
                            htmlFor="name" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            required
                            value={newIntern.name}
                            onChange={(e) => setNewIntern({ ...newIntern, name: e.target.value })}
                            placeholder="e.g. John Doe"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                    </div>
                    <div>
                         <label 
                            htmlFor="email" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={newIntern.email}
                            onChange={(e) => setNewIntern({ ...newIntern, email: e.target.value })}
                            placeholder="john.doe@example.com"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                    </div>
                     <div>
                         <label 
                            htmlFor="password" 
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={newIntern.password}
                            onChange={(e) => setNewIntern({ ...newIntern, password: e.target.value })}
                            placeholder="Min. 8 characters"
                            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        disabled={isCreating}
                        className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed mt-4"
                    >
                        {isCreating ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <UserPlus size={18} />
                        )}
                        <span>{isCreating ? "Creating..." : "Create Intern"}</span>
                    </button>
                </form>
            </div>

            {/* --- Card 2: All Interns List --- */}
            <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-xl shadow-lg transition-shadow duration-300 hover:shadow-xl">
                 <div className="flex items-center gap-3 mb-6">
                    <Users className="text-gray-700" size={24} />
                    <h3 className="text-xl font-semibold text-gray-900">
                        All Interns ({interns.length})
                    </h3>
                </div>
                
                {loadingList ? (
                    <LoadingSpinner />
                ) : (
                    <div className="flow-root">
                        <ul role="list" className="-my-4 divide-y divide-gray-200">
                            {interns.length > 0 ? (
                                interns.map((intern) => (
                                    <li key={intern._id} className="flex items-center justify-between py-4">
                                        <div className="flex items-center space-x-4">
                                            {/* Avatar placeholder */}
                                            <div className="w-10 h-10 rounded-full bg-slate-200 shrink-0 flex items-center justify-center font-semibold text-slate-600">
                                                {intern.name?.[0]?.toUpperCase() || 'I'}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-gray-800 truncate">
                                                    {intern.name}
                                                </p>
                                                <p className="text-sm text-gray-500 truncate">
                                                    {intern.email}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-sm font-medium text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                                            {intern.assignedProjects?.length || 0} Projects
                                        </div>
                                    </li>
                                ))
                            ) : (
                                <p className="text-gray-500 text-center py-10">
                                    No interns found.
                                </p>
                            )}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}