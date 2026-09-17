import { useState, useEffect } from "react";
import MobileTableCard from "../components/MobileTableCard";
import api from "../utils/api";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [form, setForm] = useState({
    product: "",
    quantity: "",
    unit: "kg",
    pricePerUnit: "",
    buyer: "",
    paymentMethod: "cash",
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
      const [saleRes, workerRes] = await Promise.all([
        api.get("/sales"),
        api.get("/workers"),
      ]);
      setSales(saleRes.data || []);
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
        await api.put(`/sales/${editing.id}`, form);
        setMessage("✓ Sale updated");
      } else {
        await api.post("/sales", form);
        setMessage("✓ Sale recorded");
      }
      setForm({
        product: "", quantity: "", unit: "kg", pricePerUnit: "",
        buyer: "", paymentMethod: "cash", notes: "", managerId: "",
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

  const handleEdit = (sale) => {
    setEditing(sale);
    setForm({
      product: sale.product,
      quantity: sale.quantity,
      unit: sale.unit,
      pricePerUnit: sale.pricePerUnit,
      buyer: sale.buyer || "",
      paymentMethod: sale.paymentMethod || "cash",
      notes: sale.notes || "",
      managerId: sale.managerId || "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this sale?")) {
      try {
        await api.delete(`/sales/${id}`);
        setMessage("✓ Sale deleted");
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
      product: "", quantity: "", unit: "kg", pricePerUnit: "",
      buyer: "", paymentMethod: "cash", notes: "", managerId: "",
    });
  };

  const totalSalesValue = sales.reduce((sum, s) => sum + (parseFloat(s.totalPrice) || 0), 0);
  const totalQuantity = sales.reduce((sum, s) => sum + (parseFloat(s.quantity) || 0), 0);

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold font-brand text-primary mb-8">
              💵 Sales
            </h1>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes("✓") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-gradient-to-br from-accent to-yellow-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Sales Value</p>
                <p className="text-4xl font-bold mt-2">{totalSalesValue.toLocaleString()} UGX</p>
              </div>
              <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Quantity Sold</p>
                <p className="text-4xl font-bold mt-2">{totalQuantity.toLocaleString()}</p>
              </div>
            </div>

            {/* Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-8 border-l-4 border-accent">
              <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                {editing ? "Edit Sale" : "Record Sale"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Product
                  </label>
                  <input
                    type="text"
                    name="product"
                    value={form.product}
                    onChange={handleChange}
                    placeholder="e.g., Milk"
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
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
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                    <option value="count">Count</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Price/Unit
                  </label>
                  <input
                    type="number"
                    name="pricePerUnit"
                    step="100"
                    value={form.pricePerUnit}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>

                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 min-h-[44px] bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg active:scale-95 disabled:opacity-50 transition"
                  >
                    {loading ? "Saving..." : editing ? "Update" : "Record"}
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Buyer
                  </label>
                  <input
                    type="text"
                    name="buyer"
                    value={form.buyer}
                    onChange={handleChange}
                    placeholder="Buyer name"
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    name="paymentMethod"
                    value={form.paymentMethod}
                    onChange={handleChange}
                    className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="cash">Cash</option>
                    <option value="mtn_money">MTN Money</option>
                    <option value="airtel_money">Airtel Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
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
              </div>

              {editing && (
                <button
                  type="button"
                  onClick={handleCancel}
                  className="mt-4 px-4 py-3 min-h-[44px] bg-gray-400 text-white rounded-lg hover:bg-gray-500 active:scale-95 transition"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8">
              <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                Sales History
              </h2>
              {sales.length > 0 ? (
                <>
                  {/* Desktop Table */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-accent">
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Product</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Qty</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Price/Unit</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Total</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Buyer</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Manager</th>
                          <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.map((sale) => {
                          const manager = workers.find((w) => w.id === sale.managerId);
                          return (
                            <tr key={sale.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <td className="py-3 px-4">{sale.date ? new Date(sale.date).toLocaleDateString() : "-"}</td>
                              <td className="py-3 px-4 font-semibold">{sale.product}</td>
                              <td className="py-3 px-4">{sale.quantity} {sale.unit}</td>
                              <td className="py-3 px-4">{(parseFloat(sale.pricePerUnit) || 0).toLocaleString()} UGX</td>
                              <td className="py-3 px-4 font-bold text-accent">{(parseFloat(sale.totalPrice) || 0).toLocaleString()} UGX</td>
                              <td className="py-3 px-4">{sale.buyer || "-"}</td>
                              <td className="py-3 px-4 font-semibold text-primary">{manager?.name || "-"}</td>
                              <td className="py-3 px-4 space-x-2">
                                <button
                                  onClick={() => handleEdit(sale)}
                                  className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDelete(sale.id)}
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
                    {sales.map((sale) => {
                      const manager = workers.find((w) => w.id === sale.managerId);
                      return (
                        <MobileTableCard
                          key={sale.id}
                          fields={[
                            { label: "Date", value: sale.date ? new Date(sale.date).toLocaleDateString() : "-" },
                            { label: "Product", value: sale.product, highlight: true },
                            { label: "Quantity", value: `${sale.quantity} ${sale.unit}` },
                            { label: "Price/Unit", value: `${(parseFloat(sale.pricePerUnit) || 0).toLocaleString()} UGX` },
                            { label: "Total", value: `${(parseFloat(sale.totalPrice) || 0).toLocaleString()} UGX`, className: "text-accent font-bold" },
                            { label: "Buyer", value: sale.buyer || "-" },
                            { label: "Manager", value: manager?.name || "-" },
                          ]}
                          actions={[
                            { label: "Edit", onClick: () => handleEdit(sale), className: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700" },
                            { label: "Delete", onClick: () => handleDelete(sale.id), className: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700" },
                          ]}
                        />
                      );
                    })}
                  </div>
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No sales recorded yet</p>
              )}
            </div>
      </div>
    </main>
  );
}
