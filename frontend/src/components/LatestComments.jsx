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
    const intervalId = setInterval(fetchComments, 10000); // Polling каждые 10 секунд
    return () => clearInterval(intervalId);
  }, []);

  const truncate = (text, maxLength = 90) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  if (loading && comments.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="mb-4 bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent text-center">Последние комментарии</h2>
        <div className="flex justify-center p-4">
          <div className="h-6 w-6 animate-spin rounded-full border-t-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-6 rounded-xl border border-slate-200 bg-white p-4 shadow-md transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900 dark:shadow-xl">
      <h2 className="mb-4 bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-xl font-bold text-transparent text-center">Последние комментарии</h2>
      
      {error && comments.length === 0 ? (
        <p className="text-center text-sm text-red-500 dark:text-red-400">Ошибка загрузки комментариев</p>
      ) : comments.length === 0 ? (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">Комментариев пока нет</p>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border border-gray-100 bg-gray-50 p-3 shadow-inner shadow-gray-200/50 transition-all hover:scale-[1.02] hover:border-gray-200 hover:bg-white dark:border-slate-800 dark:bg-slate-950 dark:shadow-none dark:hover:border-slate-700">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{comment.userName}</span>
              </div>
              <p className="mb-2 text-sm italic leading-relaxed text-slate-600 dark:text-slate-400">
                "{truncate(comment.text, 90)}"
              </p>
              <div className="mt-2 flex items-center gap-1.5 truncate text-xs font-bold uppercase tracking-tighter text-red-500">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>
                {comment.movieTitle}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
