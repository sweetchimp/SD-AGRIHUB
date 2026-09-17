import { useState, useEffect } from "react";
import MobileTableCard from "../components/MobileTableCard";
import api from "../utils/api";

export default function Coffee() {
  const [activeTab, setActiveTab] = useState("fields");

  const [fields, setFields] = useState([]);
  const [activities, setActivities] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [workers, setWorkers] = useState([]);

  const [fieldForm, setFieldForm] = useState({
    name: "",
    acres: "",
    coffeeVariety: "",
    numberOfTrees: "",
    yearPlanted: "",
    status: "active",
    notes: "",
  });
  const [activityForm, setActivityForm] = useState({
    fieldId: "",
    activityType: "pruning",
    date: "",
    managerId: "",
    notes: "",
  });
  const [harvestForm, setHarvestForm] = useState({
    fieldId: "",
    date: "",
    quantity: "",
    unit: "kg",
    notes: "",
  });

  const [editingField, setEditingField] = useState(null);
  const [editingActivity, setEditingActivity] = useState(null);
  const [editingHarvest, setEditingHarvest] = useState(null);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fieldStatuses = ["active", "inactive", "mature", "new"];
  const activityTypes = ["pruning", "weeding", "fertilizing", "spraying", "harvesting", "other"];
  const harvestUnits = ["kg", "bags", "cherries"];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [fRes, aRes, hRes, wRes] = await Promise.all([
        api.get("/coffee/fields"),
        api.get("/coffee/activities"),
        api.get("/coffee/harvests"),
        api.get("/workers"),
      ]);
      setFields(fRes.data || []);
      setActivities(aRes.data || []);
      setHarvests(hRes.data || []);
      setWorkers(wRes.data || []);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  // ─── Field Handlers ──────────────────────────────────────

  const handleFieldChange = (e) => {
    setFieldForm({ ...fieldForm, [e.target.name]: e.target.value });
  };

  const handleFieldSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...fieldForm,
        acres: parseFloat(fieldForm.acres) || 0,
        numberOfTrees: parseInt(fieldForm.numberOfTrees) || 0,
        yearPlanted: parseInt(fieldForm.yearPlanted) || 0,
      };
      if (editingField) {
        await api.put(`/coffee/fields/${editingField.id}`, payload);
        setMessage("✓ Coffee field updated");
      } else {
        await api.post("/coffee/fields", payload);
        setMessage("✓ Coffee field added");
      }
      setFieldForm({ name: "", acres: "", coffeeVariety: "", numberOfTrees: "", yearPlanted: "", status: "active", notes: "" });
      setEditingField(null);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEditField = (field) => {
    setEditingField(field);
    setFieldForm({
      name: field.name,
      acres: String(field.acres),
      coffeeVariety: field.coffeeVariety,
      numberOfTrees: String(field.numberOfTrees),
      yearPlanted: String(field.yearPlanted),
      status: field.status,
      notes: field.notes || "",
    });
  };

  const handleDeleteField = async (id) => {
    if (window.confirm("Delete this coffee field?")) {
      try {
        await api.delete(`/coffee/fields/${id}`);
        setMessage("✓ Coffee field deleted");
        fetchData();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("✗ Failed to delete");
      }
    }
  };

  const handleCancelField = () => {
    setEditingField(null);
    setFieldForm({ name: "", acres: "", coffeeVariety: "", numberOfTrees: "", yearPlanted: "", status: "active", notes: "" });
  };

  // ─── Activity Handlers ───────────────────────────────────

  const handleActivityChange = (e) => {
    setActivityForm({ ...activityForm, [e.target.name]: e.target.value });
  };

  const handleActivitySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...activityForm,
        date: activityForm.date ? new Date(activityForm.date).toISOString() : undefined,
        managerId: activityForm.managerId || undefined,
      };
      if (editingActivity) {
        await api.put(`/coffee/activities/${editingActivity.id}`, payload);
        setMessage("✓ Activity updated");
      } else {
        await api.post("/coffee/activities", payload);
        setMessage("✓ Activity recorded");
      }
      setActivityForm({ fieldId: "", activityType: "pruning", date: "", managerId: "", notes: "" });
      setEditingActivity(null);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEditActivity = (act) => {
    setEditingActivity(act);
    setActivityForm({
      fieldId: act.fieldId,
      activityType: act.activityType,
      date: act.date ? new Date(act.date).toISOString().split("T")[0] : "",
      managerId: act.managerId || "",
      notes: act.notes || "",
    });
  };

  const handleDeleteActivity = async (id) => {
    if (window.confirm("Delete this activity?")) {
      try {
        await api.delete(`/coffee/activities/${id}`);
        setMessage("✓ Activity deleted");
        fetchData();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("✗ Failed to delete");
      }
    }
  };

  const handleCancelActivity = () => {
    setEditingActivity(null);
    setActivityForm({ fieldId: "", activityType: "pruning", date: "", managerId: "", notes: "" });
  };

  // ─── Harvest Handlers ────────────────────────────────────

  const handleHarvestChange = (e) => {
    setHarvestForm({ ...harvestForm, [e.target.name]: e.target.value });
  };

  const handleHarvestSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...harvestForm,
        date: harvestForm.date ? new Date(harvestForm.date).toISOString() : undefined,
        quantity: parseFloat(harvestForm.quantity) || 0,
      };
      if (editingHarvest) {
        await api.put(`/coffee/harvests/${editingHarvest.id}`, payload);
        setMessage("✓ Harvest updated");
      } else {
        await api.post("/coffee/harvests", payload);
        setMessage("✓ Harvest recorded");
      }
      setHarvestForm({ fieldId: "", date: "", quantity: "", unit: "kg", notes: "" });
      setEditingHarvest(null);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleEditHarvest = (h) => {
    setEditingHarvest(h);
    setHarvestForm({
      fieldId: h.fieldId,
      date: h.date ? new Date(h.date).toISOString().split("T")[0] : "",
      quantity: String(h.quantity),
      unit: h.unit,
      notes: h.notes || "",
    });
  };

  const handleDeleteHarvest = async (id) => {
    if (window.confirm("Delete this harvest record?")) {
      try {
        await api.delete(`/coffee/harvests/${id}`);
        setMessage("✓ Harvest deleted");
        fetchData();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("✗ Failed to delete");
      }
    }
  };

  const handleCancelHarvest = () => {
    setEditingHarvest(null);
    setHarvestForm({ fieldId: "", date: "", quantity: "", unit: "kg", notes: "" });
  };

  // ─── Computed Values ─────────────────────────────────────

  const totalAcres = fields.reduce((sum, f) => sum + (parseFloat(f.acres) || 0), 0);
  const totalHarvestQty = harvests.reduce((sum, h) => sum + (parseFloat(h.quantity) || 0), 0);

  const tabs = [
    { id: "fields", label: "Coffee Fields", icon: "🌱" },
    { id: "activities", label: "Activities", icon: "📋" },
    { id: "harvests", label: "Harvest", icon: "☕" },
  ];

  return (
    <main className="flex-1 overflow-auto p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold font-brand text-primary mb-8">
              ☕ Coffee Management
            </h1>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes("✓") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Fields</p>
                <p className="text-4xl font-bold mt-2">{fields.length}</p>
              </div>
              <div className="bg-gradient-to-br from-accent to-yellow-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Acres</p>
                <p className="text-4xl font-bold mt-2">{totalAcres.toLocaleString()}</p>
              </div>
              <div className="bg-gradient-to-br from-secondary to-green-700 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Harvest</p>
                <p className="text-4xl font-bold mt-2">{totalHarvestQty.toLocaleString()} kg</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Activities</p>
                <p className="text-4xl font-bold mt-2">{activities.length}</p>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex gap-2 mb-8 overflow-x-auto pb-2 -mx-4 px-4">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base rounded-lg font-semibold transition ${
                    activeTab === tab.id
                      ? "bg-primary text-white shadow-lg"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* ═══════════════ FIELDS TAB ═══════════════ */}
            {activeTab === "fields" && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-8 border-l-4 border-accent">
                  <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                    {editingField ? "Edit Coffee Field" : "Add Coffee Field"}
                  </h2>
                  <form onSubmit={handleFieldSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Field Name</label>
                      <input
                        type="text"
                        name="name"
                        value={fieldForm.name}
                        onChange={handleFieldChange}
                        placeholder="e.g., North Field"
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Acres</label>
                      <input
                        type="number"
                        name="acres"
                        step="0.1"
                        value={fieldForm.acres}
                        onChange={handleFieldChange}
                        placeholder="0.0"
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Coffee Variety</label>
                      <input
                        type="text"
                        name="coffeeVariety"
                        value={fieldForm.coffeeVariety}
                        onChange={handleFieldChange}
                        placeholder="e.g., Robusta"
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Number of Trees</label>
                      <input
                        type="number"
                        name="numberOfTrees"
                        value={fieldForm.numberOfTrees}
                        onChange={handleFieldChange}
                        placeholder="0"
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Year Planted</label>
                      <input
                        type="number"
                        name="yearPlanted"
                        value={fieldForm.yearPlanted}
                        onChange={handleFieldChange}
                        placeholder="e.g., 2023"
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                      <select
                        name="status"
                        value={fieldForm.status}
                        onChange={handleFieldChange}
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {fieldStatuses.map((s) => (
                          <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                      <input
                        type="text"
                        name="notes"
                        value={fieldForm.notes}
                        onChange={handleFieldChange}
                        placeholder="Additional notes"
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg active:scale-95 disabled:opacity-50 transition"
                      >
                        {loading ? "Saving..." : editingField ? "Update" : "Add Field"}
                      </button>
                      {editingField && (
                        <button type="button" onClick={handleCancelField} className="px-4 py-3 min-h-[44px] bg-gray-400 text-white rounded-lg hover:bg-gray-500 active:scale-95 transition">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">All Coffee Fields</h2>
                  {fields.length > 0 ? (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-accent">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Variety</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Acres</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Trees</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Year</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Status</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {fields.map((field) => (
                              <tr key={field.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4 font-semibold">{field.name}</td>
                                <td className="py-3 px-4">{field.coffeeVariety}</td>
                                <td className="py-3 px-4">{field.acres}</td>
                                <td className="py-3 px-4">{field.numberOfTrees}</td>
                                <td className="py-3 px-4">{field.yearPlanted}</td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                                    field.status === "active" ? "bg-green-100 text-green-700" :
                                    field.status === "mature" ? "bg-blue-100 text-blue-700" :
                                    field.status === "new" ? "bg-purple-100 text-purple-700" :
                                    "bg-gray-100 text-gray-700"
                                  }`}>
                                    {field.status}
                                  </span>
                                </td>
                                <td className="py-3 px-4 space-x-2">
                                  <button onClick={() => handleEditField(field)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">Edit</button>
                                  <button onClick={() => handleDeleteField(field.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden">
                        {fields.map((field) => (
                          <MobileTableCard
                            key={field.id}
                            fields={[
                              { label: "Name", value: field.name, highlight: true },
                              { label: "Variety", value: field.coffeeVariety },
                              { label: "Acres", value: field.acres },
                              { label: "Trees", value: field.numberOfTrees },
                              { label: "Year", value: field.yearPlanted },
                              { label: "Status", value: field.status },
                            ]}
                            actions={[
                              { label: "Edit", onClick: () => handleEditField(field), className: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700" },
                              { label: "Delete", onClick: () => handleDeleteField(field.id), className: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700" },
                            ]}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No coffee fields yet. Add your first field above!</p>
                  )}
                </div>
              </>
            )}

            {/* ═══════════════ ACTIVITIES TAB ═══════════════ */}
            {activeTab === "activities" && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-8 border-l-4 border-accent">
                  <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                    {editingActivity ? "Edit Activity" : "Record Activity"}
                  </h2>
                  <form onSubmit={handleActivitySubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Coffee Field</label>
                      <select
                        name="fieldId"
                        value={activityForm.fieldId}
                        onChange={handleActivityChange}
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      >
                        <option value="">Select field</option>
                        {fields.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Activity Type</label>
                      <select
                        name="activityType"
                        value={activityForm.activityType}
                        onChange={handleActivityChange}
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {activityTypes.map((t) => (
                          <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={activityForm.date}
                        onChange={handleActivityChange}
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Manager (Optional)</label>
                      <select
                        name="managerId"
                        value={activityForm.managerId}
                        onChange={handleActivityChange}
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        <option value="">Select manager</option>
                        {workers.map((w) => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                      <input
                        type="text"
                        name="notes"
                        value={activityForm.notes}
                        onChange={handleActivityChange}
                        placeholder="Activity notes"
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg active:scale-95 disabled:opacity-50 transition"
                      >
                        {loading ? "Saving..." : editingActivity ? "Update" : "Record"}
                      </button>
                      {editingActivity && (
                        <button type="button" onClick={handleCancelActivity} className="px-4 py-3 min-h-[44px] bg-gray-400 text-white rounded-lg hover:bg-gray-500 active:scale-95 transition">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">Activity History</h2>
                  {activities.length > 0 ? (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-accent">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Field</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Activity</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Manager</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activities.map((act) => (
                              <tr key={act.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4">{act.date ? new Date(act.date).toLocaleDateString() : "-"}</td>
                                <td className="py-3 px-4 font-semibold text-primary">{act.field?.name || "-"}</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-1 rounded-full text-xs font-bold bg-accent/20 text-accent">
                                    {act.activityType}
                                  </span>
                                </td>
                                <td className="py-3 px-4 font-semibold">{act.worker?.name || "-"}</td>
                                <td className="py-3 px-4 text-sm text-gray-500">{act.notes || "-"}</td>
                                <td className="py-3 px-4 space-x-2">
                                  <button onClick={() => handleEditActivity(act)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">Edit</button>
                                  <button onClick={() => handleDeleteActivity(act.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden">
                        {activities.map((act) => (
                          <MobileTableCard
                            key={act.id}
                            fields={[
                              { label: "Date", value: act.date ? new Date(act.date).toLocaleDateString() : "-" },
                              { label: "Field", value: act.field?.name || "-", highlight: true },
                              { label: "Activity", value: act.activityType },
                              { label: "Manager", value: act.worker?.name || "-" },
                              { label: "Notes", value: act.notes || "-", fullWidth: true },
                            ]}
                            actions={[
                              { label: "Edit", onClick: () => handleEditActivity(act), className: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700" },
                              { label: "Delete", onClick: () => handleDeleteActivity(act.id), className: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700" },
                            ]}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No activities recorded yet</p>
                  )}
                </div>
              </>
            )}

            {/* ═══════════════ HARVESTS TAB ═══════════════ */}
            {activeTab === "harvests" && (
              <>
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8 mb-8 border-l-4 border-accent">
                  <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">
                    {editingHarvest ? "Edit Harvest" : "Record Harvest"}
                  </h2>
                  <form onSubmit={handleHarvestSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Coffee Field</label>
                      <select
                        name="fieldId"
                        value={harvestForm.fieldId}
                        onChange={handleHarvestChange}
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      >
                        <option value="">Select field</option>
                        {fields.map((f) => (
                          <option key={f.id} value={f.id}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                      <input
                        type="date"
                        name="date"
                        value={harvestForm.date}
                        onChange={handleHarvestChange}
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        step="0.1"
                        value={harvestForm.quantity}
                        onChange={handleHarvestChange}
                        placeholder="0.0"
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Unit</label>
                      <select
                        name="unit"
                        value={harvestForm.unit}
                        onChange={handleHarvestChange}
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      >
                        {harvestUnits.map((u) => (
                          <option key={u} value={u}>{u.charAt(0).toUpperCase() + u.slice(1)}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Notes</label>
                      <input
                        type="text"
                        name="notes"
                        value={harvestForm.notes}
                        onChange={handleHarvestChange}
                        placeholder="Harvest notes"
                        className="w-full px-4 py-3 text-base min-h-[44px] border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full sm:w-auto px-6 py-3 min-h-[44px] bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg active:scale-95 disabled:opacity-50 transition"
                      >
                        {loading ? "Saving..." : editingHarvest ? "Update" : "Record"}
                      </button>
                      {editingHarvest && (
                        <button type="button" onClick={handleCancelHarvest} className="px-4 py-3 min-h-[44px] bg-gray-400 text-white rounded-lg hover:bg-gray-500 active:scale-95 transition">
                          Cancel
                        </button>
                      )}
                    </div>
                  </form>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-8">
                  <h2 className="text-xl sm:text-2xl font-bold font-brand text-primary mb-6">Harvest History</h2>
                  {harvests.length > 0 ? (
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b-2 border-accent">
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Date</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Field</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Quantity</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Unit</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                              <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {harvests.map((h) => (
                              <tr key={h.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                                <td className="py-3 px-4">{h.date ? new Date(h.date).toLocaleDateString() : "-"}</td>
                                <td className="py-3 px-4 font-semibold text-primary">{h.field?.name || "-"}</td>
                                <td className="py-3 px-4 font-bold">{h.quantity}</td>
                                <td className="py-3 px-4">{h.unit}</td>
                                <td className="py-3 px-4 text-sm text-gray-500">{h.notes || "-"}</td>
                                <td className="py-3 px-4 space-x-2">
                                  <button onClick={() => handleEditHarvest(h)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">Edit</button>
                                  <button onClick={() => handleDeleteHarvest(h.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Delete</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Cards */}
                      <div className="md:hidden">
                        {harvests.map((h) => (
                          <MobileTableCard
                            key={h.id}
                            fields={[
                              { label: "Date", value: h.date ? new Date(h.date).toLocaleDateString() : "-" },
                              { label: "Field", value: h.field?.name || "-", highlight: true },
                              { label: "Quantity", value: `${h.quantity} ${h.unit}` },
                              { label: "Notes", value: h.notes || "-", fullWidth: true },
                            ]}
                            actions={[
                              { label: "Edit", onClick: () => handleEditHarvest(h), className: "bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700" },
                              { label: "Delete", onClick: () => handleDeleteHarvest(h.id), className: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700" },
                            ]}
                          />
                        ))}
                      </div>
                    </>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No harvests recorded yet</p>
                  )}
                </div>
              </>
            )}
      </div>
    </main>
  );
}
