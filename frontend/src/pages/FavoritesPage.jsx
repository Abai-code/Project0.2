import { useEffect, useState } from "react";
import client from "../api/client";
import MovieCard from "../components/MovieCard";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTranslation } from "react-i18next";

export default function FavoritesPage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await client.get("/favorites");
      setMovies(res.data);
    } catch (err) {
      setError(t("favorites.loadError"));
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
          {t("favorites.title")} <span className="text-red-500">{t("favorites.titleHighlight")}</span>
        </h1>
        <p className="text-slate-500 text-sm md:text-base max-w-2xl">
          {t("favorites.subtitle")}
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
            <h3 className="text-xl font-bold text-slate-300">{t("favorites.empty")}</h3>
            <p className="text-slate-500 max-w-xs mx-auto">
              {t("favorites.emptyHint")}
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
