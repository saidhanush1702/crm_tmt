const ProjectCard = ({ project, onClick }) => {
  return (
    <div
      onClick={() => onClick && onClick(project)}
      className="border bg-white rounded-lg p-4 shadow-sm hover:shadow-md transition cursor-pointer"
    >
      <h3 className="font-bold text-lg text-gray-800">{project.name}</h3>
      <p className="text-sm text-gray-600 mb-2">{project.description}</p>
      {project.members && (
        <p className="text-xs text-gray-500">
          Members:{" "}
          {project.members.length > 0
            ? project.members.map((m) => m.name).join(", ")
            : "No members yet"}
        </p>
      )}
    </div>
  );
};

export default ProjectCard;
