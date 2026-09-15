import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import ProductionCard from "../components/ProductionCard";
import ExpenseCard from "../components/ExpenseCard";
import ProfitSummary from "../components/ProfitSummary";
import api from "../utils/api";

export default function Dashboard() {
  const [productions, setProductions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) setUser(JSON.parse(userData));
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, expRes] = await Promise.all([api.get("/production"), api.get("/expenses")]);
      setProductions(prodRes.data || []);
      setExpenses(expRes.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const totalProduction = productions.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const profit = totalProduction - totalExpenses;

  const today = new Date().toISOString().split("T")[0];
  const todayProductions = productions.filter((p) => p.date?.startsWith(today));
  const todayExpenses = expenses.filter((e) => e.date?.startsWith(today));

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-4xl font-bold font-brand text-primary dark:text-white">
                Welcome, {user?.fullName}! 👋
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1 font-sans">
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

                <div>
                  <h2 className="text-2xl font-bold font-brand text-primary dark:text-white mb-4">📊 Today's Production</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {todayProductions.length > 0 ? (
                      todayProductions.map((prod) => (
                        <ProductionCard
                          key={prod.id}
                          title={prod.animal?.type || prod.product?.name || "Production"}
                          quantity={prod.quantity}
                          unit={prod.unit}
                          date={new Date(prod.date).toLocaleTimeString()}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">No production today</p>
                    )}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-bold font-brand text-primary dark:text-white mb-4">💰 Today's Expenses</h2>
                  <div className="space-y-3">
                    {todayExpenses.length > 0 ? (
                      todayExpenses.map((exp) => (
                        <ExpenseCard
                          key={exp.id}
                          category={exp.category}
                          amount={exp.amount}
                          date={new Date(exp.date).toLocaleDateString()}
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">No expenses today</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
