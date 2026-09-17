import { useState, useEffect } from "react";
import MobileTableCard from "../components/MobileTableCard";
import api from "../utils/api";

export default function Animals() {
  const [animals, setAnimals] = useState([]);
  const [filterType, setFilterType] = useState("all");
  const [form, setForm] = useState({
    type: "cattle",
    breed: "",
    sex: "",
    tagNumber: "",
    birthDate: "",
    purchaseDate: "",
    purchasePrice: "",
    status: "active",
    notes: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const animalTypes = ["cattle", "goat", "chicken", "pig", "sheep", "duck"];
  const breeds = ["local", "exotic"];
  const sexes = ["male", "female"];
  const statuses = ["active", "sold", "deceased"];

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
      breed: form.breed || undefined,
      sex: form.sex || undefined,
      status: form.status || "active",
      birthDate: form.birthDate
        ? new Date(form.birthDate).toISOString()
        : new Date().toISOString(),
      purchaseDate: form.purchaseDate
        ? new Date(form.purchaseDate).toISOString()
        : undefined,
      purchasePrice: form.purchasePrice
        ? parseFloat(form.purchasePrice)
        : undefined,
    };

    try {
      if (editing) {
        await api.put(`/animals/${editing.id}`, payload);
        setMessage("✓ Animal updated");
      } else {
        await api.post("/animals", payload);
        setMessage("✓ Animal added");
      }
      setForm({
        type: "cattle",
        breed: "",
        sex: "",
        tagNumber: "",
        birthDate: "",
        purchaseDate: "",
        purchasePrice: "",
        status: "active",
        notes: "",
      });
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
      breed: animal.breed || "",
      sex: animal.sex || "",
      tagNumber: animal.tagNumber || "",
      birthDate: animal.birthDate
        ? animal.birthDate.split("T")[0]
        : "",
      purchaseDate: animal.purchaseDate
        ? animal.purchaseDate.split("T")[0]
        : "",
      purchasePrice: animal.purchasePrice || "",
      status: animal.status || "active",
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
    setForm({
      type: "cattle",
      breed: "",
      sex: "",
      tagNumber: "",
      birthDate: "",
      purchaseDate: "",
      purchasePrice: "",
      status: "active",
      notes: "",
    });
  };

  const filteredAnimals =
    filterType === "all"
      ? animals
      : animals.filter((a) => a.type === filterType);

  const totalCount = filteredAnimals.length;
  const activeCount = filteredAnimals.filter(
    (a) => a.status === "active"
  ).length;
  const soldCount = filteredAnimals.filter(
    (a) => a.status === "sold"
  ).length;

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold font-brand text-primary mb-8">
              🐄 Animals
            </h1>

            {message && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  message.includes("✓")
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700"
                }`}
              >
                {message}
              </div>
            )}

            {/* Type Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setFilterType("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterType === "all"
                    ? "bg-primary text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {animalTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFilterType(type);
                    setForm({ ...form, type });
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition capitalize ${
                    filterType === type
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">
                  Total {filterType === "all" ? "Animals" : filterType.charAt(0).toUpperCase() + filterType.slice(1)}
                </p>
                <p className="text-4xl font-bold mt-2">{totalCount}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Active</p>
                <p className="text-4xl font-bold mt-2">{activeCount}</p>
              </div>
              <div className="bg-gradient-to-br from-gray-400 to-gray-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Sold</p>
                <p className="text-4xl font-bold mt-2">{soldCount}</p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-8 border-l-4 border-accent">
              <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                {editing ? "Edit Animal" : "Add Animal"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={form.type}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {animalTypes.map((t) => (
                      <option key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Breed
                  </label>
                  <select
                    name="breed"
                    value={form.breed}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select breed</option>
                    {breeds.map((b) => (
                      <option key={b} value={b}>
                        {b.charAt(0).toUpperCase() + b.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Sex
                  </label>
                  <select
                    name="sex"
                    value={form.sex}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select sex</option>
                    {sexes.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tag Number
                  </label>
                  <input
                    type="text"
                    name="tagNumber"
                    value={form.tagNumber}
                    onChange={handleChange}
                    placeholder="e.g., C001"
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={form.birthDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Purchase Date
                  </label>
                  <input
                    type="date"
                    name="purchaseDate"
                    value={form.purchaseDate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Purchase Price (UGX)
                  </label>
                  <input
                    type="number"
                    name="purchasePrice"
                    step="1000"
                    value={form.purchasePrice}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
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
                    placeholder="Additional notes"
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2 md:col-span-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg active:scale-95 disabled:opacity-50 transition"
                  >
                    {loading
                      ? "Saving..."
                      : editing
                      ? "Update"
                      : "Add Animal"}
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
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                All Animals
              </h2>
              {filteredAnimals.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-accent">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Tag
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Type
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Breed
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Sex
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            DOB
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Purchase Date
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredAnimals.map((animal) => (
                          <tr
                            key={animal.id}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            <td className="py-3 px-4 font-semibold">
                              {animal.tagNumber || "N/A"}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {animal.type}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {animal.breed || "-"}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {animal.sex || "-"}
                            </td>
                            <td className="py-3 px-4">
                              {animal.birthDate
                                ? new Date(
                                    animal.birthDate
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-3 px-4">
                              {animal.purchaseDate
                                ? new Date(
                                    animal.purchaseDate
                                  ).toLocaleDateString()
                                : "-"}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  animal.status === "active"
                                    ? "bg-green-100 text-green-700"
                                    : animal.status === "sold"
                                    ? "bg-gray-100 text-gray-700"
                                    : "bg-red-100 text-red-700"
                                }`}
                              >
                                {animal.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 space-x-2">
                              <button
                                onClick={() => handleEdit(animal)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(animal.id)}
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

                  {/* Mobile Cards */}
                  <div className="md:hidden">
                    {filteredAnimals.map((animal) => (
                      <MobileTableCard
                        key={animal.id}
                        fields={[
                          { label: "Tag", value: animal.tagNumber || "N/A", highlight: true },
                          { label: "Type", value: animal.type },
                          { label: "Breed", value: animal.breed || "-" },
                          { label: "Sex", value: animal.sex || "-" },
                          { label: "DOB", value: animal.birthDate ? new Date(animal.birthDate).toLocaleDateString() : "-" },
                          { label: "Purchase", value: animal.purchaseDate ? new Date(animal.purchaseDate).toLocaleDateString() : "-" },
                          { label: "Status", value: animal.status, className: animal.status === "active" ? "text-green-600" : animal.status === "sold" ? "text-gray-600" : "text-red-600" },
                        ]}
                        actions={[
                          { label: "Edit", onClick: () => handleEdit(animal), className: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700" },
                          { label: "Delete", onClick: () => handleDelete(animal.id), className: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700" },
                        ]}
                      />
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No animals yet. Add your first animal above!
                </p>
              )}
            </div>
      </div>
    </main>
  );
}
