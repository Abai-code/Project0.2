import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

export default function LoginPage({ setToast }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError(t("auth.fillAll"));
      return;
    }
    try {
      setLoading(true);
      const res = await client.post("/auth/login", form);
      login(res.data);
      setToast({ type: "success", message: t("auth.loginSuccess") });
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || t("admin.loadError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title={t("auth.loginTitle")}
      fields={[
        { name: "email", type: "email", label: t("auth.email"), placeholder: t("auth.email"), value: form.email },
        { name: "password", type: "password", label: t("auth.password"), placeholder: t("auth.password"), value: form.password },
      ]}
      error={error}
      loading={loading}
      submitLabel={t("auth.loginBtn")}
      loadingLabel={t("common.loading")}
      footerText={t("auth.noAccount")}
      footerLinkTo="/register"
      footerLinkLabel={t("auth.registerLink")}
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
