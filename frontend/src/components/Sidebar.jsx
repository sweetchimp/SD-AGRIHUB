import { Link } from "react-router-dom";

export default function Sidebar() {
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
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen p-6 border-r-4 border-accent flex flex-col shrink-0">
      <div className="mb-6 text-center">
        <h1 className="text-xl font-bold font-brand text-primary">S&D AGRIHUB</h1>
        <p className="text-xs text-gray-400 mt-1">Farm Management</p>
      </div>
      <h2 className="text-sm font-bold font-brand text-primary mb-4 uppercase tracking-wider">Menu</h2>
      <ul className="space-y-1 flex-1 overflow-y-auto">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-accent hover:text-white transition font-semibold text-sm"
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
