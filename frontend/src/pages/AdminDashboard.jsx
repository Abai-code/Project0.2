import { useEffect, useState, useRef } from "react";
import client from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTheme } from "../context/ThemeContext";

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

export default function AdminDashboard({ setToast }) {
const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [selectedMovieId, setSelectedMovieId] = useState("");
  const [reviews, setReviews] = useState([]);
  const { theme } = useTheme();
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const res = await client.get("/movies");
      setMovies(res.data);
    } catch {
      setToast({ type: "error", message: "Ошибка загрузки фильмов" });
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
      .catch(() => setToast({ type: "error", message: "Ошибка загрузки отзывов" }));
  }, [selectedMovieId, setToast]);

  const onChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleVideoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("video", file);

      const res = await client.post("/upload/video", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // res.data.videoUrl is "/uploads/videos/..."
      setForm((prev) => ({ ...prev, movie_url: res.data.videoUrl }));
      setToast({ type: "success", message: "Видео загружено на сервер" });
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Ошибка загрузки файла" });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.description || !form.image || !form.year) {
      setToast({ type: "error", message: "Заполните все обязательные поля (Название, Описание, Постер, Год)" });
      return;
    }
    try {
      const payload = {
        title: form.title,
        description: form.description,
        image: form.image,
        movie_url: form.movie_url || null,
        year: form.year ? Number(form.year) : null,
        country: form.country || null,
        genre: form.genre || null,
        is_series: Boolean(form.is_series),
        featured: Boolean(form.featured),
        rating: Number(form.rating) || 0
      };
      if (form.id) {
        await client.put(`/movies/${form.id}`, payload);
        setToast({ type: "success", message: "Фильм обновлен" });
      } else {
        await client.post("/movies", payload);
        setToast({ type: "success", message: "Фильм добавлен" });
      }
      setForm(initialForm);
      await loadMovies();
    } catch (e) {
      setToast({ type: "error", message: e.response?.data?.message || "Ошибка сохранения" });
    }
  };

  const onEdit = (movie) => setForm(movie);

  const onDelete = async (id) => {
    if (!window.confirm("Вы действительно хотите удалить этот фильм? Вместе с ним будет удален и видеофайл с сервера.")) return;
    try {
      await client.delete(`/movies/${id}`);
      setToast({ type: "success", message: "Фильм и видео удалены" });
      await loadMovies();
    } catch {
      setToast({ type: "error", message: "Ошибка удаления фильма" });
    }
  };

  const onDeleteReview = async (reviewId) => {
    try {
      await client.delete(`/reviews/${reviewId}`);
      setToast({ type: "success", message: "Отзыв удален" });
      const updated = await client.get(`/reviews/${selectedMovieId}`);
      setReviews(updated.data);
    } catch {
      setToast({ type: "error", message: "Ошибка удаления отзыва" });
    }
  };

  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-bold transition-colors text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
      
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl transition-all dark:border-slate-800 dark:bg-slate-900/50 dark:backdrop-blur-xl dark:shadow-2xl">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            {form.id ? "Редактирование фильма" : "Добавление нового контента"}
          </h2>
          {form.id && (
             <button 
                type="button" 
                onClick={() => setForm(initialForm)}
                className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors"
              >
                Сбросить / Отмена
              </button>
          )}
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left Column: Core Info */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Название фильма</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={onChange}
                  placeholder="Напр: Начало"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Описание сюжета</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  placeholder="Краткое описание фильма..."
                  rows={4}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-900 outline-none transition-all resize-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">URL Постера</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={onChange}
                  placeholder="https://example.com/poster.jpg"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Right Column: Metadata */}
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Ссылка на плеер (Video URL)</label>
                <div className="relative">
                  <input
                    name="movie_url"
                    value={form.movie_url ?? ""}
                    onChange={onChange}
                    placeholder={isUploading ? "Загрузка файла..." : "Вставьте ссылку или загрузите файл"}
                    disabled={isUploading}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 pr-12 text-sm text-slate-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:font-mono dark:text-xs dark:placeholder:text-slate-600"
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    {isUploading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-red-500 border-t-transparent mr-2" />
                    ) : (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2 rounded-lg bg-slate-200 text-slate-600 hover:bg-red-500 hover:text-white transition-all shadow-sm dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-red-500 dark:hover:text-white"
                        title="Загрузить свой видеофайл"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    onChange={handleVideoUpload}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Год выпуска</label>
                  <input
                    name="year"
                    value={form.year ?? ""}
                    onChange={onChange}
                    placeholder="2024"
                    required
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Рейтинг (IMDB/KP)</label>
                  <input
                    name="rating"
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={form.rating ?? 0}
                    onChange={onChange}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Страна</label>
                  <input
                    name="country"
                    value={form.country ?? ""}
                    onChange={onChange}
                    placeholder="USA, Russia..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 ml-1">Жанр</label>
                  <input
                    name="genre"
                    value={form.genre ?? ""}
                    onChange={onChange}
                    placeholder="Action, Sci-Fi..."
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 p-3.5 text-sm text-slate-900 outline-none transition-all focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-600"
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <label className={`flex flex-1 items-center justify-center gap-3 rounded-xl border p-4 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  form.is_series 
                    ? "border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/50 dark:bg-orange-500/10 dark:text-orange-400" 
                    : "border-gray-100 bg-gray-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500 dark:hover:border-slate-700"
                }`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={Boolean(form.is_series)}
                    onChange={(e) => setForm((p) => ({ ...p, is_series: e.target.checked }))}
                  />
                  <span>{form.is_series ? "✓ Сериал" : "Сериал?"}</span>
                </label>
                
                <label className={`flex flex-1 items-center justify-center gap-3 rounded-xl border p-4 text-xs font-bold uppercase tracking-wider cursor-pointer transition-all ${
                  form.featured 
                    ? "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/50 dark:bg-blue-500/10 dark:text-blue-400" 
                    : "border-gray-100 bg-gray-50 text-slate-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500 dark:hover:border-slate-700"
                }`}>
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={Boolean(form.featured)}
                    onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))}
                  />
                  <span>{form.featured ? "★ В Афише" : "В Афишу?"}</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-red-700 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl shadow-red-600/30 transition-all hover:bg-gradient-to-r hover:from-red-500 hover:to-red-600 hover:-translate-y-0.5 active:scale-95"
            >
              {form.id ? "Сохранить изменения" : "Опубликовать фильм"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Список фильмов</h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {movies.map((movie) => (
                <div
                  key={movie.id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-all dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={movie.image} className="h-16 w-12 rounded object-cover shadow-md" alt="" />
                    <div className="min-w-0">
                      <h3 className="truncate font-bold text-slate-900 dark:text-slate-100">{movie.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {movie.year} | {movie.genre} | ⭐ {movie.rating}
                      </p>
                      {movie.movie_url?.startsWith("/uploads/") && (
                        <span className="mt-1 inline-block rounded bg-green-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-green-500">Lоcal Video</span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      onClick={() => onEdit(movie)}
                      className="rounded-lg p-2 bg-gray-100 text-blue-600 hover:bg-gray-200 transition-all dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-slate-700"
                      title="Редактировать"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(movie.id)}
                      className="rounded-lg p-2 bg-red-600/10 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Удалить"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 space-y-4 rounded-xl border border-gray-200 bg-white p-6 shadow-md transition-all dark:border-slate-800 dark:bg-slate-900 dark:shadow-xl">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Модерация комментариев</h2>
            <select
              value={selectedMovieId}
              onChange={(e) => setSelectedMovieId(e.target.value)}
              className="w-full rounded border border-gray-200 bg-gray-50 p-3 text-slate-900 outline-none transition-colors focus:border-red-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
            >
              <option value="">Выберите фильм для просмотра комментариев</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title}
                </option>
              ))}
            </select>

            <div className="space-y-4">
              {reviews.length === 0 && selectedMovieId && <p className="text-sm text-slate-500 italic">Комментариев пока нет.</p>}
              {reviews.map((review) => (
                <div key={review.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4 transition-all dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex justify-between items-start">
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                      <span className="mr-2 font-bold text-slate-900 dark:text-slate-100">{review.username}:</span>
                      {review.text}
                    </p>
                    <button
                      type="button"
                      onClick={() => onDeleteReview(review.id)}
                      className="ml-4 text-xs font-bold text-red-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
