import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useDarkMode } from "../contexts/DarkModeContext";
import DarkModeToggle from "./DarkModeToggle";

export default function Navbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const { isDark, setIsDark } = useDarkMode();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md p-4 flex justify-between items-center border-b-4 border-accent">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="md:hidden text-xl text-gray-700 dark:text-gray-300 p-1"
          aria-label="Toggle menu"
        >
          ☰
        </button>
        <img
          src="/images/logo.png"
          alt="S&D AGRIHUB"
          className="h-10 object-contain"
        />
        <h1 className="text-lg sm:text-2xl font-bold font-brand text-primary">FarmOS</h1>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <DarkModeToggle isDark={isDark} setIsDark={setIsDark} />
        <button
          onClick={handleLogout}
          className="px-3 sm:px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition text-sm sm:text-base"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
