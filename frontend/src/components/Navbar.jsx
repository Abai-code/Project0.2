import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
  const avatarUrl = user?.avatar_url 
    ? (user.avatar_url.startsWith("http") ? user.avatar_url : `${API_BASE}${user.avatar_url}`)
    : null;

  return (
    <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl shadow-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
        {/* Brand */}
        <Link to="/" className="group flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-600 shadow-lg shadow-red-600/20 transition-transform group-hover:scale-110">
            <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z" />
            </svg>
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            MOVIE<span className="text-red-500">HUB</span>
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center gap-1 md:gap-6">
          <div className="hidden items-center gap-2 md:flex">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                  isActive ? "bg-white/10 text-white" : "text-slate-400 hover:text-white"
                }`
              }
            >
              Главная
            </NavLink>
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `rounded-lg px-4 py-2 text-sm font-bold transition-all ${
                    isActive ? "bg-red-500/10 text-red-500" : "text-slate-400 hover:text-white"
                  }`
                }
              >
                Панель управления
              </NavLink>
            )}
          </div>

          <div className="h-6 w-px bg-white/10 hidden md:block" />

          <div className="flex items-center gap-3">
            {!user ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="rounded-lg px-4 py-2 text-sm font-bold text-slate-300 transition-colors hover:text-white"
                >
                  Вход
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:scale-105 active:scale-95"
                >
                  Регистрация
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                <Link
                  to="/favorites"
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-slate-400 transition-all hover:bg-white/10 hover:text-red-500 active:scale-95"
                  title="Избранное"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>

                <NavLink
                  to="/profile"
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl border border-transparent p-1 pr-3 transition-all ${
                      isActive ? "bg-red-600 text-white" : "bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} className="h-8 w-8 rounded-lg object-cover shadow-inner" alt="" />
                  ) : (
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-600 text-xs font-black text-white">
                      {user.username?.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                  <span className="hidden text-sm font-black sm:inline">{user.username}</span>
                </NavLink>

                <button
                  type="button"
                  onClick={logout}
                  className="hidden h-10 items-center justify-center rounded-xl px-4 text-sm font-bold text-slate-500 transition-all hover:bg-red-500/10 hover:text-red-500 active:scale-95 md:flex"
                >
                  Выход
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

