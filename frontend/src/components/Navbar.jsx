import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

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
      <button
        onClick={() => {
          localStorage.removeItem("authToken");
          navigate("/login");
        }}
        className="px-6 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition"
      >
        Logout
      </button>
    </nav>
  );
}
