import { useEffect, useState } from "react";
import client from "../api/client";
import { useTheme } from "../context/ThemeContext";

export default function LatestComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { theme } = useTheme();

  const fetchComments = async () => {
    try {
      const res = await client.get("/comments/latest");
      setComments(res.data);
      setError(false);
    } catch (e) {
      console.error("Failed to fetch latest comments", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
    const intervalId = setInterval(fetchComments, 10000); 
    return () => clearInterval(intervalId);
  }, []);

  const truncate = (text, maxLength = 90) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (loading && comments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent text-center">Свежие отзывы</h2>
        <div className="flex justify-center p-4">
          <div className="h-6 w-6 animate-spin rounded-full border-t-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-24 rounded-2xl bg-slate-900/50 p-6 shadow-xl ring-1 ring-white/5 backdrop-blur-sm">
      <div className="mb-6 space-y-1">
        <h2 className="text-xl font-black text-white">Свежие отзывы</h2>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Обновляется в реальном времени</p>
      </div>
      
      {error && comments.length === 0 ? (
        <div className="rounded-xl bg-red-500/5 p-4 text-center ring-1 ring-red-500/20">
          <p className="text-xs font-bold text-red-400">Ошибка загрузки</p>
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm italic text-slate-600">Пока нет новых отзывов...</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div 
              key={comment.id} 
              className="group relative rounded-xl bg-slate-950/40 p-4 transition-all hover:bg-slate-950/80 hover:ring-1 hover:ring-white/10"
            >
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-600/20 text-[10px] font-black text-red-500 ring-1 ring-red-500/30">
                  {comment.userName?.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-xs font-black text-slate-200">{comment.userName}</span>
              </div>
              
              <p className="mb-3 text-[13px] italic leading-relaxed text-slate-400">
                "{truncate(comment.text, 80)}"
              </p>
              
              <div className="flex items-center gap-2 border-t border-white/5 pt-3">
                <svg className="h-3 w-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2z" />
                </svg>
                <span className="truncate text-[10px] font-black uppercase tracking-tight text-slate-500 group-hover:text-red-500 transition-colors">
                  {comment.movieTitle}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
