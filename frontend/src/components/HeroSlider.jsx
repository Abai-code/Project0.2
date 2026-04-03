import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";
import { useTranslation } from "react-i18next";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleWatch = (movie) => {
    if (!movie.movie_url) {
      alert(t("watch.noVideo"));
      return;
    }
    navigate(`/watch/${movie.id}`);
  };

  useEffect(() => {
    client.get("/movies/featured")
      .then((res) => {
        setMovies(res.data);
      })
      .catch((err) => {
        console.error("Error loading featured", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // Autoplay slides every 5s
  useEffect(() => {
    if (isLoading || movies.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === movies.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isLoading, movies.length]);

  const nextSlide = () => setCurrent((p) => (p === movies.length - 1 ? 0 : p + 1));
  const prevSlide = () => setCurrent((p) => (p === 0 ? movies.length - 1 : p - 1));

  if (isLoading) {
    return (
      <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden rounded-2xl mb-8 bg-slate-800/50 animate-pulse flex flex-col justify-end p-6 md:p-12 lg:p-16 border border-slate-700/50">
        <div className="w-20 h-8 bg-slate-700 rounded-md mb-4"></div>
        <div className="w-3/4 md:w-1/2 h-12 md:h-20 bg-slate-700 rounded-lg mb-4"></div>
        <div className="w-full md:w-2/3 h-4 bg-slate-700 rounded mb-3"></div>
        <div className="w-full md:w-2/3 h-4 bg-slate-700 rounded mb-8"></div>
        <div className="flex gap-4">
          <div className="w-48 h-12 md:h-14 bg-slate-700 rounded-full"></div>
          <div className="w-36 h-12 md:h-14 bg-slate-700 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (movies.length === 0) {
    return null; // Don't show slider if no featured movies
  }

  return (
    <div className="relative w-full h-[50vh] md:h-[70vh] lg:h-[80vh] overflow-hidden rounded-2xl mb-8 group bg-slate-900 shadow-2xl">
      {movies.map((movie, index) => {
        const isActive = index === current;
        const displayYear = movie.year || movie.release_date?.slice(0, 4) || t("common.no");
        return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Background Image with slow zoom */}
            <div 
              className="absolute inset-0 bg-cover bg-center transition-transform duration-[10000ms] ease-linear"
              style={{ 
                backgroundImage: `url(${movie.image})`,
                transform: isActive ? 'scale(1.05)' : 'scale(1)'
              }}
            >
              {/* Dark gradients, similar to Kinopoisk */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-slate-900/60 to-slate-900/10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-slate-900/50 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 lg:p-16 lg:w-3/4 xl:w-2/3 flex flex-col justify-end h-full">
              <div className={`transition-all duration-700 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                
                <div className="flex items-center gap-3 mb-4 text-sm md:text-base font-bold">
                  {movie.rating > 0 && (
                    <span className="bg-gradient-to-r from-orange-500 to-purple-600 text-white px-3 py-1 rounded-md shadow-[0_0_15px_rgba(249,115,22,0.4)]">
                      ★ {movie.rating}
                    </span>
                  )}
                  <span className="text-slate-300 font-medium bg-white/10 px-3 py-1 rounded-md backdrop-blur-md border border-white/5">
                    {displayYear}
                  </span>
                </div>
                
                <h2 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-4 leading-tight drop-shadow-lg tracking-tight">
                  {movie.title}
                </h2>
                
                <p className="text-slate-300 text-sm md:text-lg mb-8 line-clamp-3 md:line-clamp-none drop-shadow-md lg:pr-20 max-w-3xl">
                  {movie.description}
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <button 
                    onClick={() => handleWatch(movie)}
                    className="group/btn flex items-center gap-2 bg-gradient-to-r from-orange-500 to-purple-600 text-white px-8 py-3.5 md:py-4 md:px-10 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:shadow-[0_0_35px_rgba(168,85,247,0.5)] hover:-translate-y-1 active:scale-95 text-sm md:text-base"
                  >
                    <svg className="w-5 h-5 fill-current transition-transform group-hover/btn:scale-110" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    {t("movie.watch")}
                  </button>
                  <button 
                    onClick={() => navigate(`/movies/${movie.id}`)}
                    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white px-8 py-3.5 md:py-4 md:px-10 rounded-full font-bold transition-all border border-white/10 hover:border-white/40 hover:-translate-y-1 active:scale-95 text-sm md:text-base"
                  >
                    {t("movie.about")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Navigation buttons */}
      {movies.length > 1 && (
        <button 
          onClick={prevSlide}
          className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-500 hover:to-purple-600 hover:scale-110 hover:border-transparent hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/></svg>
        </button>
      )}

      {movies.length > 1 && (
        <button 
          onClick={nextSlide}
          className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 md:w-14 md:h-14 rounded-full bg-black/40 text-white backdrop-blur-md flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-gradient-to-r hover:from-orange-500 hover:to-purple-600 hover:scale-110 hover:border-transparent hover:shadow-[0_0_20px_rgba(249,115,22,0.4)]"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
        </button>
      )}

      {/* Pagination dots */}
      {movies.length > 1 && (
        <div className="absolute bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-3">
          {movies.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`transition-all duration-500 rounded-full ${
                index === current 
                  ? 'w-10 h-2 bg-gradient-to-r from-orange-400 to-purple-500 shadow-[0_0_12px_rgba(249,115,22,0.8)]' 
                  : 'w-2 h-2 bg-white/40 hover:bg-white/80 hover:scale-125'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
