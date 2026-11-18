import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import MapPage from "./pages/MapPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ReportPage from "./pages/ReportPage";
import ForumPage from "./pages/ForumPage";
import EmergencyPage from "./pages/EmergencyPage";
import ProfilePage from "./pages/ProfilePage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><span className="loader" />Preparing your safe space…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <div className="app-shell">
      <Navbar />
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/emergency" element={<EmergencyPage />} />
        <Route path="/report" element={<PrivateRoute><ReportPage /></PrivateRoute>} />
        <Route path="/forum" element={<PrivateRoute><ForumPage /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return <AuthProvider><BrowserRouter><AppRoutes /></BrowserRouter></AuthProvider>;
}