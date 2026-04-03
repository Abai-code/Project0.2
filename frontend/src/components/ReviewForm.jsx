import { useState } from "react";
import { useTranslation } from "react-i18next";

export default function ReviewForm({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(8);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError(t("reviews.emptyError") || "Review cannot be empty");
      return;
    }
    setError("");
    onSubmit({ text: text.trim(), rating: Number(rating) });
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-800 bg-slate-900 p-4">
      <h3 className="text-lg font-semibold">{t("reviews.addTitle")}</h3>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full rounded border border-slate-700 bg-slate-950 p-3 outline-none focus:border-red-500"
        rows={4}
        placeholder={t("reviews.placeholder")}
        aria-label={t("reviews.placeholder")}
      />
      <div className="flex items-center gap-3">
        <label htmlFor="rating" className="text-sm text-slate-300">
          {t("reviews.rating")}:
        </label>
        <input
          id="rating"
          min={1}
          max={10}
          type="number"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          className="w-20 rounded border border-slate-700 bg-slate-950 p-2 outline-none focus:border-red-500"
          aria-label={t("reviews.rating")}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button
        disabled={loading}
        type="submit"
        className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? t("common.loading") : t("common.submit")}
      </button>
    </form>
  );
}
