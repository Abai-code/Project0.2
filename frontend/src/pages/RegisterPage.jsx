import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage({ setToast }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useTranslation();

  const RULES = [
    { id: "length", label: t("passwordRules.length"), test: (p) => p.length >= 8 },
    { id: "upper", label: t("passwordRules.upper"), test: (p) => /[A-Z]/.test(p) },
    { id: "lower", label: t("passwordRules.lower"), test: (p) => /[a-z]/.test(p) },
    { id: "digit", label: t("passwordRules.digit"), test: (p) => /\d/.test(p) },
    { id: "special", label: t("passwordRules.special"), test: (p) => /[@$!%*?&#^()\-_=+]/.test(p) },
  ];

  function getStrength(password, passedCount) {
    if (!password) return null;
    if (passedCount <= 2) return { label: t("passwordRules.weak"), color: "bg-red-500", width: "w-1/3" };
    if (passedCount <= 4) return { label: t("passwordRules.medium"), color: "bg-yellow-400", width: "w-2/3" };
    return { label: t("passwordRules.strong"), color: "bg-green-500", width: "w-full" };
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
      setError(t("auth.fillAll"));
      return;
    }
    if (!allPassed) {
      setError(t("auth.passwordSafetyError"));
      return;
    }
    try {
      setLoading(true);
      setError("");
      const res = await client.post("/auth/register", form);
      login(res.data);
      setToast({ type: "success", message: t("auth.registerSuccess") });
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || t("admin.loadError"));
    } finally {
      setLoading(false);
    }
  };

  const baseInput =
    "w-full rounded border border-slate-700 bg-slate-950 p-3 outline-none focus:border-red-500 text-slate-100 transition-colors";

  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="mb-6 text-2xl font-bold text-slate-100">{t("auth.registerTitle")}</h1>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          name="username"
          type="text"
          placeholder={t("auth.username")}
          value={form.username}
          onChange={onChange}
          className={baseInput}
          aria-label={t("auth.username")}
        />

        <input
          name="email"
          type="email"
          placeholder={t("auth.email")}
          value={form.email}
          onChange={onChange}
          className={baseInput}
          aria-label={t("auth.email")}
        />

        <div className="space-y-2">
          <input
            name="password"
            type="password"
            placeholder={t("auth.password")}
            value={form.password}
            onChange={onChange}
            className={`${baseInput} ${
              showRules && form.password && !allPassed
                ? "border-red-500"
                : showRules && allPassed
                ? "border-green-500"
                : ""
            }`}
            aria-label={t("auth.password")}
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
                    strength.label === t("passwordRules.strong")
                      ? "text-green-400"
                      : strength.label === t("passwordRules.medium")
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
          {loading ? t("common.loading") : t("auth.registerBtn")}
        </button>
      </form>

      <p className="mt-4 text-sm text-slate-400">
        {t("auth.hasAccount")}{" "}
        <Link to="/login" className="text-red-400 hover:text-red-300">
          {t("auth.loginLink")}
        </Link>
      </p>
    </section>
  );
}
