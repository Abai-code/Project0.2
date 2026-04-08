import { useEffect, useMemo, useRef, useState } from "react";
import client from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

const initialForm = {
  title: "",
  description: "",
  image: "",
  movie_url: "",
  year: "",
  country: "",
  genre: "",
  is_series: false,
  featured: false,
  rating: 0,
  id: null
};

function isValidUrl(value) {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function normalizeMovieForm(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    image: form.image.trim(),
    movie_url: form.movie_url.trim(),
    year: form.year === "" ? "" : Number(form.year),
    country: form.country.trim(),
    genre: form.genre.trim(),
    is_series: Boolean(form.is_series),
    featured: Boolean(form.featured),
    rating: Number(String(form.rating).replace(",", ".")),
    id: form.id
  };
}

function validateMovieForm(form) {
  const normalized = normalizeMovieForm(form);
  const maxYear = new Date().getFullYear() + 2;

  if (!normalized.title || !normalized.description || !normalized.image || normalized.year === "") {
    return "Заполните все поля";
  }
  if (!Number.isInteger(normalized.year) || normalized.year < 1888 || normalized.year > maxYear) {
    return `Year must be between 1888 and ${maxYear}`;
  }
  if (!Number.isFinite(normalized.rating) || normalized.rating < 0 || normalized.rating > 10) {
    return "Rating must be between 0 and 10";
  }
  if (!isValidUrl(normalized.image)) {
    return "Poster URL must be valid";
  }
  if (normalized.movie_url && !normalized.movie_url.startsWith("/uploads/") && !isValidUrl(normalized.movie_url)) {
    return "Video URL must be valid";
  }

  return "";
}

function FormField({ label, htmlFor, children }) {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="ml-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">
        {label}
      </label>
      {children}
    </div>
  );
}

function ToggleCard({ active, label, activeLabel, onChange, accent }) {
  const activeClass = {
    orange: "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/50 dark:bg-orange-500/10 dark:text-orange-400",
    blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-400"
  }[accent];

  return (
    <label
      className={`flex flex-1 cursor-pointer items-center justify-center gap-3 rounded-xl border p-4 text-xs font-bold uppercase tracking-wider transition-all ${active
          ? activeClass
          : "border-gray-100 bg-gray-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500 dark:hover:border-slate-700"
        }`}
    >
      <input type="checkbox" className="hidden" checked={active} onChange={onChange} />
      <span>{active ? activeLabel : label}</span>
    </label>
  );
}

function MovieForm({
  form,
  isUploading,
  fileInputRef,
  onChange,
  onToggle,
  onVideoUpload,
  onSubmit,
  onReset
}) {
  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:backdrop-blur-xl dark:shadow-2xl">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
          {form.id ? "Редактирование фильма" : "Добавление нового контента"}
        </h2>
        {form.id && (
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-bold uppercase tracking-widest text-red-500 transition-colors hover:text-red-400"
          >
            Сбросить / Отмена
          </button>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <FormField label="Название фильма" htmlFor="movie-title">
              <input
                id="movie-title"
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Напр: Начало"
                className={inputClass}
              />
            </FormField>

            <FormField label="Описание сюжета" htmlFor="movie-description">
              <textarea
                id="movie-description"
                name="description"
                value={form.description}
                onChange={onChange}
                placeholder="Поделитесь впечатлениями о фильме..."
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </FormField>

            <FormField label="URL постера" htmlFor="movie-image">
              <input
                id="movie-image"
                name="image"
                value={form.image}
                onChange={onChange}
                placeholder="https://example.com/poster.jpg"
                className={inputClass}
              />
            </FormField>
          </div>

          <div className="space-y-4">
            <FormField label="Ссылка на плеер (Video URL)" htmlFor="movie-video-url">
              <div className="relative">
                <input
                  id="movie-video-url"
                  name="movie_url"
                  value={form.movie_url ?? ""}
                  onChange={onChange}
                  placeholder={isUploading ? "Загрузка..." : "Вставьте ссылку или загрузите файл"}
                  disabled={isUploading}
                  className={`${inputClass} pr-12 dark:font-mono dark:text-xs`}
                />
                <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1">
                  {isUploading ? (
                    <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                  ) : (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="rounded-lg bg-slate-200 p-2 text-slate-600 shadow-sm transition-all hover:bg-red-500 hover:text-white dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-500 dark:hover:text-white"
                      title="Загрузить видеофайл"
                      aria-label="Загрузить видеофайл"
                    >
                      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  accept="video/*"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={onVideoUpload}
                />
              </div>
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Год выпуска" htmlFor="movie-year">
                <input
                  id="movie-year"
                  name="year"
                  value={form.year ?? ""}
                  onChange={onChange}
                  placeholder="2024"
                  required
                  className={inputClass}
                />
              </FormField>

              <FormField label="Рейтинг (IMDB/KP)" htmlFor="movie-rating">
                <input
                  id="movie-rating"
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={form.rating ?? 0}
                  onChange={onChange}
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Страна" htmlFor="movie-country">
                <input
                  id="movie-country"
                  name="country"
                  value={form.country ?? ""}
                  onChange={onChange}
                  placeholder="USA, Kazakhstan..."
                  className={inputClass}
                />
              </FormField>

              <FormField label="Жанр" htmlFor="movie-genre">
                <input
                  id="movie-genre"
                  name="genre"
                  value={form.genre ?? ""}
                  onChange={onChange}
                  placeholder="Action, Sci-Fi..."
                  className={inputClass}
                />
              </FormField>
            </div>

            <div className="flex gap-4 pt-2">
              <ToggleCard
                active={Boolean(form.is_series)}
                label="Сериал?"
                activeLabel="Это сериал"
                accent="orange"
                onChange={(e) => onToggle("is_series", e.target.checked)}
              />
              <ToggleCard
                active={Boolean(form.featured)}
                label="В афишу?"
                activeLabel="В афише"
                accent="blue"
                onChange={(e) => onToggle("featured", e.target.checked)}
              />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/30 transition-all hover:-translate-y-0.5 hover:from-red-500 hover:to-red-600 active:scale-95"
          >
            {form.id ? "Сохранить изменения" : "Опубликовать"}
          </button>
        </div>
      </form>
    </div>
  );
}

function MovieList({ movies, onEdit, onDelete }) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Список фильмов</h2>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex min-w-0 items-center gap-4">
              <img src={movie.image} className="h-16 w-12 rounded object-cover shadow-md" alt={`${movie.title} poster`} />
              <div className="min-w-0">
                <h3 className="truncate font-bold text-slate-900 dark:text-slate-100">{movie.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {movie.year} | {movie.genre} | Рейтинг: {movie.rating}
                </p>
                {movie.movie_url?.startsWith("/uploads/") && (
                  <span className="mt-1 inline-block rounded bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-green-500">
                    Локальное видео
                  </span>
                )}
              </div>
            </div>
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => onEdit(movie)}
                className="rounded-lg bg-gray-100 p-2 text-blue-600 transition-all hover:bg-gray-200 dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
                title="Редактирование фильма"
                aria-label="Редактирование фильма"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => onDelete(movie.id)}
                className="rounded-lg bg-red-600/10 p-2 text-red-500 shadow-sm transition-all hover:bg-red-500 hover:text-white"
                title="Удалить фильм"
                aria-label="Удалить фильм"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewModeration({ movies, reviews, selectedMovieId, onSelectMovie, onDeleteReview }) {
  return (
    <div className="mt-12 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 dark:shadow-xl">
      <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Модерация отзывов</h2>
      <select
        value={selectedMovieId}
        onChange={(e) => onSelectMovie(e.target.value)}
        className="w-full rounded border border-gray-200 bg-gray-50 p-3 text-slate-900 outline-none transition-colors focus:border-red-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
      >
        <option value="">Выберите фильм для просмотра отзывов</option>
        {movies.map((movie) => (
          <option key={movie.id} value={movie.id}>
            {movie.title}
          </option>
        ))}
      </select>

      <div className="space-y-4">
        {reviews.length === 0 && selectedMovieId && <p className="text-sm italic text-slate-500">Для этого фильма пока нет отзывов</p>}
        {reviews.map((review) => (
          <div key={review.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all dark:border-slate-800 dark:bg-slate-950">
            <div className="flex items-start justify-between">
              <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                <span className="mr-2 font-bold text-slate-900 dark:text-slate-100">{review.username}:</span>
                {review.text}
              </p>
              <button
                type="button"
                onClick={() => onDeleteReview(review.id)}
                className="ml-4 text-xs font-bold uppercase tracking-widest text-red-500 transition-colors hover:text-red-400"
              >
                Удалить отзыв
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminDashboard({ setToast }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const normalizedForm = useMemo(() => normalizeMovieForm(form), [form]);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const res = await client.get("/movies");
      setMovies(res.data);
    } catch {
      setToast({ type: "error", message: "Ошибка загрузки данных" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  useEffect(() => {
    if (!selectedMovieId) {
      setReviews([]);
      return;
    }

    client
      .get(`/reviews/${selectedMovieId}`)
      .then((res) => setReviews(res.data))
      .catch(() => setToast({ type: "error", message: "Ошибка загрузки данных" }));
  }, [selectedMovieId, setToast]);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const onToggle = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));
  const onReset = () => setForm(initialForm);

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("video", file);

      const res = await client.post("/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      setForm((prev) => ({ ...prev, movie_url: res.data.videoUrl }));
      setToast({ type: "success", message: "Видео загружено на сервер" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: err.response?.data?.message || "Ошибка загрузки данных" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateMovieForm(form);
    if (validationError) {
      setToast({ type: "error", message: validationError });
      return;
    }

    try {
      const payload = {
        ...normalizedForm,
        movie_url: normalizedForm.movie_url || null,
        year: normalizedForm.year || null,
        country: normalizedForm.country || null,
        genre: normalizedForm.genre || null
      };

      if (form.id) {
        await client.put(`/movies/${form.id}`, payload);
        setToast({ type: "success", message: "Фильм обновлен" });
      } else {
        await client.post("/movies", payload);
        setToast({ type: "success", message: "Фильм успешно добавлен" });
      }

      onReset();
      await loadMovies();
    } catch (e) {
      const errorData = e.response?.data;
      const message = errorData?.errors 
        ? errorData.errors.map(err => err.msg).join(", ") 
        : errorData?.message || "Ошибка при сохранении";
      setToast({ type: "error", message });
    }
  };

  const onEdit = (movie) => {
    setForm({
      title: movie.title ?? "",
      description: movie.description ?? "",
      image: movie.image ?? "",
      movie_url: movie.movie_url ?? "",
      year: movie.year ?? "",
      country: movie.country ?? "",
      genre: movie.genre ?? "",
      is_series: Boolean(movie.is_series),
      featured: Boolean(movie.featured),
      rating: movie.rating ?? 0,
      id: movie.id
    });
  };

  const onDelete = async (id) => {
    if (!window.confirm("Удалить фильм?")) return;

    try {
      await client.delete(`/movies/${id}`);
      setToast({ type: "success", message: "Фильм и видео удалены" });
      await loadMovies();
    } catch {
      setToast({ type: "error", message: "Ошибка при сохранении" });
    }
  };

  const onDeleteReview = async (reviewId) => {
    try {
      await client.delete(`/reviews/${reviewId}`);
      setToast({ type: "success", message: "Отзыв удален" });
      const updated = await client.get(`/reviews/${selectedMovieId}`);
      setReviews(updated.data);
    } catch {
      setToast({ type: "error", message: "Ошибка при сохранении" });
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 transition-colors dark:text-slate-100">Панель администратора</h1>

      <MovieForm
        form={form}
        isUploading={isUploading}
        fileInputRef={fileInputRef}
        onChange={onChange}
        onSubmit={onSubmit}
        onReset={onReset}
        onToggle={onToggle}
        onVideoUpload={handleVideoUpload}
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <MovieList movies={movies} onEdit={onEdit} onDelete={onDelete} />
          <ReviewModeration
            movies={movies}
            reviews={reviews}
            selectedMovieId={selectedMovieId}
            onSelectMovie={setSelectedMovieId}
            onDeleteReview={onDeleteReview}
          />
        </>
      )}
    </section>
  );
}
