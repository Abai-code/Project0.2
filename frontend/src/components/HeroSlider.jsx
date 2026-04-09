import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import client from "../api/client";

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  const handleWatch = (movie) => {
    if (!movie.movie_url) {
      alert("Видео недоступно");
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

  const cleanTitle = (title) => {
    if (!title) return "";
    // Remove (Year), с пакетом, and extra spaces
    return title.replace(/\(\d{4}\)/g, "").replace(/с пакетом/gi, "").replace(/\s+/g, " ").trim();
  };

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
        const displayYear = movie.year || movie.release_date?.slice(0, 4) || "Нет";
        return (
          <div
            key={movie.id}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
          >
            {/* Blurred Dark Background */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl transition-transform duration-[10000ms] ease-linear scale-110"
              style={{ backgroundImage: `url(${movie.image})` }}
            />
            {/* Gradient Overlays for smooth text blending */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-0"></div>

            {/* Content Container */}
            <div className="absolute inset-0 w-full h-full flex items-center justify-between px-6 md:px-12 lg:px-20 z-10">
              
              {/* Left Side: Text Content */}
              <div className={`w-full lg:w-[55%] flex flex-col justify-end lg:justify-center h-full pb-12 lg:pb-0 transition-all duration-700 delay-300 ${isActive ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>

                
                {/* Meta badges */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  {movie.rating > 0 && (
                    <span className="bg-red-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg shadow-red-600/20">
                      ★ {movie.rating}
                    </span>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-100 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5 uppercase tracking-wider">
                      {displayYear}
                    </span>
                    <span className="text-slate-100 text-xs font-bold bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-md border border-white/5 uppercase tracking-wider">
                      {movie.genre || "Кино"}
                    </span>
                  </div>
                </div>
                
                {/* Title — responsive & cleanup */}
                <h2
                  className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-6 leading-[1.05] tracking-tight group-hover:text-red-500 transition-colors duration-500"
                  style={{ textShadow: '0 4px 30px rgba(0,0,0,0.8)' }}
                >
                  {cleanTitle(movie.title)}
                </h2>
                
                {/* Description — slightly bigger & better line height */}
                <p className="text-slate-300 text-sm md:text-lg leading-relaxed mb-10 line-clamp-3 drop-shadow-lg max-w-xl opacity-90">
                  {movie.description}
                </p>

                {/* Buttons — prominent with glow */}
                <div className="flex flex-wrap items-center gap-5">
                  <button 
                    onClick={() => handleWatch(movie)}
                    className="group/btn flex items-center gap-3 bg-red-600 text-white px-8 py-4 md:px-12 rounded-2xl font-black transition-all duration-300 shadow-xl shadow-red-600/20 hover:bg-red-500 hover:scale-105 active:scale-95 text-sm md:text-base border border-red-500/50"
                  >
                    <svg className="w-5 h-5 fill-current transition-transform duration-300 group-hover/btn:scale-125 shadow-black" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                    Смотреть
                  </button>
                  <button 
                    onClick={() => navigate(`/movies/${movie.id}`)}
                    className="flex items-center gap-2 bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-xl text-white px-8 py-4 md:px-10 rounded-2xl font-bold transition-all duration-300 border border-white/10 hover:border-white/30 hover:scale-105 active:scale-95 text-sm md:text-base"
                  >
                    Инфо
                  </button>
                </div>
              </div>

              {/* Right Side: Uncropped Poster Frame (visible on large screens) */}
              <div className={`hidden lg:flex w-[40%] h-[75%] items-center justify-end transition-all duration-1000 delay-500 ${isActive ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`}>
                <div className="relative h-full aspect-[2/3] rounded-3xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/10 transition-transform duration-[10000ms] ease-linear group-hover:scale-105">
                  <img 
                    src={movie.image} 
                    className="w-full h-full object-cover" 
                    alt={movie.title} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
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
