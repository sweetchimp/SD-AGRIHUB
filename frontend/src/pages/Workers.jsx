import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import api from "../utils/api";

export default function Workers() {
  const [workers, setWorkers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ name: "", phone: "", role: "" });
  const [taskForm, setTaskForm] = useState({
    workerId: "",
    task: "",
    hours: "",
    ratePerHour: "",
    notes: "",
  });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const workerRes = await api.get("/workers");
      setWorkers(workerRes.data || []);
      const allTasks = (workerRes.data || []).flatMap((w) =>
        (w.tasks || []).map((t) => ({ ...t, workerName: w.name }))
      );
      setTasks(allTasks);
    } catch (error) {
      console.error("Fetch failed:", error);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTaskChange = (e) => {
    setTaskForm({ ...taskForm, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editing) {
        await api.put(`/workers/${editing.id}`, form);
        setMessage("✓ Worker updated");
      } else {
        await api.post("/workers", form);
        setMessage("✓ Worker added");
      }
      setForm({ name: "", phone: "", role: "" });
      setEditing(null);
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const totalAmount = parseFloat(taskForm.hours || 0) * parseFloat(taskForm.ratePerHour || 0);

    try {
      await api.post(`/workers/${taskForm.workerId}/tasks`, {
        ...taskForm,
        totalAmount,
      });
      setMessage("✓ Task recorded");
      setTaskForm({ workerId: "", task: "", hours: "", ratePerHour: "", notes: "" });
      fetchData();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      setMessage("✗ Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (worker) => {
    setEditing(worker);
    setForm({ name: worker.name, phone: worker.phone || "", role: worker.role });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this worker?")) {
      try {
        await api.delete(`/workers/${id}`);
        setMessage("✓ Worker deleted");
        fetchData();
        setTimeout(() => setMessage(""), 3000);
      } catch (error) {
        setMessage("✗ Failed to delete");
      }
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setForm({ name: "", phone: "", role: "" });
  };

  const totalPaid = tasks
    .filter((t) => t.paymentStatus === "paid")
    .reduce((sum, t) => sum + (parseFloat(t.totalAmount) || 0), 0);

  const totalPending = tasks
    .filter((t) => t.paymentStatus === "pending")
    .reduce((sum, t) => sum + (parseFloat(t.totalAmount) || 0), 0);

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-dark">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />
        <main className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold font-brand text-primary mb-8">
              👷 Workers
            </h1>

            {message && (
              <div className={`mb-6 p-4 rounded-lg ${message.includes("✓") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {message}
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-gradient-to-br from-primary to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Total Workers</p>
                <p className="text-4xl font-bold mt-2">{workers.length}</p>
              </div>
              <div className="bg-gradient-to-br from-green-400 to-green-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Paid This Month</p>
                <p className="text-3xl font-bold mt-2">{totalPaid.toLocaleString()} UGX</p>
              </div>
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-xl shadow-lg p-6">
                <p className="text-sm opacity-90">Pending Payment</p>
                <p className="text-3xl font-bold mt-2">{totalPending.toLocaleString()} UGX</p>
              </div>
            </div>

            {/* Add Worker Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border-l-4 border-accent">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">
                {editing ? "Edit Worker" : "Add Worker"}
              </h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Worker name"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+256..."
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                  <input
                    type="text"
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="e.g., Laborer"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div className="flex items-end gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2 bg-gradient-to-r from-accent to-yellow-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                  >
                    {loading ? "Saving..." : editing ? "Update" : "Add Worker"}
                  </button>
                  {editing && (
                    <button type="button" onClick={handleCancel} className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Record Task Form */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 mb-8 border-l-4 border-primary">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">Record Task</h2>
              <form onSubmit={handleTaskSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Worker</label>
                  <select
                    name="workerId"
                    value={taskForm.workerId}
                    onChange={handleTaskChange}
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  >
                    <option value="">Select worker</option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Task</label>
                  <input
                    type="text"
                    name="task"
                    value={taskForm.task}
                    onChange={handleTaskChange}
                    placeholder="e.g., Feeding animals"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Hours</label>
                  <input
                    type="number"
                    name="hours"
                    step="0.5"
                    value={taskForm.hours}
                    onChange={handleTaskChange}
                    placeholder="0.0"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Rate/Hour</label>
                  <input
                    type="number"
                    name="ratePerHour"
                    step="100"
                    value={taskForm.ratePerHour}
                    onChange={handleTaskChange}
                    placeholder="0"
                    className="w-full px-4 py-2 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-700 dark:text-white focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-2 bg-gradient-to-r from-primary to-green-600 text-white font-bold rounded-lg hover:shadow-lg disabled:opacity-50 transition"
                  >
                    {loading ? "Saving..." : "Record"}
                  </button>
                </div>
              </form>
            </div>

            {/* Workers List */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold font-brand text-primary mb-6">Workers</h2>
              {workers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-accent">
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Phone</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Role</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Tasks</th>
                        <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workers.map((worker) => {
                        const workerTasks = tasks.filter((t) => t.workerId === worker.id);
                        return (
                          <tr key={worker.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="py-3 px-4 font-semibold">{worker.name}</td>
                            <td className="py-3 px-4">{worker.phone || "-"}</td>
                            <td className="py-3 px-4">{worker.role}</td>
                            <td className="py-3 px-4">{workerTasks.length} tasks</td>
                            <td className="py-3 px-4 space-x-2">
                              <button onClick={() => handleEdit(worker)} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600">Edit</button>
                              <button onClick={() => handleDelete(worker.id)} className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600">Delete</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">No workers added yet</p>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
