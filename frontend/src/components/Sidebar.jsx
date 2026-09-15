import { Link } from "react-router-dom";

export default function Sidebar() {
  const items = [
    { name: "Dashboard", path: "/dashboard", icon: "📊" },
    { name: "Production", path: "/production", icon: "🐄" },
    { name: "Expenses", path: "/expenses", icon: "💰" },
    { name: "Sales", path: "/sales", icon: "💵" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg h-screen p-6 border-r-4 border-accent">
      <div className="mb-8">
        <img
          src="/images/logo.png"
          alt="S&D AGRIHUB"
          className="h-12 object-contain mx-auto"
        />
      </div>
      <h2 className="text-xl font-bold font-brand text-primary mb-6">Menu</h2>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.path}>
            <Link
              to={item.path}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent hover:text-white transition font-semibold"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
