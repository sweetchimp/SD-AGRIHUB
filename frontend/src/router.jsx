import { createBrowserRouter, Navigate } from "react-router-dom";
import App from "./App";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Animals from "./pages/Animals";
import Coffee from "./pages/Coffee";
import Production from "./pages/Production";
import Expenses from "./pages/Expenses";
import Sales from "./pages/Sales";
import Workers from "./pages/Workers";
import Inventory from "./pages/Inventory";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <NotFound />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      {
        element: <Layout />,
        children: [
          { path: "dashboard", element: <Dashboard /> },
          { path: "animals", element: <Animals /> },
          { path: "coffee", element: <Coffee /> },
          { path: "production", element: <Production /> },
          { path: "expenses", element: <Expenses /> },
          { path: "sales", element: <Sales /> },
          { path: "workers", element: <Workers /> },
          { path: "inventory", element: <Inventory /> },
          { path: "calendar", element: <Calendar /> },
          { path: "reports", element: <Reports /> },
        ],
      },
      { path: "*", element: <NotFound /> },
    ],
  },
]);

export default router;
