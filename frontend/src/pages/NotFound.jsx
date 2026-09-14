import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <p className="text-2xl text-gray-700 dark:text-gray-300 mt-4">Page Not Found</p>
        <Link to="/dashboard" className="mt-6 inline-block px-6 py-3 bg-primary text-white rounded-lg hover:bg-green-700">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
