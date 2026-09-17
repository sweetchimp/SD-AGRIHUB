import { useState, useEffect } from "react";
import MobileTableCard from "../components/MobileTableCard";
import api from "../utils/api";

export default function Production() {
  const [productions, setProductions] = useState([]);
  const [animals, setAnimals] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({
    animalId: "",
    quantity: "",
    unit: "liters",
    notes: "",
    managerId: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prodRes, animRes, workerRes] = await Promise.all([
        api.get("/production"),
        api.get("/animals"),
        api.get("/workers"),
      ]);
      setProductions(prodRes.data || []);
      setAnimals(animRes.data || []);
      setWorkers(workerRes.data || []);
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
        await api.put(`/production/${editing.id}`, form);
        setMessage("✓ Production updated");
      } else {
        await api.post("/production", form);
        setMessage("✓ Production recorded");
      }
      setForm({ animalId: "", quantity: "", unit: "liters", notes: "", managerId: "" });
      setEditing(null);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (prod) => {
    setEditing(prod);
    setForm({
      animalId: prod.animalId || "",
      quantity: prod.quantity,
      unit: prod.unit,
      notes: prod.notes || "",
      managerId: prod.managerId || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this record?")) {
      try {
        await api.delete(`/production/${id}`);
        setMessage("✓ Production deleted");
        fetchData();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("✗ Failed to delete");
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ animalId: "", quantity: "", unit: "liters", notes: "", managerId: "" });
  };

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold font-brand text-primary mb-8">
              📊 Production Logger
            </h1>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes("✓") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-8 border-l-4 border-accent">
              <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                {editing ? "Edit Production" : "Record Production"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Animal
                  </label>
                  <select
                    name="animalId"
                    value={form.animalId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select animal</option>
                    {animals.map((animal) => (
                      <option key={animal.id} value={animal.id}>
                        {animal.type} ({animal.tagNumber || "N/A"})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    step="0.1"
                    value={form.quantity}
                    onChange={handleChange}
                    placeholder="0.0"
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Unit
                  </label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="liters">Liters</option>
                    <option value="kg">Kilograms</option>
                    <option value="count">Count</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Manager
                  </label>
                  <select
                    name="managerId"
                    value={form.managerId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select manager (optional)</option>
                    {workers.map((worker) => (
                      <option key={worker.id} value={worker.id}>
                        {worker.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg active:scale-95 disabled:opacity-50 transition"
                  >
                    {loading ? "Saving..." : editing ? "Update" : "Record"}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-3 min-h-[44px] bg-gray-400 text-white rounded-lg hover:bg-gray-500 active:scale-95 transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Any additional notes"
                  className="w-full px-4 py-3 text-base border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  rows="2"
                />
              </div>
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                Production History
              </h2>
              {productions.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-accent">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Animal</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Unit</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Manager</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productions.map((prod) => {
                          const manager = workers.find((w) => w.id === prod.managerId);
                          return (
                            <tr key={prod.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="py-3 px-4">{new Date(prod.date).toLocaleDateString()}</td>
                              <td className="py-3 px-4">{prod.animal?.type || "Custom"}</td>
                              <td className="py-3 px-4">{prod.quantity}</td>
                              <td className="py-3 px-4">{prod.unit}</td>
                              <td className="py-3 px-4 font-semibold text-primary">{manager?.name || "-"}</td>
                              <td className="py-3 px-4 text-sm text-gray-500">{prod.notes || "-"}</td>
                              <td className="py-3 px-4 space-x-2">
                                <button
                                  onClick={() => handleEdit(prod)}
                                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(prod.id)}
                                  className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Cards */}
                  <div className="md:hidden">
                    {productions.map((prod) => {
                      const manager = workers.find((w) => w.id === prod.managerId);
                      return (
                        <MobileTableCard
                          key={prod.id}
                          fields={[
                            { label: "Date", value: new Date(prod.date).toLocaleDateString() },
                            { label: "Animal", value: prod.animal?.type || "Custom", highlight: true },
                            { label: "Quantity", value: `${prod.quantity} ${prod.unit}` },
                            { label: "Manager", value: manager?.name || "-" },
                            { label: "Notes", value: prod.notes || "-", fullWidth: true },
                          ]}
                          actions={[
                            { label: "Edit", onClick: () => handleEdit(prod), className: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700" },
                            { label: "Delete", onClick: () => handleDelete(prod.id), className: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700" },
                          ]}
                        />
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No production records yet</p>
              )}
            </div>
          </div>
        </main>
  );
}
