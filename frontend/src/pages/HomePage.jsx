import { useEffect, useState } from "react";
import client from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import MovieCard from "../components/MovieCard";
import HeroSlider from "../components/HeroSlider";
import LatestComments from "../components/LatestComments";

const FilterAccordion = ({ title, children, defaultOpen = false }) => (
  <details className="group mb-[2px] overflow-hidden bg-[#3a3a3a] first:rounded-t-lg last:rounded-b-lg shadow-sm" open={defaultOpen}>
    <summary className="flex cursor-pointer select-none items-center justify-between bg-[#454545] px-4 py-3 text-[15px] font-bold text-[#e1e1e1] list-none transition-colors hover:text-white [&::-webkit-details-marker]:hidden">
      {title}
      <svg className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </summary>
    <div className="relative bg-[#343434] p-3 pb-4">
      <div className="absolute left-0 right-0 top-0 border-t-[3px] border-dotted border-[#282828]"></div>
      <div className="pt-2">{children}</div>
    </div>
  </details>
);

const FilterButton = ({ onClick, active, label, count, centered = false }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center rounded-[3px] bg-[#292929] px-3 py-[9px] text-[13px] transition-colors hover:bg-[#3d3d3d] ${centered ? "justify-center" : "justify-between"}`}
  >
    <span className={active ? "text-[#e53935]" : "text-[#c2c2c2] hover:text-white"}>{label}</span>
    {count !== undefined && <span className="text-xs text-[#888888]">{count}</span>}
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
    <section className="space-y-6">
      <HeroSlider />
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Каталог фильмов</h1>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded border border-slate-700 bg-slate-900 px-3 py-2 text-sm outline-none focus:border-red-500"
          >
            <option value="new">Сначала новые</option>
            <option value="old">Сначала старые</option>
            <option value="rating">По рейтингу</option>
          </select>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Live search по названию..."
            className="w-full rounded border border-slate-700 bg-slate-900 px-4 py-2 outline-none focus:border-red-500 sm:w-80"
          />
        </div>
      </div>

      {error && <p className="text-red-400 font-bold bg-red-500/10 p-4 rounded-lg">{error}</p>}
      
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <aside className="lg:col-span-3">
          <div className="flex flex-col overflow-hidden rounded-lg bg-[#343434] shadow-lg border border-[#3a3a3a]">
            <FilterAccordion title="Фильмы / Категории" defaultOpen>
              <div className="flex flex-col gap-1">
                <FilterButton
                  onClick={() => setSelected((p) => ({ ...p, genre: "" }))}
                  active={selected.genre === ""}
                  label="Все фильмы"
                  count={filters.genres.reduce((acc, g) => acc + g.count, 0) || undefined}
                />
                <div className="mt-1 grid grid-cols-2 gap-1">
                  {filters.genres.slice(0, 20).map((g) => (
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

            <FilterAccordion title="По году">
              <div className="flex flex-col gap-1">
                <FilterButton
                  onClick={() => setSelected((p) => ({ ...p, year: "" }))}
                  active={selected.year === ""}
                  label="Все года"
                  centered
                />
                <div className="grid grid-cols-3 gap-1">
                  {filters.years.slice(0, 15).map((y) => (
                    <FilterButton
                      key={y.year}
                      onClick={() => setSelected((p) => ({ ...p, year: String(y.year) }))}
                      active={selected.year === String(y.year)}
                      label={`${y.year}`}
                      centered
                    />
                  ))}
                </div>
              </div>
            </FilterAccordion>

            <FilterAccordion title="По странам">
              <div className="flex flex-col gap-1">
                <FilterButton
                  onClick={() => setSelected((p) => ({ ...p, country: "" }))}
                  active={selected.country === ""}
                  label="Все страны"
                />
                <div className="grid grid-cols-2 gap-1">
                  {filters.countries.slice(0, 10).map((c) => (
                    <FilterButton
                      key={c.country}
                      onClick={() => setSelected((p) => ({ ...p, country: c.country }))}
                      active={selected.country === c.country}
                      label={c.country}
                    />
                  ))}
                </div>
              </div>
            </FilterAccordion>

            <FilterAccordion title="Сериалы">
              <div className="flex flex-col gap-1">
                <FilterButton
                  onClick={() => setSelected((p) => ({ ...p, isSeries: "" }))}
                  active={selected.isSeries === ""}
                  label="Все видео"
                />
                <FilterButton
                  onClick={() => setSelected((p) => ({ ...p, isSeries: "true" }))}
                  active={selected.isSeries === "true"}
                  label="Только сериалы"
                />
                <FilterButton
                  onClick={() => setSelected((p) => ({ ...p, isSeries: "false" }))}
                  active={selected.isSeries === "false"}
                  label="Только фильмы"
                />
              </div>
            </FilterAccordion>
          </div>
          
          <button
            type="button"
            onClick={() => setSelected({ year: "", country: "", genre: "", isSeries: "" })}
            className="mt-4 w-full rounded border border-slate-700 bg-slate-900 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-800 hover:text-white shadow-md mb-8"
          >
            Сбросить фильтры
          </button>

          <LatestComments />
        </aside>

        <div className="lg:col-span-9">
          {loading ? (
            <div className="flex justify-center p-10"><LoadingSpinner /></div>
          ) : movies.length === 0 ? (
            <div className="text-center py-10 text-slate-500 italic">Фильмы не найдены</div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
