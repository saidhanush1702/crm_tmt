import { Users, FolderKanban } from "lucide-react";

const ProjectCard = ({ project, onClick, unread }) => {
  // Get project initials for avatar
  const initials = project.name ? project.name.charAt(0).toUpperCase() : "?";

  return (
    <div
      onClick={() => onClick && onClick(project)}
      className={`relative group flex items-start gap-3 border rounded-xl p-4 cursor-pointer transition-all duration-300 
        bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 hover:shadow-lg 
        ${unread ? "border-blue-500" : "border-gray-200"}
      `}
    >
      {/* Gradient Accent Bar */}
      <div
        className={`absolute left-0 top-0 h-full w-1 rounded-l-xl transition-all duration-300 ${
          unread ? "bg-blue-500" : "bg-gray-300 group-hover:bg-blue-400"
        }`}
      ></div>

      {/* Project Icon */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white flex items-center justify-center text-lg font-semibold shadow-md">
          {initials}
        </div>
      </div>

      {/* Project Info */}
      <div className="flex-1">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-gray-900 text-base group-hover:text-blue-600 transition">
            {project.name}
          </h3>
          {unread && (
            <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse mr-1"></span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
          {project.description || "No description available"}
        </p>

        {/* Members */}
        {project.members && project.members.length > 0 ? (
          <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
            <Users size={14} className="text-gray-400" />
            <span>
              {project.members.length} member
              {project.members.length > 1 ? "s" : ""}
            </span>
          </div>
        ) : (
          <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <Users size={14} /> No members yet
          </p>
        )}
      </div>

      {/* Subtle Folder Icon */}
      <div className="absolute bottom-2 right-3 opacity-20 group-hover:opacity-40 transition">
        <FolderKanban size={20} />
      </div>
    </div>
  );
};

export default ProjectCard;
