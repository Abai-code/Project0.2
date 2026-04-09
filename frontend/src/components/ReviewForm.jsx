import { useState } from "react";

export default function ReviewForm({ onSubmit, loading }) {
  const [text, setText] = useState("");
  const [rating, setRating] = useState(8);
  const [error, setError] = useState("");
  const [hoverRating, setHoverRating] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) {
      setError("Отзыв не может быть пустым");
      return;
    }
    setError("");
    onSubmit({ text: text.trim(), rating: Number(rating) });
    setText("");
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6 rounded-2xl bg-slate-900/50 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur-sm"
    >
      <div className="space-y-1">
        <h3 className="text-xl font-black text-white">Оставить отзыв</h3>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Поделитесь своим мнением о фильме</p>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Ваша оценка</label>
        <div className="flex items-center gap-1.5">
          {[...Array(10)].map((_, i) => {
            const starValue = i + 1;
            const isActive = starValue <= (hoverRating || rating);
            return (
              <button
                key={starValue}
                type="button"
                onClick={() => setRating(starValue)}
                onMouseEnter={() => setHoverRating(starValue)}
                onMouseLeave={() => setHoverRating(0)}
                className={`transition-all duration-200 ${isActive ? "scale-110 text-orange-500" : "text-slate-700 hover:text-slate-500"} active:scale-95`}
                aria-label={`Оценка ${starValue}`}
              >
                <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
            );
          })}
          <span className="ml-3 text-lg font-black text-white">{hoverRating || rating}</span>
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Текст отзыва</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full rounded-xl border-none bg-slate-950/50 p-4 text-slate-200 outline-none ring-1 ring-white/10 transition-all focus:bg-slate-950 focus:ring-2 focus:ring-red-500/50"
          rows={5}
          placeholder="Что вы думаете об этом фильме?..."
          aria-label="Ваш отзыв"
        />
      </div>

      {error && <p className="text-sm font-bold text-red-500">{error}</p>}

      <button
        disabled={loading}
        type="submit"
        className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-red-600 py-4 text-sm font-black text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 hover:scale-[1.02] active:scale-95 disabled:opacity-50"
      >
        <span>{loading ? "Отправка..." : "Опубликовать отзыв"}</span>
        {!loading && (
          <svg className="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        )}
      </button>
    </form>
  );
}
