import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/home";
import Schedule from "./pages/schedule";
import Campus from "./pages/campus";
import Presence from "./pages/presence";
import Login from "./pages/Login";
import { PERMISSIONS, isPathAllowed } from "./utils/permissions";

function ProtectedRoute({ children, path }) {
  const userRole = localStorage.getItem("userRole");
  if (!userRole) return <Navigate to="/login" replace />;

  if (path !== "/login" && !isPathAllowed(userRole, path)) {
    const firstAllowed = PERMISSIONS[userRole]?.[0] || "/login";
    return <Navigate to={firstAllowed} replace />;
  }
  return children;
}

function App() {
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole"));

  useEffect(() => {
    const syncRole = () => setUserRole(localStorage.getItem("userRole"));
    window.addEventListener("storage", syncRole);
    return () => window.removeEventListener("storage", syncRole);
  }, []);

  return (
    <div className="app">
      {userRole && <Navbar role={userRole} />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute path="/"><Home /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute path="/schedule"><Schedule /></ProtectedRoute>} />
          <Route path="/campus" element={<ProtectedRoute path="/campus"><Campus /></ProtectedRoute>} />
          <Route path="/presence" element={<ProtectedRoute path="/presence"><Presence /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to={userRole ? (PERMISSIONS[userRole]?.[0] || "/") : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
