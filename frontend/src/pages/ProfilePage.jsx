import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

// Аватар на основе первой буквы имени
function Avatar({ username }) {
  const initials = username ? username.slice(0, 2).toUpperCase() : "??";
  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 text-3xl font-black text-white shadow-xl shadow-red-600/30 ring-4 ring-slate-800">
      {initials}
    </div>
  );
}

// Бейдж роли
function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
        isAdmin
          ? "bg-red-500/15 text-red-400 ring-1 ring-red-500/30"
          : "bg-slate-700/50 text-slate-400 ring-1 ring-slate-600"
      }`}
    >
      {isAdmin ? "⭐ Администратор" : "👤 Пользователь"}
    </span>
  );
}

// Строка с данными
function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-xl">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{label}</p>
        <p className="truncate font-semibold text-slate-100">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading]  = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!authUser) return;
    client
      .get("/users/me")
      .then((res) => setProfile(res.data))
      .catch(() => setError("Не удалось загрузить профиль"))
      .finally(() => setLoading(false));
  }, [authUser]);

  // Ждём проверку авторизации
  if (authLoading) return <LoadingSpinner />;

  // Не авторизован — редирект
  if (!authUser) return <Navigate to="/login" replace />;

  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-slate-400 hover:text-white">
          ← На главную
        </Link>
      </div>
    );
  }

  const joinDate = new Date().toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section className="mx-auto max-w-2xl space-y-6">
      {/* Шапка */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
        {/* Декоративный градиент */}
        <div className="h-28 bg-gradient-to-br from-red-900/60 via-slate-900 to-slate-900" />

        {/* Аватар и базовая инфо */}
        <div className="px-6 pb-6">
          <div className="-mt-12 flex items-end gap-5">
            <Avatar username={profile.username} />
            <div className="mb-1 min-w-0">
              <h1 className="truncate text-2xl font-black text-white">
                {profile.username}
              </h1>
              <RoleBadge role={profile.role} />
            </div>
          </div>
        </div>
      </div>

      {/* Карточка с данными */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">
          Информация об аккаунте
        </h2>
        <div className="space-y-3">
          <InfoRow icon="👤" label="Имя пользователя" value={profile.username} />
          <InfoRow icon="📧" label="Email"            value={profile.email} />
          <InfoRow
            icon={profile.role === "admin" ? "⭐" : "🎬"}
            label="Роль"
            value={profile.role === "admin" ? "Администратор" : "Пользователь"}
          />
          <InfoRow icon="🆔" label="ID аккаунта" value={`#${profile.id}`} />
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex flex-wrap gap-3">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-600 hover:text-white active:scale-95"
        >
          ← На главную
        </Link>
        {profile.role === "admin" && (
          <Link
            to="/admin"
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 active:scale-95"
          >
            ⚙️ Панель администратора
          </Link>
        )}
      </div>
    </section>
  );
}
