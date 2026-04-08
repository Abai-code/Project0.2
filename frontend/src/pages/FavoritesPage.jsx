import { useEffect, useState } from "react";
import client from "../api/client";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";

export default function FavoritesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await client.get("/favorites");
      setMovies(res.data);
    } catch (err) {
      setError("Ошибка загрузки избранного");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  if (loading) return <LoadingSpinner />;

  return (
    <section className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">
          Ваша <span className="text-red-500">Подборка</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl">
          Тут хранятся фильмы, которые вам понравились.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-center">
          <p className="text-red-400">{error}</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center space-y-4 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-900/20">
          <div className="text-6xl text-slate-700">+</div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-slate-300">Список пуст</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              Добавляйте понравившиеся фильмы, нажав на иконку в каталоге.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}
    </section>
  );
}
