import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

export default function CoffeePlots() {
  const [plots, setPlots] = useState([]);
  const [form, setForm] = useState({
    name: "",
    acresPlanted: "",
    plantDate: "",
    expectedHarvest: "",
    status: "growing",
    notes: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const statuses = ["growing", "flowering", "harvesting", "dormant", "completed"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/coffee");
      setPlots(res.data || []);
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
        await api.put(`/coffee/${editing.id}`, form);
        setMessage("✓ Coffee plot updated");
      } else {
        await api.post("/coffee", form);
        setMessage("✓ Coffee plot added");
      }
      setForm({ name: "", acresPlanted: "", plantDate: "", expectedHarvest: "", status: "growing", notes: "" });
      setEditing(null);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plot) => {
    setEditing(plot);
    setForm({
      name: plot.name,
      acresPlanted: plot.acresPlanted,
      plantDate: plot.plantDate ? plot.plantDate.split("T")[0] : "",
      expectedHarvest: plot.expectedHarvest ? plot.expectedHarvest.split("T")[0] : "",
      status: plot.status,
      notes: plot.notes || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this coffee plot?")) {
      try {
        await api.delete(`/coffee/${id}`);
        setMessage("✓ Coffee plot deleted");
        fetchData();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("✗ Failed to delete");
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ name: "", acresPlanted: "", plantDate: "", expectedHarvest: "", status: "growing", notes: "" });
  };

  const totalAcres = plots.reduce((sum, p) => sum + (parseFloat(p.acresPlanted) || 0), 0);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold font-brand text-primary mb-8">
              ☕ Coffee Plots
            </h1>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes("✓") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Plots</p>
                <p className="text-4xl font-bold mt-2">{plots.length}</p>
              </div>
              <div className="bg-gradient-to-br from-accent to-yellow-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Acres</p>
                <p className="text-4xl font-bold mt-2">{totalAcres.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-secondary to-green-700 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Currently Growing</p>
                <p className="text-4xl font-bold mt-2">{plots.filter((p) => p.status === "growing").length}</p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border-l-4 border-accent">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">
                {editing ? "Edit Coffee Plot" : "Add Coffee Plot"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Plot Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., North Field"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Acres Planted</label>
                  <input
                    type="number"
                    name="acresPlanted"
                    step="0.1"
                    value={form.acresPlanted}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Plant Date</label>
                  <input
                    type="date"
                    name="plantDate"
                    value={form.plantDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Expected Harvest</label>
                  <input
                    type="date"
                    name="expectedHarvest"
                    value={form.expectedHarvest}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                  <input
                    type="text"
                    name="notes"
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Additional notes"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex items-end gap-2 md:col-span-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                  >
                    {loading ? "Saving..." : editing ? "Update" : "Add Plot"}
                  </button>
                  {editing && (
                    <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">All Coffee Plots</h2>
              {plots.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-accent">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Acres</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Plant Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Expected Harvest</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {plots.map((plot) => (
                        <tr key={plot.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4 font-semibold">{plot.name}</td>
                          <td className="py-3 px-4">{plot.acresPlanted} acres</td>
                          <td className="py-3 px-4">{plot.plantDate ? new Date(plot.plantDate).toLocaleDateString() : "-"}</td>
                          <td className="py-3 px-4">{plot.expectedHarvest ? new Date(plot.expectedHarvest).toLocaleDateString() : "-"}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                              plot.status === "harvesting" ? "bg-green-100 text-green-700" :
                              plot.status === "growing" ? "bg-blue-100 text-blue-700" :
                              plot.status === "flowering" ? "bg-purple-100 text-purple-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {plot.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 space-x-2">
                            <button onClick={() => handleEdit(plot)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">Edit</button>
                            <button onClick={() => handleDelete(plot.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No coffee plots yet. Add your first plot above!</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
