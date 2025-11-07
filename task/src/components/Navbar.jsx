import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = ({ title }) => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="flex justify-between items-center bg-blue-600 text-white px-6 py-3 shadow-md">
      <h1 className="text-xl font-bold">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="text-sm">
          {user?.name} ({user?.role})
        </span>
        <button
          onClick={logout}
          className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Navbar;
