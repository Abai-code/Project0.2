import { useEffect, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Toast from "./components/Toast";
import { useAuth } from "./context/AuthContext";
import AdminDashboard from "./pages/AdminDashboard";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MoviePage from "./pages/MoviePage";
import NotFoundPage from "./pages/NotFoundPage";
import RegisterPage from "./pages/RegisterPage";
import FavoritesPage from "./pages/FavoritesPage";
import WatchPage from "./pages/WatchPage";
import ProfilePage from "./pages/ProfilePage";
import { ThemeProvider } from "./context/ThemeContext";

function AuthRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) {
    return <p className="p-6 text-slate-400">Загрузка...</p>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();
  if (loading) {
    return <p className="p-6 text-slate-400">Загрузка...</p>;
  }
  if (!user || !isAdmin) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  const [toast, setToast] = useState({ message: "", type: "success" });

  useEffect(() => {
    if (!toast.message) return undefined;
    const timer = setTimeout(() => setToast({ message: "", type: "success" }), 2500);
    return () => clearTimeout(timer);
  }, [toast.message]);

  const location = useLocation();
  const isWatchPage = location.pathname.startsWith("/watch/");

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {!isWatchPage && <Navbar />}
        <main className={isWatchPage ? "flex-1" : "mx-auto max-w-6xl px-4 py-6 flex-1 w-full"}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/watch/:id" element={<WatchPage />} />
            <Route path="/movies/:id" element={<MoviePage setToast={setToast} />} />
            <Route path="/login" element={<LoginPage setToast={setToast} />} />
            <Route path="/register" element={<RegisterPage setToast={setToast} />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/favorites" element={<AuthRoute><FavoritesPage /></AuthRoute>} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboard setToast={setToast} />
                </AdminRoute>
              }
            />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        {!isWatchPage && <Footer />}
        <Toast message={toast.message} type={toast.type} />
      </div>
    </ThemeProvider>
  );
}
