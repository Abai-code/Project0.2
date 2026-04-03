import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const LANGUAGES = [
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
  { code: "kz", label: "KZ" },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { t, i18n } = useTranslation();

  const changeLang = (code) => {
    i18n.changeLanguage(code);
  };

  return (
    <nav className="sticky top-0 z-20 border-b border-slate-800 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-xl font-bold text-red-500">
          MovieHub
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <NavLink to="/" className="text-slate-200 hover:text-red-400">
            {t("nav.home")}
          </NavLink>
          {isAdmin && (
            <NavLink to="/admin" className="text-slate-200 hover:text-red-400">
              {t("nav.admin")}
            </NavLink>
          )}
          {!user ? (
            <>
              <NavLink to="/login" className="text-slate-200 hover:text-red-400">
                {t("nav.login")}
              </NavLink>
              <NavLink to="/register" className="text-slate-200 hover:text-red-400">
                {t("nav.register")}
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
                {t("nav.favorites")}
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
                {t("nav.logout")}
              </button>
            </>
          )}

          {/* Language Switcher */}
          <div className="flex items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-900 p-0.5">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLang(lang.code)}
                className={`rounded-md px-2.5 py-1 text-xs font-bold transition-all ${
                  i18n.language === lang.code
                    ? "bg-red-600 text-white shadow"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
