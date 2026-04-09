import { useEffect, useState, useRef, useCallback } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

/* ───────────────────── Helpers ─────────────────────── */

const API_BASE = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";

function resolveAvatar(url) {
  if (!url) return null;
  if (url.startsWith("http")) return url;
  return `${API_BASE}${url}`;
}

/* ───────────────────── Avatar ─────────────────────── */

function ProfileAvatar({ avatarUrl, username, size = 96, onEditClick }) {
  const initials = username ? username.slice(0, 2).toUpperCase() : "??";
  const resolved = resolveAvatar(avatarUrl);

  return (
    <div className="group relative" style={{ width: size, height: size }}>
      {resolved ? (
        <img
          src={resolved}
          alt={username}
          className="h-full w-full rounded-full object-cover shadow-xl shadow-red-600/20 ring-4 ring-slate-800"
        />
      ) : (
        <div
          className="flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-red-700 font-black text-white shadow-xl shadow-red-600/20 ring-4 ring-slate-800"
          style={{ fontSize: size * 0.3 }}
        >
          {initials}
        </div>
      )}
      {onEditClick && (
        <button
          onClick={onEditClick}
          className="absolute inset-0 flex items-center justify-center rounded-full bg-black/60 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        >
          <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ───────────────────── Role Badge ──────────────────── */

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
      {isAdmin && (
        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      )}
      {isAdmin ? "Админ" : "Пользователь"}
    </span>
  );
}

/* ───────────────────── Stat Card ──────────────────── */

function StatCard({ icon, count, label, gradient }) {
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    if (count === 0) { setDisplayed(0); return; }
    let start = 0;
    const step = Math.max(1, Math.floor(count / 20));
    const interval = setInterval(() => {
      start += step;
      if (start >= count) { setDisplayed(count); clearInterval(interval); }
      else setDisplayed(start);
    }, 40);
    return () => clearInterval(interval);
  }, [count]);

  return (
    <div className={`flex flex-1 items-center gap-4 rounded-2xl border border-slate-800 p-5 ${gradient}`}>
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-black text-white">{displayed}</p>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
      </div>
    </div>
  );
}

/* ───────────────────── Info Row ─────────────────────── */

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-4 transition-colors hover:border-slate-700">
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

/* ───────────────────── Modal Wrapper ──────────────── */

function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md animate-[modalIn_0.2s_ease-out] rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h3 className="text-lg font-bold text-white">{title}</h3>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ───────────────────── Edit Profile Modal ──────────── */

function EditProfileModal({ isOpen, onClose, profile, onSaved }) {
  const [tab, setTab] = useState("profile");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (isOpen && profile) {
      setUsername(profile.username);
      setEmail(profile.email);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setError("");
      setSuccess("");
      setTab("profile");
    }
  }, [isOpen, profile]);

  async function handleProfileSave() {
    setError(""); setSuccess(""); setSaving(true);
    try {
      const res = await client.put("/users/update", { username, email });
      onSaved(res.data);
      setSuccess("Профиль обновлён!");
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка обновления");
    } finally {
      setSaving(false);
    }
  }

  async function handlePasswordSave() {
    setError(""); setSuccess("");
    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    if (newPassword.length < 8) {
      setError("Пароль минимум 8 символов");
      return;
    }
    setSaving(true);
    try {
      await client.put("/users/update", { currentPassword, newPassword });
      setSuccess("Пароль изменён!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка смены пароля");
    } finally {
      setSaving(false);
    }
  }

  const tabClass = (t) =>
    `flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
      tab === t
        ? "bg-red-600 text-white shadow-lg shadow-red-600/30"
        : "text-slate-400 hover:text-slate-200"
    }`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Редактирование профиля">
      {/* Tabs */}
      <div className="mb-5 flex gap-1 rounded-xl bg-slate-800/70 p-1">
        <button className={tabClass("profile")} onClick={() => { setTab("profile"); setError(""); setSuccess(""); }}>
          Профиль
        </button>
        <button className={tabClass("password")} onClick={() => { setTab("password"); setError(""); setSuccess(""); }}>
          Пароль
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-2 text-sm text-green-400">
          {success}
        </div>
      )}

      {tab === "profile" ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Имя пользователя
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500"
            />
          </div>
          <button
            onClick={handleProfileSave}
            disabled={saving}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сохранить"}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Текущий пароль
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Новый пароль
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-bold uppercase tracking-widest text-slate-500">
              Подтвердите пароль
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition-colors focus:border-red-500"
            />
          </div>
          <button
            onClick={handlePasswordSave}
            disabled={saving}
            className="w-full rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Сохранение..." : "Сменить пароль"}
          </button>
        </div>
      )}
    </Modal>
  );
}

/* ───────────────────── Avatar Modal ───────────────── */

function AvatarModal({ isOpen, onClose, currentAvatar, username, onSaved }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInput = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setPreview(null);
      setFile(null);
      setError("");
    }
  }, [isOpen]);

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Файл слишком большой (макс. 5 МБ)");
      return;
    }
    setError("");
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(f);
  }, []);

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer?.files?.[0];
    handleFile(f);
  }

  async function handleUpload() {
    if (!file) return;
    setSaving(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("avatar", file);
      const res = await client.post("/users/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      onSaved(res.data.avatarUrl);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка загрузки");
    } finally {
      setSaving(false);
    }
  }

  async function handleRandom() {
    setSaving(true);
    setError("");
    try {
      const res = await client.post("/users/avatar/random");
      onSaved(res.data.avatarUrl);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Ошибка генерации");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Изменить аватар">
      {error && (
        <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Preview */}
      <div className="mb-5 flex justify-center">
        <ProfileAvatar
          avatarUrl={preview || currentAvatar}
          username={username}
          size={120}
        />
      </div>

      {/* Drop Zone */}
      <div
        className={`mb-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-colors ${
          dragging
            ? "border-red-500 bg-red-500/10"
            : "border-slate-700 bg-slate-800/50 hover:border-slate-500"
        }`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInput.current?.click()}
      >
        <svg className="mb-2 h-8 w-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 4.502 4.502 0 013.516 5.307A4.5 4.5 0 0118 19.5H6.75z" />
        </svg>
        <p className="text-sm text-slate-400">
          {file ? file.name : "Перетащите или нажмите для выбора"}
        </p>
        <p className="mt-1 text-[11px] text-slate-600">JPEG, PNG, WebP, GIF • до 5 МБ</p>
        <input
          ref={fileInput}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleUpload}
          disabled={!file || saving}
          className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 active:scale-[0.98] disabled:opacity-40"
        >
          {saving ? "Загрузка..." : "Сохранить"}
        </button>
        <button
          onClick={handleRandom}
          disabled={saving}
          className="flex-1 rounded-xl border border-slate-700 bg-slate-800 py-3 text-sm font-bold text-slate-300 transition-all hover:border-slate-500 hover:text-white active:scale-[0.98] disabled:opacity-40"
        >
          🎲 Случайный
        </button>
      </div>
    </Modal>
  );
}

/* ═══════════════════ PROFILE PAGE ═══════════════════ */

export default function ProfilePage() {
  const { user: authUser, loading: authLoading, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ ratingsCount: 0, reviewsCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  useEffect(() => {
    if (!authUser) return;
    Promise.all([
      client.get("/users/me"),
      client.get("/users/me/stats")
    ])
      .then(([profileRes, statsRes]) => {
        setProfile(profileRes.data);
        setStats(statsRes.data);
      })
      .catch(() => setError("Ошибка загрузки профиля"))
      .finally(() => setLoading(false));
  }, [authUser]);

  function handleProfileSaved(data) {
    setProfile((prev) => ({ ...prev, ...data }));
    updateUser(data);
  }

  function handleAvatarSaved(avatarUrl) {
    setProfile((prev) => ({ ...prev, avatar_url: avatarUrl }));
    updateUser({ avatar_url: avatarUrl });
  }

  if (authLoading) return <LoadingSpinner />;
  if (!authUser) return <Navigate to="/login" replace />;
  if (loading) return <LoadingSpinner />;

  if (error) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
        <p className="text-red-400 font-medium">{error}</p>
        <Link to="/" className="mt-4 inline-block text-sm text-slate-400 hover:text-white">
          На главную
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Inline keyframes */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>

      <section className="mx-auto max-w-2xl space-y-6">
        {/* ─── Hero Card ─── */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">
          {/* Gradient header */}
          <div className="h-32 bg-gradient-to-br from-red-900/60 via-slate-900 to-slate-900">
            <div className="absolute inset-0 h-32 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.15),transparent_60%)]" />
          </div>

          <div className="px-6 pb-6">
            <div className="-mt-14 flex items-end gap-5">
              <ProfileAvatar
                avatarUrl={profile.avatar_url}
                username={profile.username}
                size={108}
                onEditClick={() => setAvatarOpen(true)}
              />
              <div className="mb-1 min-w-0">
                <h1 className="truncate text-2xl font-black text-white">{profile.username}</h1>
                <div className="mt-1 flex items-center gap-3">
                  <RoleBadge role={profile.role} />
                  <span className="text-xs text-slate-600">ID #{profile.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ─── Statistics ─── */}
        <div className="flex gap-4">
          <StatCard
            icon="⭐"
            count={stats.ratingsCount}
            label="оценок"
            gradient="bg-gradient-to-br from-amber-500/10 to-transparent"
          />
          <StatCard
            icon="💬"
            count={stats.reviewsCount}
            label="отзывов"
            gradient="bg-gradient-to-br from-blue-500/10 to-transparent"
          />
        </div>

        {/* ─── Account Info ─── */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-500">
            Данные аккаунта
          </h2>
          <div className="space-y-3">
            <InfoRow icon="👤" label="Имя пользователя" value={profile.username} />
            <InfoRow icon="📧" label="Email" value={profile.email} />
            <InfoRow
              icon={profile.role === "admin" ? "⚡" : "🎬"}
              label="Роль"
              value={profile.role === "admin" ? "Администратор" : "Пользователь"}
            />
          </div>
        </div>

        {/* ─── Actions ─── */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 active:scale-95"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Редактировать профиль
          </button>
          <Link
            to="/"
            className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:border-slate-600 hover:text-white active:scale-95"
          >
            На главную
          </Link>
          {profile.role === "admin" && (
            <Link
              to="/admin"
              className="flex items-center gap-2 rounded-xl border border-red-600/40 bg-red-600/10 px-5 py-2.5 text-sm font-semibold text-red-400 transition-all hover:bg-red-600/20 hover:text-red-300 active:scale-95"
            >
              Панель админа
            </Link>
          )}
        </div>
      </section>

      {/* ─── Modals ─── */}
      <EditProfileModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        profile={profile}
        onSaved={handleProfileSaved}
      />
      <AvatarModal
        isOpen={avatarOpen}
        onClose={() => setAvatarOpen(false)}
        currentAvatar={profile.avatar_url}
        username={profile.username}
        onSaved={handleAvatarSaved}
      />
    </>
  );
}
