import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import client from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import { useTranslation } from "react-i18next";

export default function WatchPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { t } = useTranslation();

  const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace("/api", "");

  useEffect(() => {
    setLoading(true);
    client
      .get(`/movies/${id}`)
      .then((res) => {
        setMovie(res.data);
        setError("");
      })
      .catch(() => {
        setError(t("watch.loadError") || "Error loading movie");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, t]);

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-black">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !movie || !movie.movie_url) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center space-y-6 bg-black text-center">
        <h2 className="text-3xl font-bold text-white">{t("watch.noVideo")}</h2>
        <p className="text-slate-400">{error || t("watch.noVideoHint")}</p>
        <button
          onClick={() => navigate(-1)}
          className="rounded bg-red-600 px-8 py-3 font-semibold text-white transition hover:bg-red-500"
        >
          {t("watch.back")}
        </button>
      </div>
    );
  }

  const videoSrc = movie.movie_url.startsWith("/uploads/") ? `${API_BASE}${movie.movie_url}` : movie.movie_url;
  const isNativeVideo =
    videoSrc.endsWith(".mp4") ||
    videoSrc.endsWith(".webm") ||
    videoSrc.endsWith(".ogg") ||
    videoSrc.includes("/uploads/videos/");

  return (
    <div className="relative flex h-screen w-screen flex-col items-center justify-center overflow-hidden bg-black">
      <button
        onClick={() => navigate(-1)}
        className="group absolute left-6 top-6 z-50 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-5 py-2.5 text-slate-200 backdrop-blur-md transition hover:bg-black/70 hover:text-white"
        aria-label={t("common.back")}
      >
        <svg className="h-6 w-6 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        <span className="text-lg font-medium">{t("common.back")}</span>
      </button>

      <div className="flex h-full w-full items-center justify-center">
        {isNativeVideo ? (
          <video controls autoPlay className="h-full w-full object-contain" src={videoSrc}>
            {t("watch.notSupported")}
          </video>
        ) : (
          <iframe
            src={videoSrc}
            title={movie.title}
            allowFullScreen
            className="h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          />
        )}
      </div>
    </div>
  );
}
