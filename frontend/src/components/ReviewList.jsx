export default function ReviewList({ reviews, onLike, canLike }) {
  if (reviews.length === 0) {
    return <p className="text-slate-400">Пока нет отзывов.</p>;
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <article key={review.id} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-medium text-slate-100">{review.username}</span>
            <span className="text-sm text-yellow-400">Оценка: {review.rating}/10</span>
          </div>
          <p className="text-slate-300">{review.text}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {new Date(review.created_at).toLocaleString("ru-RU")}
            </span>
            <button
              type="button"
              disabled={!canLike}
              onClick={() => onLike(review.id)}
              className="rounded bg-slate-800 px-3 py-1 text-sm hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              👍 {review.likes}
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}
