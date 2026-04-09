import { useEffect, useState } from "react";
import client from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import MovieCard from "../components/MovieCard";
import HeroSlider from "../components/HeroSlider";
import LatestComments from "../components/LatestComments";

const FilterAccordion = ({ title, children, defaultOpen = false }) => (
  <details className="group mb-4 overflow-hidden rounded-2xl bg-slate-900/40 ring-1 ring-white/5 backdrop-blur-sm" open={defaultOpen}>
    <summary className="flex cursor-pointer select-none items-center justify-between px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-400 list-none transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
      <span>{title}</span>
      <svg className="h-4 w-4 text-slate-600 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </summary>
    <div className="px-5 pb-5">
      <div className="space-y-1">{children}</div>
    </div>
  </details>
);

const FilterButton = ({ onClick, active, label, count, centered = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group flex w-full items-center rounded-xl px-4 py-2.5 text-[13px] font-bold transition-all active:scale-[0.98] ${
      active 
        ? "bg-red-600 text-white shadow-lg shadow-red-600/20" 
        : "text-slate-400 hover:bg-white/5 hover:text-white"
    } ${centered ? "justify-center" : "justify-between"}`}
  >
    <span>{label}</span>
    {count !== undefined && (
      <span className={`text-[10px] font-black opacity-40 group-hover:opacity-100 ${active ? "text-white" : "text-slate-500"}`}>
        {count}
      </span>
    )}
  </button>
);

export default function HomePage() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ years: [], countries: [], genres: [], series: [] });
  const [selected, setSelected] = useState({
    year: "",
    country: "",
    genre: "",
    isSeries: ""
  });
  const [sort, setSort] = useState("new");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    client
      .get("/filters")
      .then((res) => setFilters(res.data))
      .catch(() => setFilters({ years: [], countries: [], genres: [], series: [] }));
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(true);
      client
        .get("/movies", {
          params: {
            search,
            year: selected.year || undefined,
            country: selected.country || undefined,
            genre: selected.genre || undefined,
            isSeries: selected.isSeries || undefined,
            sort
          }
        })
        .then((res) => setMovies(res.data))
        .catch(() => setError("Не удалось загрузить фильмы"))
        .finally(() => setLoading(false));
    }, 300);

    return () => clearTimeout(timeout);
  }, [search, selected, sort]);

  return (
    <section className="space-y-16 py-6">
      <HeroSlider />
      
      <div className="space-y-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tight text-white">Каталог фильмов</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-[0.2em]">Найдено в коллекции: {movies.length}</p>
          </div>
          
          <div className="flex flex-col gap-4 sm:flex-row lg:items-center">
            <div className="relative">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Поиск по названию..."
                className="w-full rounded-2xl bg-slate-900/50 px-12 py-3.5 text-sm font-bold text-white outline-none ring-1 ring-white/10 transition-all focus:bg-slate-900 focus:ring-2 focus:ring-red-500/50 sm:w-80"
              />
              <svg className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-2xl bg-slate-900/50 px-6 py-3.5 text-sm font-bold text-white outline-none ring-1 ring-white/10 transition-all hover:bg-white/5 cursor-pointer"
            >
              <option value="new" className="bg-slate-900 text-white">Сначала новые</option>
              <option value="old" className="bg-slate-900 text-white">Сначала старые</option>
              <option value="rating" className="bg-slate-900 text-white">По рейтингу</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-500/10 p-6 text-red-500 ring-1 ring-red-500/20">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="font-bold">{error}</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          {/* Sidebar */}
          <aside className="lg:col-span-3">
            <div className="space-y-2">
              <FilterAccordion title="Жанры" defaultOpen>
                <div className="space-y-1">
                  <FilterButton
                    onClick={() => setSelected((p) => ({ ...p, genre: "" }))}
                    active={selected.genre === ""}
                    label="Все жанры"
                  />
                  <div className="grid grid-cols-1 gap-1">
                    {filters.genres.slice(0, 12).map((g) => (
                      <FilterButton
                        key={g.genre}
                        onClick={() => setSelected((p) => ({ ...p, genre: g.genre }))}
                        active={selected.genre === g.genre}
                        label={g.genre}
                        count={g.count}
                      />
                    ))}
                  </div>
                </div>
              </FilterAccordion>

              <FilterAccordion title="Год выпуска">
                <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-2">
                    <FilterButton
                      onClick={() => setSelected((p) => ({ ...p, year: "" }))}
                      active={selected.year === ""}
                      label="Любой год"
                    />
                  </div>
                  {filters.years.slice(0, 8).map((y) => (
                    <FilterButton
                      key={y.year}
                      onClick={() => setSelected((p) => ({ ...p, year: String(y.year) }))}
                      active={selected.year === String(y.year)}
                      label={`${y.year}`}
                      centered
                    />
                  ))}
                </div>
              </FilterAccordion>

              <FilterAccordion title="Страна">
                <div className="space-y-1">
                  <FilterButton
                    onClick={() => setSelected((p) => ({ ...p, country: "" }))}
                    active={selected.country === ""}
                    label="Все страны"
                  />
                  {filters.countries.slice(0, 6).map((c) => (
                    <FilterButton
                      key={c.country}
                      onClick={() => setSelected((p) => ({ ...p, country: c.country }))}
                      active={selected.country === c.country}
                      label={c.country}
                    />
                  ))}
                </div>
              </FilterAccordion>

              <FilterAccordion title="Формат">
                <div className="space-y-1">
                  <FilterButton
                    onClick={() => setSelected((p) => ({ ...p, isSeries: "" }))}
                    active={selected.isSeries === ""}
                    label="Все форматы"
                  />
                  <FilterButton
                    onClick={() => setSelected((p) => ({ ...p, isSeries: "true" }))}
                    active={selected.isSeries === "true"}
                    label="Сериалы"
                  />
                  <FilterButton
                    onClick={() => setSelected((p) => ({ ...p, isSeries: "false" }))}
                    active={selected.isSeries === "false"}
                    label="Полнометражные"
                  />
                </div>
              </FilterAccordion>
            </div>
            
            <button
              type="button"
              onClick={() => setSelected({ year: "", country: "", genre: "", isSeries: "" })}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-white/5 py-4 text-xs font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-white/10 hover:text-white active:scale-95"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Сбросить фильтры
            </button>

            <div className="mt-12">
              <LatestComments />
            </div>
          </aside>

          {/* Grid */}
          <div className="lg:col-span-9">
            {loading ? (
              <div className="flex h-64 items-center justify-center">
                <LoadingSpinner />
              </div>
            ) : movies.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-900 ring-1 ring-white/10">
                  <svg className="h-10 w-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white">Ничего не найдено</h3>
                <p className="mt-2 text-slate-500">Попробуйте изменить параметры поиска или фильтры</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
