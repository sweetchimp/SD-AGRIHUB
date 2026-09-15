import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [form, setForm] = useState({
    type: "cattle",
    tagNumber: "",
    birthDate: "",
    purchaseDate: "",
    purchasePrice: "",
    notes: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const animalTypes = ["cattle", "goat", "chicken", "pig", "sheep", "duck"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/animals");
      setAnimals(res.data || []);
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

    const payload = {
      ...form,
      birthDate: form.birthDate ? new Date(form.birthDate).toISOString() : new Date().toISOString(),
      purchaseDate: form.purchaseDate ? new Date(form.purchaseDate).toISOString() : undefined,
      purchasePrice: form.purchasePrice ? parseFloat(form.purchasePrice) : undefined,
    };

    try {
      if (editing) {
        await api.put(`/animals/${editing.id}`, payload);
        setMessage("✓ Animal updated");
      } else {
        await api.post("/animals", payload);
        setMessage("✓ Animal added");
      }
      setForm({ type: "cattle", tagNumber: "", birthDate: "", purchaseDate: "", purchasePrice: "", notes: "" });
      setEditing(null);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (animal) => {
    setEditing(animal);
    setForm({
      type: animal.type,
      tagNumber: animal.tagNumber || "",
      birthDate: animal.birthDate ? animal.birthDate.split("T")[0] : "",
      purchaseDate: animal.purchaseDate ? animal.purchaseDate.split("T")[0] : "",
      purchasePrice: animal.purchasePrice || "",
      notes: animal.notes || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this animal?")) {
      try {
        await api.delete(`/animals/${id}`);
        setMessage("✓ Animal deleted");
        fetchData();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("✗ Failed to delete");
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ type: "cattle", tagNumber: "", birthDate: "", purchaseDate: "", purchasePrice: "", notes: "" });
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold font-brand text-primary mb-8">
              🐄 Animals
            </h1>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes("✓") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
              {animalTypes.map((type) => (
                <div key={type} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
                  <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 capitalize">{type}</p>
                  <p className="text-2xl font-bold text-primary mt-1">
                    {animals.filter((a) => a.type === type).length}
                  </p>
                </div>
              ))}
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border-l-4 border-accent">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">
                {editing ? "Edit Animal" : "Add Animal"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Type</label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {animalTypes.map((t) => (
                      <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tag Number</label>
                  <input
                    type="text"
                    name="tagNumber"
                    value={form.tagNumber}
                    onChange={handleChange}
                    placeholder="e.g., C001"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Birth Date</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Purchase Price (UGX)</label>
                  <input
                    type="number"
                    name="purchasePrice"
                    step="1000"
                    value={form.purchasePrice}
                    onChange={handleChange}
                    placeholder="0"
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
                    {loading ? "Saving..." : editing ? "Update" : "Add Animal"}
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
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">All Animals</h2>
              {animals.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-accent">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tag</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Type</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Birth Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Purchase</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {animals.map((animal) => (
                        <tr key={animal.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                          <td className="py-3 px-4 font-semibold">{animal.tagNumber || "N/A"}</td>
                          <td className="py-3 px-4 capitalize">{animal.type}</td>
                          <td className="py-3 px-4">{animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : "-"}</td>
                          <td className="py-3 px-4">{animal.purchasePrice ? `${animal.purchasePrice.toLocaleString()} UGX` : "-"}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${animal.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                              {animal.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 space-x-2">
                            <button onClick={() => handleEdit(animal)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">Edit</button>
                            <button onClick={() => handleDelete(animal.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No animals yet. Add your first animal above!</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
