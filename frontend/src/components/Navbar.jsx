import { useNavigate, useOutletContext } from "react-router-dom";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar() {
  const navigate = useNavigate();
  const { isDark, setIsDark } = useOutletContext();

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center border-b-4 border-accent">
      <div className="flex items-center gap-3">
        <img
          src="/images/logo.png"
          alt="S&D AGRIHUB"
          className="h-10 object-contain"
        />
        <h1 className="text-2xl font-bold font-brand text-primary">FarmOS</h1>
      </div>
      <div className="flex items-center gap-3">
        <DarkModeToggle isDark={isDark} setIsDark={setIsDark} />
        <button
          onClick={() => {
            localStorage.removeItem("authToken");
            navigate("/login");
          }}
          className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
