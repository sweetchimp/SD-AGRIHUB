import { useState, useEffect } from "react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import ProductionCard from "../components/ProductionCard";
import ExpenseCard from "../components/ExpenseCard";
import ProfitSummary from "../components/ProfitSummary";
import { useAuth } from "../contexts/AuthContext";
import api from "../utils/api";

export default function Dashboard() {
  const { user } = useAuth();
  const [productions, setProductions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, expRes, saleRes] = await Promise.all([
        api.get("/production"),
        api.get("/expenses"),
        api.get("/sales"),
      ]);
      setProductions(prodRes.data || []);
      setExpenses(expRes.data || []);
      setSales(saleRes.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProduction = productions.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalSales = sales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const profit = totalSales - totalExpenses;

  const expensesByCategory = {};
  expenses.forEach((exp) => {
    if (exp.category) {
      expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
    }
  });
  const expenseChartData = Object.entries(expensesByCategory)
    .filter(([name]) => name)
    .map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }));

  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split("T")[0]);
  }

  const trendData = last7Days.map((date) => {
    const daySales = sales.filter((s) => s.date?.startsWith(date));
    const dayExpenses = expenses.filter((e) => e.date?.startsWith(date));
    const dayProfit =
      daySales.reduce((sum, s) => sum + (s.totalPrice || 0), 0) -
      dayExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    return {
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      profit: dayProfit,
    };
  });

  const today = new Date().toISOString().split("T")[0];
  const todayProductions = productions.filter((p) => p.date?.startsWith(today));
  const todayExpenses = expenses.filter((e) => e.date?.startsWith(today));

  const COLORS = ["#D4A417", "#1B4D2E", "#2D6A4F", "#40916C", "#52B788", "#86efac", "#bbf7d0", "#fcd34d"];

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl md:text-4xl font-bold font-brand text-primary">
            Welcome, {user?.fullName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {loading ? (
          <p className="text-center text-gray-500">Loading...</p>
        ) : (
          <div className="space-y-8">
            <ProfitSummary
              totalProduction={totalProduction}
              totalExpenses={totalExpenses}
              profit={profit}
            />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 border-l-4 border-accent">
                <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                  📊 Expenses by Category
                </h2>
                {expenseChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expenseChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-12">No expense data</p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 border-l-4 border-accent">
                <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                  📈 Profit Trend (Last 7 Days)
                </h2>
                {trendData.some((d) => d.profit > 0) ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="profit" fill="#D4A417" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-gray-500 text-center py-12">No trend data</p>
                )}
              </div>
            </div>

            {/* Today's Production */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-4">
                📊 Today's Production
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayProductions.length > 0 ? (
                  todayProductions.map((prod) => (
                    <ProductionCard
                      key={prod.id}
                      title={prod.animal?.type || prod.product?.name || "Production"}
                      quantity={prod.quantity}
                      unit={prod.unit}
                       date={prod.date ? new Date(prod.date).toLocaleTimeString() : ""}
                    />
                  ))
                ) : (
                  <p className="text-gray-500">No production recorded today</p>
                )}
              </div>
            </div>

            {/* Today's Expenses */}
            <div>
              <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-4">
                💰 Today's Expenses
              </h2>
              <div className="space-y-3">
                {todayExpenses.length > 0 ? (
                  todayExpenses.map((exp) => (
                    <ExpenseCard
                      key={exp.id}
                      category={exp.category}
                      amount={exp.amount}
                       date={exp.date ? new Date(exp.date).toLocaleDateString() : ""}
                    />
                  ))
                ) : (
                  <p className="text-gray-500">No expenses recorded today</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
