import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ username: "", password: "", confirmPassword: "", fullName: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }
    try {
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-8 w-full max-w-md border-t-4 border-accent">
        <div className="text-center mb-8">
          <img
            src="/images/logo.png"
            alt="S&D AGRIHUB"
            className="h-20 mx-auto mb-4 object-contain"
          />
          <h1 className="text-3xl font-bold font-brand text-primary mb-2">
            Create Account
          </h1>
          <p className="text-accent font-semibold text-sm">Join S&D AGRIHUB</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Your full name"
              value={form.fullName}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              name="username"
              placeholder="Choose a username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Min 8 characters"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Re-enter password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-700 rounded-lg dark:bg-gray-800 dark:text-white focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-3 rounded">
              <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-accent to-yellow-600 text-white font-bold py-3 rounded-lg hover:shadow-lg hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="mt-6 text-center border-t border-gray-200 dark:border-gray-700 pt-6">
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-accent font-bold hover:text-yellow-700 transition">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
