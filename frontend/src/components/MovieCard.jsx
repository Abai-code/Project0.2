import { Link } from "react-router-dom";

export default function MovieCard({ movie }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow transition hover:-translate-y-1 hover:border-red-500">
      <div className="relative h-64 w-full overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-xl opacity-40"
          style={{ backgroundImage: `url(${movie.image})` }}
        />
        <img
          src={movie.image}
          alt={movie.title}
          className="relative z-10 h-64 w-full object-contain"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-slate-100">{movie.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-400">{movie.description}</p>
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="rounded bg-slate-800 px-2 py-1 text-xs text-yellow-500 font-bold">
              ★ {movie.rating || 0}
            </span>
            <span className="text-xs text-slate-500">{movie.year || "Неизвестно"}</span>
          </div>
          <div className="flex gap-2">
            <Link
              to={`/watch/${movie.id}`}
              className="flex-1 rounded bg-red-600 px-3 py-2 text-center text-xs font-bold text-white hover:bg-red-500 transition-colors"
            >
              Смотреть
            </Link>
            <Link
              to={`/movies/${movie.id}`}
              className="flex-1 rounded bg-slate-800 px-3 py-2 text-center text-xs font-bold text-slate-200 hover:bg-slate-700 transition-colors border border-slate-700"
            >
              Подробнее
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
