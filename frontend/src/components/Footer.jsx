import { useTheme } from "../context/ThemeContext";

import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/5 bg-slate-950/80 pt-16 pb-8 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-12">
          {/* Brand & Mission */}
          <div className="space-y-6 md:col-span-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-600/20">
                <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2z" />
                </svg>
              </div>
              <span className="text-xl font-black text-white">MOVIEHUB</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-400">
              Ваш персональный путеводитель в мире кино. Смотрите лучшие новинки и классику мирового кинематографа в высоком качестве.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-2 gap-8 md:col-span-3">
            <div className="space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-white">Разделы</h4>
              <ul className="space-y-2 text-sm text-slate-500">
                <li><Link to="/" className="hover:text-red-500 transition-colors">Главная</Link></li>
                <li><Link to="/favorites" className="hover:text-red-500 transition-colors">Избранное</Link></li>
                <li><Link to="/profile" className="hover:text-red-500 transition-colors">Личный кабинет</Link></li>
              </ul>
            </div>
          </div>

          {/* SEO Highlight */}
          <div className="space-y-4 md:col-span-5">
            <h4 className="text-xs font-black uppercase tracking-widest text-white">MovieHub - кино онлайн</h4>
            <div className="space-y-3 text-[13px] leading-relaxed text-slate-500">
              <p>
                Рады приветствовать на сайте MovieHub всех любителей качественного кино! У нас вы найдете классику Голливуда, европейское кино, азиатские новинки и современные хиты.
              </p>
              <p>
                Наша коллекция регулярно обновляется. Мы следим за всеми новинками проката, чтобы вы могли наслаждаться просмотром одними из первых.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute bottom-0 right-0 -z-10 h-64 w-64 rounded-full bg-red-600/5 blur-[120px]" />
    </footer>
  );
}

