import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import { useAuth } from "../context/AuthContext";

export default function MoviePage({ setToast }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [error, setError] = useState("");

  const loadData = async () => {
    try {
      setLoading(true);
      const [movieRes, reviewsRes] = await Promise.all([
        client.get(`/movies/${id}`),
        client.get(`/reviews/${id}`)
      ]);
      setMovie(movieRes.data);
      setReviews(reviewsRes.data);
      setError("");
    } catch {
      setError("Не удалось загрузить фильм");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleSubmitReview = async ({ text, rating }) => {
    try {
      setReviewLoading(true);
      await client.post("/reviews", { movieId: Number(id), text, rating });
      setToast({ type: "success", message: "Фильм успешно добавлен" });
      await loadData();
    } catch (e) {
      setToast({ type: "error", message: e.response?.data?.message || "Ошибка загрузки отзывов" });
    } finally {
      setReviewLoading(false);
    }
  };

  const handleLike = async (reviewId) => {
    try {
      await client.post(`/reviews/${reviewId}/like`);
      await loadData();
    } catch (e) {
      setToast({ type: "error", message: e.response?.data?.message || "Войдите, чтобы оставить отзыв" });
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !movie) {
    return <p className="text-red-400">{error || "Фильм не найден"}</p>;
  }

  return (
    <section className="space-y-6">
      <div className="grid grid-cols-1 gap-8 rounded-2xl border border-slate-200 bg-white p-6 transition-colors backdrop-blur-sm md:grid-cols-12 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="md:col-span-4 lg:col-span-3">
          <img
            src={movie.image}
            alt={`${movie.title} poster`}
            className="h-auto w-full rounded-xl border border-slate-200 shadow-xl dark:border-slate-800 dark:shadow-2xl"
          />
        </div>

        <div className="space-y-6 md:col-span-8 lg:col-span-9">
          <div>
            <h1 className="mb-2 text-4xl font-black tracking-tight text-slate-950 dark:text-white">{movie.title}</h1>
            <div className="flex flex-wrap items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1 text-yellow-600 dark:text-yellow-500">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                {movie.rating}
              </span>
              <span className="text-slate-300 dark:text-slate-500">|</span>
              <span className="text-slate-600 dark:text-slate-300">{movie.year || "Нет"}</span>
              <span className="text-slate-300 dark:text-slate-500">|</span>
              <span className="capitalize text-slate-600 dark:text-slate-300">{movie.is_series ? "Сериал" : "Фильм"}</span>
            </div>
          </div>

          <div className="grid max-w-xl grid-cols-2 gap-x-8 gap-y-4 text-sm">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Год</p>
              <p className="text-slate-800 dark:text-slate-200">{movie.year || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Страна</p>
              <p className="text-slate-800 dark:text-slate-200">{movie.country?.trim() || "-"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Жанр</p>
              <p className="text-slate-800 dark:text-slate-200">{movie.genre?.trim() || "-"}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Описание сюжета</p>
            <p className="text-base italic leading-relaxed text-slate-700 dark:text-slate-300">{movie.description}</p>
          </div>

          <div className="flex pt-4">
            {movie.movie_url ? (
              <Link
                to={`/watch/${movie.id}`}
                className="flex items-center gap-2 rounded-full bg-red-600 px-10 py-4 text-base font-bold text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-500 active:scale-95"
              >
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Смотреть сейчас
              </Link>
            ) : (
              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-100 px-6 py-4 text-slate-500 dark:border-slate-700/50 dark:bg-slate-800/50 dark:text-slate-400">
                <svg className="h-6 w-6 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Видео недоступно</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {user ? (
        <ReviewForm onSubmit={handleSubmitReview} loading={reviewLoading} />
      ) : (
        <p className="text-slate-500 dark:text-slate-400">Войдите, чтобы оставить отзыв</p>
      )}

      <ReviewList reviews={reviews} onLike={handleLike} canLike={Boolean(user)} />
    </section>
  );
}
