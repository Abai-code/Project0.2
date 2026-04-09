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
    <article className="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900 shadow-lg transition-all duration-300 hover:-translate-y-2 hover:border-red-500/50 hover:shadow-2xl hover:shadow-red-500/10">
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-950">
        <img
          src={movie.image}
          alt={`${movie.title} poster`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:brightness-50"
          loading="lazy"
        />
        
        {/* Play Icon Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
            <svg className="h-6 w-6 fill-current" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />

        <button
          onClick={handleToggleFavorite}
          disabled={isLiking}
          aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          className={`absolute top-3 right-3 z-20 flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md border transition-all active:scale-90 ${
            isFavorited
              ? "bg-red-500 border-red-400 text-white shadow-lg shadow-red-500/40"
              : "bg-slate-950/40 border-white/10 text-white hover:bg-slate-950/60 hover:scale-110"
          }`}
        >
          <svg
            className={`w-4.5 h-4.5 transition-transform ${isLiking ? "animate-pulse" : ""} ${isFavorited ? "fill-current" : "fill-none stroke-current"}`}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Floating Rating Badge */}
        {movie.rating > 0 && (
          <div className="absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-md bg-black/60 px-2 py-1 text-xs font-bold text-orange-500 backdrop-blur-sm ring-1 ring-white/10">
            <span>⭐</span> {movie.rating}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="line-clamp-1 text-base font-bold text-slate-100 group-hover:text-red-500 transition-colors">
          {movie.title}
        </h3>
        <div className="mt-1 flex items-center justify-between text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          <span>{movie.genre || "Кино"}</span>
          <span>{movie.year || "—"}</span>
        </div>
        
        <div className="mt-4 flex gap-2">
          <Link
            to={`/watch/${movie.id}`}
            className="flex-1 rounded-lg bg-red-600 px-3 py-2 text-center text-xs font-bold text-white transition-all hover:bg-red-500 active:scale-95"
          >
            Смотреть
          </Link>
          <Link
            to={`/movies/${movie.id}`}
            className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-center text-xs font-bold text-slate-200 transition-all hover:bg-slate-700 active:scale-95 border border-slate-700"
          >
            Инфо
          </Link>
        </div>
      </div>
    </article>
  );
}
