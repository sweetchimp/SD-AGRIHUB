import { useState, useEffect } from "react";
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import html2pdf from "html2pdf.js";

import api from "../utils/api";

export default function Reports() {
  const [productions, setProductions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [sales, setSales] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weekFilter, setWeekFilter] = useState("current");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, expRes, saleRes, workerRes] = await Promise.all([
        api.get("/production"),
        api.get("/expenses"),
        api.get("/sales"),
        api.get("/workers"),
      ]);
      setProductions(prodRes.data || []);
      setExpenses(expRes.data || []);
      setSales(saleRes.data || []);
      setWorkers(workerRes.data || []);
      const allTasks = (workerRes.data || []).flatMap((w) =>
        (w.tasks || []).map((t) => ({ ...t, workerName: w.name }))
      );
      setTasks(allTasks);
    } catch (error) {
      console.error("Fetch failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(now);
    monday.setDate(now.getDate() + mondayOffset + (weekFilter === "previous" ? -7 : 0));
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    monday.setHours(0, 0, 0, 0);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
  };

  const { start, end } = getWeekDates();

  const weekProductions = productions.filter((p) => {
    const d = new Date(p.date);
    return d >= start && d <= end;
  });
  const weekExpenses = expenses.filter((e) => {
    const d = new Date(e.date);
    return d >= start && d <= end;
  });
  const weekSales = sales.filter((s) => {
    const d = new Date(s.date);
    return d >= start && d <= end;
  });
  const weekTasks = tasks.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  });

  const totalProduction = weekProductions.reduce((sum, p) => sum + (p.quantity || 0), 0);
  const totalExpenses = weekExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const totalSalesVal = weekSales.reduce((sum, s) => sum + (s.totalPrice || 0), 0);
  const profit = totalSalesVal - totalExpenses;

  const expensesByCategory = {};
  weekExpenses.forEach((exp) => {
    expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
  });
  const expenseChartData = Object.entries(expensesByCategory).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const dailyData = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split("T")[0];
    const dayProd = weekProductions.filter((p) => p.date?.startsWith(dateStr)).reduce((sum, p) => sum + (p.quantity || 0), 0);
    const dayExp = weekExpenses.filter((e) => e.date?.startsWith(dateStr)).reduce((sum, e) => sum + (e.amount || 0), 0);
    dailyData.push({
      date: d.toLocaleDateString("en-US", { weekday: "short" }),
      production: dayProd,
      expenses: dayExp,
    });
  }

  const COLORS = ["#D4A417", "#1B4D2E", "#2D6A4F", "#40916C", "#52B788"];

  const handleExportPDF = () => {
    const element = document.getElementById("report-content");
    const opt = {
      margin: 10,
      filename: `FarmOS-Weekly-Report-${start.toISOString().split("T")[0]}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: "portrait", unit: "mm", format: "a4" },
    };
    html2pdf().set(opt).from(element).save();
  };

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <h1 className="text-2xl md:text-4xl font-bold font-brand text-primary">
                📋 Weekly Reports
              </h1>
              <div className="space-x-3">
                <button
                  onClick={() => setWeekFilter("current")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    weekFilter === "current"
                      ? "bg-primary text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  This Week
                </button>
                <button
                  onClick={() => setWeekFilter("previous")}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    weekFilter === "previous"
                      ? "bg-primary text-white"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                >
                  Last Week
                </button>
                <button
                  onClick={handleExportPDF}
                  className="px-6 py-2 bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg transition"
                >
                  Export PDF
                </button>
              </div>
            </div>

            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : (
              <div id="report-content" className="space-y-8 bg-white dark:bg-gray-800 p-4 sm:p-8 rounded-xl">
                <div className="text-center border-b-2 border-accent pb-6">
                  <h2 className="text-3xl font-bold font-brand text-primary mb-2">S&D AGRIHUB</h2>
                  <p className="text-gray-600 dark:text-gray-400">
                    Weekly Report: {start.toLocaleDateString()} - {end.toLocaleDateString()}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-lg p-6 shadow-md">
                    <p className="text-sm opacity-90">Total Production</p>
                    <p className="text-3xl font-bold mt-2">{totalProduction.toLocaleString()}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-lg p-6 shadow-md">
                    <p className="text-sm opacity-90">Total Expenses</p>
                    <p className="text-3xl font-bold mt-2">{totalExpenses.toLocaleString()} UGX</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-400 to-accent text-white rounded-lg p-6 shadow-md">
                    <p className="text-sm opacity-90">Total Sales</p>
                    <p className="text-3xl font-bold mt-2">{totalSalesVal.toLocaleString()} UGX</p>
                  </div>
                  <div className={`bg-gradient-to-br ${profit >= 0 ? "from-green-400 to-green-600" : "from-gray-400 to-gray-600"} text-white rounded-lg p-6 shadow-md`}>
                    <p className="text-sm opacity-90">Net Profit</p>
                    <p className="text-3xl font-bold mt-2">{profit.toLocaleString()} UGX</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold font-brand text-primary mb-4">Expenses by Category</h3>
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
                  <div>
                    <h3 className="text-xl font-bold font-brand text-primary mb-4">Daily Activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="production" fill="#D4A417" />
                        <Bar dataKey="expenses" fill="#EF4444" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="space-y-8">
                  <div>
                    <h3 className="text-2xl font-bold font-brand text-primary mb-4">Productions This Week</h3>
                    {weekProductions.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-accent">
                              <th className="text-left py-2 px-3 font-semibold">Date</th>
                              <th className="text-left py-2 px-3 font-semibold">Type</th>
                              <th className="text-left py-2 px-3 font-semibold">Qty</th>
                              <th className="text-left py-2 px-3 font-semibold">Manager</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weekProductions.map((prod) => (
                              <tr key={prod.id} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="py-2 px-3">{new Date(prod.date).toLocaleDateString()}</td>
                                <td className="py-2 px-3">{prod.animal?.type || "Custom"}</td>
                                <td className="py-2 px-3">{prod.quantity} {prod.unit}</td>
                                <td className="py-2 px-3">{workers.find((w) => w.id === prod.managerId)?.name || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No productions this week</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold font-brand text-primary mb-4">Expenses This Week</h3>
                    {weekExpenses.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-accent">
                              <th className="text-left py-2 px-3 font-semibold">Date</th>
                              <th className="text-left py-2 px-3 font-semibold">Category</th>
                              <th className="text-left py-2 px-3 font-semibold">Amount</th>
                              <th className="text-left py-2 px-3 font-semibold">Manager</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weekExpenses.map((exp) => (
                              <tr key={exp.id} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="py-2 px-3">{new Date(exp.date).toLocaleDateString()}</td>
                                <td className="py-2 px-3 capitalize">{exp.category}</td>
                                <td className="py-2 px-3 font-semibold">{exp.amount.toLocaleString()} UGX</td>
                                <td className="py-2 px-3">{workers.find((w) => w.id === exp.managerId)?.name || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No expenses this week</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold font-brand text-primary mb-4">Sales This Week</h3>
                    {weekSales.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-accent">
                              <th className="text-left py-2 px-3 font-semibold">Date</th>
                              <th className="text-left py-2 px-3 font-semibold">Product</th>
                              <th className="text-left py-2 px-3 font-semibold">Total</th>
                              <th className="text-left py-2 px-3 font-semibold">Buyer</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weekSales.map((sale) => (
                              <tr key={sale.id} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="py-2 px-3">{new Date(sale.date).toLocaleDateString()}</td>
                                <td className="py-2 px-3">{sale.product}</td>
                                <td className="py-2 px-3 font-semibold text-accent">{sale.totalPrice.toLocaleString()} UGX</td>
                                <td className="py-2 px-3">{sale.buyer || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No sales this week</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold font-brand text-primary mb-4">Worker Tasks This Week</h3>
                    {weekTasks.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b-2 border-accent">
                              <th className="text-left py-2 px-3 font-semibold">Date</th>
                              <th className="text-left py-2 px-3 font-semibold">Worker</th>
                              <th className="text-left py-2 px-3 font-semibold">Task</th>
                              <th className="text-left py-2 px-3 font-semibold">Hours</th>
                              <th className="text-left py-2 px-3 font-semibold">Amount</th>
                            </tr>
                          </thead>
                          <tbody>
                            {weekTasks.map((task) => (
                              <tr key={task.id} className="border-b border-gray-200 dark:border-gray-700">
                                <td className="py-2 px-3">{new Date(task.date).toLocaleDateString()}</td>
                                <td className="py-2 px-3">{task.workerName || workers.find((w) => w.id === task.workerId)?.name || "-"}</td>
                                <td className="py-2 px-3">{task.task}</td>
                                <td className="py-2 px-3">{task.hours || 0}</td>
                                <td className="py-2 px-3 font-semibold">{(task.totalAmount || 0).toLocaleString()} UGX</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500">No tasks this week</p>
                    )}
                  </div>
                </div>

                <div className="border-t-2 border-accent pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>Generated on {new Date().toLocaleDateString()} | S&D AGRIHUB Farm Management System</p>
                </div>
              </div>
            )}
      </div>
    </main>
  );
}
