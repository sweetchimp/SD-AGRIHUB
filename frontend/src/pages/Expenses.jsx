import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

export default function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [form, setForm] = useState({
    category: "feed",
    amount: "",
    notes: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const categories = ["feed", "medicine", "labor", "fuel", "equipment", "fertilizer", "seeds", "other"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/expenses");
      setExpenses(res.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editing) {
        await api.put(`/expenses/${editing.id}`, form);
        setMessage("✓ Expense updated");
      } else {
        await api.post("/expenses", form);
        setMessage("✓ Expense recorded");
      }
      setForm({ category: "feed", amount: "", notes: "" });
      setEditing(null);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (exp) => {
    setEditing(exp);
    setForm({
      category: exp.category,
      amount: exp.amount,
      notes: exp.notes || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this expense?")) {
      try {
        await api.delete(`/expenses/${id}`);
        setMessage("✓ Expense deleted");
        fetchData();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("✗ Failed to delete");
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ category: "feed", amount: "", notes: "" });
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  const categoryTotals = {};
  categories.forEach((cat) => {
    categoryTotals[cat] = expenses
      .filter((e) => e.category === cat)
      .reduce((sum, e) => sum + (parseFloat(e.amount) || 0), 0);
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold font-brand text-primary mb-8">
              💰 Expenses
            </h1>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes("✓") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Expenses</p>
                <p className="text-4xl font-bold mt-2">{totalExpenses.toLocaleString()} UGX</p>
              </div>
              <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">This Month</p>
                <p className="text-4xl font-bold mt-2">
                  {new Date().toLocaleString("en-US", { month: "long" })}
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border-l-4 border-accent">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">
                {editing ? "Edit Expense" : "Log Expense"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Amount (UGX)
                  </label>
                  <input
                    type="number"
                    name="amount"
                    step="100"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Notes
                  </label>
                  <input
                    type="text"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="e.g., Animal feed from supplier"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2 bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                  >
                    {loading ? "Saving..." : editing ? "Update" : "Record"}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {categories.map((cat) => (
                <div key={cat} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 capitalize">{cat}</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {categoryTotals[cat].toLocaleString()}
                  </p>
                </div>
              ))}
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">
                Expense History
              </h2>
              {expenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-accent">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Category</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Amount</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expenses.map((exp) => (
                        <tr key={exp.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4">{new Date(exp.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 capitalize font-semibold text-accent">{exp.category}</td>
                          <td className="py-3 px-4 font-bold">{parseFloat(exp.amount).toLocaleString()} UGX</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{exp.notes || "-"}</td>
                          <td className="py-3 px-4 space-x-2">
                            <button
                              onClick={() => handleEdit(exp)}
                              className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No expenses recorded yet</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
