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
