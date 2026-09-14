import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold text-primary">🌾 FarmOS</h1>
      <button
        onClick={() => {
          localStorage.removeItem("authToken");
          navigate("/login");
        }}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Logout
      </button>
    </nav>
  );
}
