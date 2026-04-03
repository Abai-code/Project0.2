import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";

export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

  useEffect(() => {
    setLoading(true);
    client.get(`/movies/${id}`)
      .then((res) => {
        setMovie(res.data);
      })
      .catch((e) => {
        setError("Не удалось загрузить фильм для просмотра.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !movie || !movie.movie_url) {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-screen bg-black text-center space-y-6">
        <h2 className="text-3xl font-bold text-white">Видео недоступно</h2>
        <p className="text-slate-400">{error || "Похоже, что ссылка на этот фильм не указана."}</p>
        <button 
          onClick={() => navigate(-1)} 
          className="rounded bg-red-600 px-8 py-3 text-white hover:bg-red-500 transition font-semibold"
        >
          Вернуться назад
        </button>
      </div>
    );
  }

  // Resolve the video source URL
  const videoSrc = movie.movie_url.startsWith("/uploads/") 
    ? `${API_BASE}${movie.movie_url}` 
    : movie.movie_url;

  const isNativeVideo = videoSrc.endsWith(".mp4") || videoSrc.endsWith(".webm") || videoSrc.endsWith(".ogg") || videoSrc.includes("/uploads/videos/");

  return (
    <div className="relative h-screen w-screen bg-black flex flex-col items-center justify-center overflow-hidden">
      
      {/* Кнопка "Назад" поверх плеера */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 z-50 flex items-center gap-2 rounded-full bg-black/40 px-5 py-2.5 text-slate-200 backdrop-blur-md hover:bg-black/70 hover:text-white transition group border border-white/10"
      >
        <svg className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="font-medium text-lg">Назад</span>
      </button>

      {/* Выводим либо iframe для внешних сайтов, либо встроенный video для mp4/local */}
      <div className="h-full w-full flex items-center justify-center">
        {isNativeVideo ? (
          <video 
            controls 
            autoPlay 
            className="w-full h-full object-contain"
            src={videoSrc}
          >
            Ваш браузер не поддерживает видео
          </video>
        ) : (
          <iframe
            src={videoSrc}
            title={movie.title}
            allowFullScreen
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
      </div>
    </div>
  );
}
