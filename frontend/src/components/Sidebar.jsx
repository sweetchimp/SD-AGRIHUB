import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ onClose }) {
  const location = useLocation();
  const items = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Animals", path: "/animals", icon: "🐄" },
    { name: "Coffee Fields", path: "/coffee", icon: "☕" },
    { name: "Production", path: "/production", icon: "📈" },
    { name: "Expenses", path: "/expenses", icon: "💰" },
    { name: "Sales", path: "/sales", icon: "💵" },
    { name: "Workers", path: "/workers", icon: "👷" },
    { name: "Inventory", path: "/inventory", icon: "📦" },
    { name: "Calendar", path: "/calendar", icon: "📅" },
    { name: "Reports", path: "/reports", icon: "📋" },
  ];

  return (
    <aside className="w-72 md:w-64 bg-white dark:bg-gray-800 shadow-lg h-screen p-6 border-r-4 border-accent flex flex-col shrink-0">
      <div className="mb-6 text-center">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold font-brand text-primary">S&D AGRIHUB</h1>
          <button
            onClick={onClose}
            className="md:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-1">Farm Management</p>
      </div>
      <h2 className="text-sm font-bold font-brand text-primary mb-4 uppercase tracking-wider">Menu</h2>
      <ul className="space-y-1 flex-1 overflow-y-auto">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className={`flex items-center gap-3 p-2.5 rounded-lg transition font-semibold text-sm ${
                location.pathname === item.path
                  ? "bg-accent text-white shadow-md"
                  : "hover:bg-accent hover:text-white text-gray-700 dark:text-gray-300"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
        <p className="text-xs text-gray-400 text-center">v1.0</p>
      </div>
    </aside>
  );
}
