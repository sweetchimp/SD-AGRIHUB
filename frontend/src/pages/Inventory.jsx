import { useState, useEffect } from "react";
import api from "../utils/api";

export default function Inventory() {
  const [items, setItems] = useState([]);
  const [filterCategory, setFilterCategory] = useState("all");
  const [form, setForm] = useState({
    name: "",
    category: "fertilizer",
    quantity: "",
    unit: "",
    minimumStock: "",
    supplier: "",
    purchasePrice: "",
    notes: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const categories = [
    "fertilizer",
    "chemicals",
    "feed",
    "medicine",
    "coffee_supplies",
    "other",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await api.get("/inventory");
      setItems(res.data || []);
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
      quantity: parseFloat(form.quantity) || 0,
      minimumStock: parseFloat(form.minimumStock) || 0,
      purchasePrice: form.purchasePrice
        ? parseFloat(form.purchasePrice)
        : undefined,
    };

    try {
      if (editing) {
        await api.put(`/inventory/${editing.id}`, payload);
        setMessage("✓ Item updated");
      } else {
        await api.post("/inventory", payload);
        setMessage("✓ Item added");
      }
      setForm({
        name: "",
        category: "fertilizer",
        quantity: "",
        unit: "",
        minimumStock: "",
        supplier: "",
        purchasePrice: "",
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

  const handleEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      category: item.category,
      quantity: String(item.quantity),
      unit: item.unit,
      minimumStock: String(item.minimumStock),
      supplier: item.supplier || "",
      purchasePrice: item.purchasePrice || "",
      notes: item.notes || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this inventory item?")) {
      try {
        await api.delete(`/inventory/${id}`);
        setMessage("✓ Item deleted");
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
      name: "",
      category: "fertilizer",
      quantity: "",
      unit: "",
      minimumStock: "",
      supplier: "",
      purchasePrice: "",
      notes: "",
    });
  };

  const handleInlineStockUpdate = async (id, newQuantity) => {
    try {
      await api.put(`/inventory/${id}`, { quantity: newQuantity });
      fetchData();
    } catch (error) {
      setMessage("✗ Failed to update stock");
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const filteredItems =
    filterCategory === "all"
      ? items
      : items.filter((i) => i.category === filterCategory);

  const totalCount = filteredItems.length;
  const lowStockCount = filteredItems.filter(
    (i) => i.quantity <= i.minimumStock && i.minimumStock > 0
  ).length;
  const totalValue = filteredItems.reduce(
    (sum, i) => sum + (i.purchasePrice || 0) * i.quantity,
    0
  );

  const formatLabel = (cat) => {
    const map = {
      fertilizer: "Fertilizer",
      chemicals: "Chemicals",
      feed: "Feed",
      medicine: "Medicine",
      coffee_supplies: "Coffee Supplies",
      other: "Other",
    };
    return map[cat] || cat;
  };

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold font-brand text-primary mb-8">
              📦 Inventory
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

            {/* Category Filter Buttons */}
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setFilterCategory("all")}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  filterCategory === "all"
                    ? "bg-primary text-white shadow-lg"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setFilterCategory(cat);
                    setForm({ ...form, category: cat });
                  }}
                  className={`px-4 py-2 rounded-lg font-semibold transition ${
                    filterCategory === cat
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {formatLabel(cat)}
                </button>
              ))}
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">
                  Total{" "}
                  {filterCategory === "all"
                    ? "Items"
                    : formatLabel(filterCategory)}
                </p>
                <p className="text-4xl font-bold mt-2">{totalCount}</p>
              </div>
              <div className="bg-gradient-to-br from-red-400 to-red-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Low Stock Alerts</p>
                <p className="text-4xl font-bold mt-2">{lowStockCount}</p>
              </div>
              <div className="bg-gradient-to-br from-accent to-yellow-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Value</p>
                <p className="text-3xl font-bold mt-2">
                  {totalValue.toLocaleString()} UGX
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-8 border-l-4 border-accent">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">
                {editing ? "Edit Item" : "Add Item"}
              </h2>
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Item Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g., NPK Fertilizer"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

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
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {formatLabel(c)}
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
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Unit
                  </label>
                  <input
                    type="text"
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    placeholder="e.g., bags, liters, kg"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Stock
                  </label>
                  <input
                    type="number"
                    name="minimumStock"
                    step="0.1"
                    value={form.minimumStock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Supplier
                  </label>
                  <input
                    type="text"
                    name="supplier"
                    value={form.supplier}
                    onChange={handleChange}
                    placeholder="Supplier name"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
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
                    {loading
                      ? "Saving..."
                      : editing
                      ? "Update"
                      : "Add Item"}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">
                Inventory Items
              </h2>
              {filteredItems.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-accent">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Item Name
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Category
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Stock
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Min
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Status
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Supplier
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Value
                        </th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredItems.map((item) => {
                        const isLow =
                          item.quantity <= item.minimumStock &&
                          item.minimumStock > 0;
                        const value = item.purchasePrice
                          ? item.purchasePrice * item.quantity
                          : null;
                        return (
                          <tr
                            key={item.id}
                            className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                              isLow ? "bg-red-50 dark:bg-red-900/20" : ""
                            }`}
                          >
                            <td className="py-3 px-4 font-semibold">
                              {item.name}
                            </td>
                            <td className="py-3 px-4 capitalize">
                              {formatLabel(item.category)}
                            </td>
                            <td className="py-3 px-4">
                              <input
                                type="number"
                                step="0.1"
                                defaultValue={item.quantity}
                                onBlur={(e) =>
                                  handleInlineStockUpdate(
                                    item.id,
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className={`w-20 px-2 py-1 border-2 rounded text-center dark:bg-gray-700 dark:text-white ${
                                  isLow
                                    ? "border-red-300 focus:border-red-500"
                                    : "border-gray-200 dark:border-gray-700 focus:border-primary"
                                }`}
                              />
                              <span className="ml-1 text-sm text-gray-500">
                                {item.unit}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {item.minimumStock}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-1 rounded-full text-xs font-bold ${
                                  isLow
                                    ? "bg-red-100 text-red-700"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {isLow ? "⚠️ Low" : "✓ OK"}
                              </span>
                            </td>
                            <td className="py-3 px-4">
                              {item.supplier || "-"}
                            </td>
                            <td className="py-3 px-4 font-semibold">
                              {value !== null
                                ? `${value.toLocaleString()} UGX`
                                : "-"}
                            </td>
                            <td className="py-3 px-4 space-x-2">
                              <button
                                onClick={() => handleEdit(item)}
                                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
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
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No inventory items yet. Add your first item above!
                </p>
              )}
            </div>
      </div>
    </main>
  );
}
