export default function ReviewList({ reviews, onLike, canLike }) {
  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-900/30 p-12 text-center ring-1 ring-white/5">
        <svg className="mb-4 h-12 w-12 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-slate-500 font-medium italic">Для этого фильма пока нет отзывов. Станьте первым!</p>
      </div>
    );
  }

  const getRatingColor = (rating) => {
    if (rating >= 8) return "bg-green-500/10 text-green-400 ring-green-500/20";
    if (rating >= 5) return "bg-orange-500/10 text-orange-400 ring-orange-500/20";
    return "bg-red-500/10 text-red-400 ring-red-500/20";
  };

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <article 
          key={review.id} 
          className="group relative rounded-2xl bg-slate-900/50 p-6 shadow-lg ring-1 ring-white/5 transition-all hover:bg-slate-900/80 hover:ring-white/10"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-slate-700 to-slate-800 text-xs font-black text-white shadow-inner">
                {review.username?.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <span className="block font-black text-slate-100">{review.username}</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  {new Date(review.created_at).toLocaleDateString("ru-RU", { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
            <div className={`rounded-lg px-2.5 py-1 text-sm font-black ring-1 ${getRatingColor(review.rating)}`}>
              {review.rating}.0
            </div>
          </div>

          <p className="text-base italic leading-relaxed text-slate-300">
            "{review.text}"
          </p>

          <div className="mt-6 flex items-center justify-end">
            <button
              type="button"
              disabled={!canLike}
              onClick={() => onLike(review.id)}
              className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95 ${
                review.likes > 0 
                  ? "bg-red-500/10 text-red-500 ring-1 ring-red-500/20" 
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              <svg className={`h-4 w-4 ${review.likes > 0 ? "fill-current" : "fill-none stroke-current"}`} viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{review.likes}</span>
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

