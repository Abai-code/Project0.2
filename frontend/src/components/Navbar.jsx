import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-red-500">
          MovieHub
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <NavLink to="/" className="text-slate-200 hover:text-red-400">
            Главная
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="text-slate-200 hover:text-red-400">
              Admin
            </NavLink>
          )}
          {!user ? (
            <>
              <NavLink to="/login" className="text-slate-200 hover:text-red-400">
                Вход
              </NavLink>
              <NavLink to="/register" className="text-slate-200 hover:text-red-400">
                Регистрация
              </NavLink>
            </>
          ) : (
            <>
              <Link
                to="/favorites"
                className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition-all active:scale-95"
              >
                <svg className="w-4 h-4 fill-none stroke-current" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
                Избранное
              </Link>
              <NavLink
                to="/profile"
                className="flex items-center gap-2 text-slate-200 hover:text-red-400 transition-colors"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {user.username?.slice(0, 2).toUpperCase()}
                </span>
                <span className="hidden sm:inline">{user.username}</span>
              </NavLink>
              <button
                type="button"
                onClick={logout}
                className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-500"
              >
                Выйти
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
