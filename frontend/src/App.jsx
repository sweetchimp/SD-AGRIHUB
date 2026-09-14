import { useState, useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import DarkModeToggle from "./components/DarkModeToggle";

export default function App() {
  const [isDark, setIsDark] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ["/login", "/register"].includes(location.pathname);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token && !isAuthPage) {
      navigate("/login");
    }
  }, [navigate, isAuthPage]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark">
      {!isAuthPage && (
        <div className="absolute top-4 right-4">
          <DarkModeToggle isDark={isDark} setIsDark={setIsDark} />
        </div>
      )}
      <Outlet context={{ isDark }} />
    </div>
  );
}
