import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage({ setToast }) {
  const navigate = useNavigate();
  const { login } = useAuth();

  const RULES = [
    { id: "length", label: "Минимум 8 символов", test: (p) => p.length >= 8 },
    { id: "upper", label: "Заглавная буква (A-Z)", test: (p) => /[A-Z]/.test(p) },
    { id: "lower", label: "Строчная буква (a-z)", test: (p) => /[a-z]/.test(p) },
    { id: "digit", label: "Цифра (0-9)", test: (p) => /\d/.test(p) },
    { id: "special", label: "Спецсимвол (!@#$%^&*)", test: (p) => /[@$!%*?&#^()\-_=+]/.test(p) },
  ];

  function getStrength(password, passedCount) {
    if (!password) return null;
    if (passedCount <= 2) return { label: "Слабый", color: "bg-red-500", width: "w-1/3" };
    if (passedCount <= 4) return { label: "Средний", color: "bg-yellow-400", width: "w-2/3" };
    return { label: "Сильный", color: "bg-green-500", width: "w-full" };
  }

  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (name === "password") setShowRules(true);
  };

  const ruleResults = useMemo(
    () => RULES.map((r) => ({ ...r, passed: r.test(form.password) })),
    [form.password, RULES]
  );
  const passedCount = ruleResults.filter((r) => r.passed).length;
  const allPassed = passedCount === RULES.length;
  const strength = getStrength(form.password, passedCount);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      setError("Заполните все поля");
      return;
    }

    if (form.username.length < 3) {
      setError("Имя пользователя должно содержать минимум 3 символа");
      return;
    }

    const usernameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9]{3,20}$/;
    if (!usernameRegex.test(form.username)) {
      setError("Имя пользователя не может состоять только из цифр");
      return;
    }

    if (!allPassed) {
      setError("Пароль не соответствует требованиям безопасности");
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await client.post("/auth/register", form);
      login(res.data);
      setToast({ type: "success", message: "Регистрация выполнена" });
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || "Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  };

  const baseInput =
    "w-full rounded border border-slate-700 bg-slate-950 p-3 outline-none focus:border-red-500 text-slate-100 transition-colors";

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">Создать аккаунт</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          name="username"
          type="text"
          placeholder="Имя пользователя"
          value={form.username}
          onChange={onChange}
          className={baseInput}
          aria-label="Имя пользователя"
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={onChange}
          className={baseInput}
          aria-label="Email"
        />

        <div className="space-y-2">
          <input
            name="password"
            type="password"
            placeholder="Пароль"
            value={form.password}
            onChange={onChange}
            className={`${baseInput} ${
              showRules && form.password && !allPassed
                ? "border-red-500"
                : showRules && allPassed
                ? "border-green-500"
                : ""
            }`}
            aria-label="Пароль"
          />

          {showRules && form.password && strength && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-700">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${strength.color} ${strength.width}`}
                  />
                </div>
                <span
                  className={`text-xs font-bold ${
                    strength.label === "Сильный"
                      ? "text-green-400"
                      : strength.label === "Средний"
                      ? "text-yellow-400"
                      : "text-red-400"
                  }`}
                >
                  {strength.label}
                </span>
              </div>

              <ul className="space-y-1 rounded-lg border border-slate-700 bg-slate-950 p-3">
                {ruleResults.map((rule) => (
                  <li key={rule.id} className="flex items-center gap-2 text-sm">
                    <span
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                        rule.passed ? "bg-green-500 text-white" : "bg-slate-700 text-slate-400"
                      }`}
                    >
                      {rule.passed ? "OK" : "X"}
                    </span>
                    <span className={rule.passed ? "text-green-400" : "text-slate-400"}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-lg bg-red-500/10 p-3 text-sm font-medium text-red-400">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-red-600 py-2.5 font-semibold text-white transition-all hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
        >
          {loading ? "Загрузка..." : "Зарегистрироваться"}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        Уже есть аккаунт?{" "}
        <Link to="/login" className="text-red-400 hover:text-red-300">
          Войдите
        </Link>
      </p>
    </section>
  );
}
