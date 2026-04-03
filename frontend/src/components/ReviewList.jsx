import { useTranslation } from "react-i18next";

export default function ReviewList({ reviews, onLike, canLike }) {
  const { t, i18n } = useTranslation();

  const getLocale = () => {
    if (i18n.language === "kz") return "kk-KZ";
    if (i18n.language === "en") return "en-US";
    return "ru-RU";
  };

  if (reviews.length === 0) {
    return <p className="text-slate-400">{t("reviews.noReviews") || "No reviews yet."}</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-slate-100">{review.username}</span>
            <span className="text-sm text-yellow-400">{t("reviews.rating")}: {review.rating}/10</span>
          </div>
          <p className="text-slate-300">{review.text}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {new Date(review.created_at).toLocaleString(getLocale())}
            </span>
            <button
              type="button"
              disabled={!canLike}
              onClick={() => onLike(review.id)}
              className="rounded bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
              aria-label={`Like review by ${review.username}`}
            >
              Like {review.likes}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
