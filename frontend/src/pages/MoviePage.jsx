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
    <section className="relative -mt-6">
      {/* Immersive Backdrop */}
      <div className="absolute inset-0 -top-20 h-[500px] w-full overflow-hidden pointer-events-none">
        <img
          src={movie.image}
          className="h-full w-full object-cover blur-3xl opacity-30 brightness-[0.4]"
          alt=""
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/80 to-slate-950" />
      </div>

      <div className="relative z-10 space-y-12 pt-12">
        {/* Main Info Card */}
        <div className="flex flex-col gap-10 md:flex-row md:items-start lg:gap-16">
          {/* Poster Section */}
          <div className="mx-auto w-64 flex-shrink-0 md:mx-0 lg:w-80">
            <div className="group relative overflow-hidden rounded-2xl shadow-2xl shadow-black/50 ring-1 ring-white/10 transition-transform duration-500 hover:scale-[1.02]">
              <img
                src={movie.image}
                alt={`${movie.title} poster`}
                className="h-auto w-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {movie.rating > 0 && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-black text-white shadow-lg shadow-orange-500/30">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {movie.rating}
                  </span>
                )}
                <span className="rounded-lg bg-slate-800/80 px-3 py-1.5 text-sm font-bold text-slate-200 backdrop-blur-sm ring-1 ring-white/5">
                  {movie.year}
                </span>
                <span className="rounded-lg bg-slate-800/80 px-3 py-1.5 text-sm font-bold text-slate-200 backdrop-blur-sm ring-1 ring-white/5 capitalize">
                  {movie.is_series ? "Сериал" : "Фильм"}
                </span>
              </div>
              
              <h1 className="text-4xl font-black tracking-tight text-white md:text-5xl lg:text-7xl">
                {movie.title}
              </h1>
            </div>

            {/* Attributes Grid */}
            <div className="flex flex-wrap gap-8 py-2">
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Страна</p>
                <p className="text-base font-semibold text-slate-200">{movie.country || "-"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Жанр</p>
                <p className="text-base font-semibold text-slate-200">{movie.genre || "-"}</p>
              </div>
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Рейтинг</p>
                <p className="text-base font-semibold text-slate-200">{movie.rating || "0.0"}</p>
              </div>
            </div>

            <div className="space-y-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Описание сюжета</p>
              <p className="max-w-3xl text-lg leading-relaxed text-slate-300">
                {movie.description}
              </p>
            </div>

            <div className="flex pt-6">
              {movie.movie_url ? (
                <Link
                  to={`/watch/${movie.id}`}
                  className="group flex items-center gap-3 rounded-full bg-red-600 px-12 py-5 text-lg font-black text-white shadow-xl shadow-red-600/30 transition-all hover:bg-red-500 hover:scale-105 active:scale-95"
                >
                  <svg className="h-6 w-6 fill-current transition-transform group-hover:scale-110" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Смотреть сейчас
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-2xl bg-slate-800/50 px-8 py-5 text-slate-400 ring-1 ring-white/10">
                  <svg className="h-6 w-6 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold">Видео скоро появится</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="space-y-10 border-t border-slate-800 pt-16">
          <div className="flex items-center gap-4">
            <h2 className="text-3xl font-black text-white">Отзывы зрителей</h2>
            <span className="rounded-full bg-slate-800 px-4 py-1 text-sm font-bold text-slate-400">
              {reviews.length}
            </span>
          </div>

          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-4">
              {user ? (
                <div className="sticky top-24">
                  <ReviewForm onSubmit={handleSubmitReview} loading={reviewLoading} />
                </div>
              ) : (
                <div className="rounded-2xl bg-slate-900/50 p-6 text-center shadow-lg ring-1 ring-white/5">
                  <p className="mb-4 text-slate-400">Хотите оставить отзыв?</p>
                  <Link to="/login" className="font-bold text-red-500 hover:text-red-400">
                    Войдите в аккаунт
                  </Link>
                </div>
              )}
            </div>

            <div className="lg:col-span-8">
              <ReviewList reviews={reviews} onLike={handleLike} canLike={Boolean(user)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
