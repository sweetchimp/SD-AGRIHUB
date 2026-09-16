import { Outlet } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { DarkModeProvider } from "./contexts/DarkModeContext";

export default function App() {
  return (
    <AuthProvider>
      <DarkModeProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-dark">
          <Outlet />
        </div>
      </DarkModeProvider>
    </AuthProvider>
  );
}
