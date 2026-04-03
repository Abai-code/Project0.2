import { useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import AuthForm from "../components/AuthForm";
import { useAuth } from "../context/AuthContext";

export default function LoginPage({ setToast }) {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Заполните все поля");
      return;
    }
    try {
      setLoading(true);
      const res = await client.post("/auth/login", form);
      login(res.data);
      setToast({ type: "success", message: "Успешный вход" });
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || "Ошибка входа");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Вход"
      fields={[
        { name: "email", type: "email", placeholder: "Email", value: form.email },
        { name: "password", type: "password", placeholder: "Пароль", value: form.password },
      ]}
      error={error}
      loading={loading}
      submitLabel="Войти"
      loadingLabel="Вход..."
      footerText="Нет аккаунта?"
      footerLinkTo="/register"
      footerLinkLabel="Зарегистрироваться"
      onChange={onChange}
      onSubmit={onSubmit}
    />
  );
}
