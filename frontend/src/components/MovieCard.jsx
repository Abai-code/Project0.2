import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import client from "../api/client";

export default function MovieCard({ movie }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isFavorited, setIsFavorited] = useState(movie.is_favorite);
  const [isLiking, setIsLiking] = useState(false);

  const handleToggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      navigate("/login");
      return;
    }

    try {
      setIsLiking(true);
      if (isFavorited) {
        await client.delete(`/favorites/${movie.id}`);
        setIsFavorited(false);
      } else {
        await client.post("/favorites", { movieId: movie.id });
        setIsFavorited(true);
      }
    } catch (error) {
      console.error("Favorite toggle error", error);
    } finally {
      setIsLiking(false);
    }
  };

  return (
    <article className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow transition hover:-translate-y-1 hover:border-red-500">
      <div className="relative h-64 w-full overflow-hidden bg-slate-950">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center blur-xl opacity-40 transition-transform group-hover:scale-125"
          style={{ backgroundImage: `url(${movie.image})` }}
        />
        <img
          src={movie.image}
          alt={`${movie.title} poster`}
          className="relative z-10 h-64 w-full object-contain"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />

        <button
          onClick={handleToggleFavorite}
          disabled={isLiking}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-md border transition-all active:scale-90 ${
            isFavorited
              ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40"
              : "bg-slate-950/40 border-white/10 text-white hover:bg-slate-950/60 hover:scale-110"
          }`}
        >
          <svg
            className={`w-5 h-5 transition-transform ${isLiking ? "animate-pulse" : ""} ${isFavorited ? "fill-current" : "fill-none stroke-current"}`}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>
      </div>
      <div className="space-y-2 p-4">
        <h3 className="line-clamp-1 text-lg font-semibold text-slate-100">{movie.title}</h3>
        <p className="line-clamp-2 text-sm text-slate-400">{movie.description}</p>
        <div className="flex flex-col gap-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="rounded bg-slate-800 px-2 py-1 text-xs text-yellow-500 font-bold">
              Рейтинг: {movie.rating || 0}
            </span>
            <span className="text-xs text-slate-500">{movie.year || "Нет"}</span>
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
              О фильме
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
