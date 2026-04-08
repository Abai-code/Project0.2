import { useTheme } from "../context/ThemeContext";

export default function Footer() {
  const { theme } = useTheme();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-12 text-slate-600 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
      <div className="mx-auto max-w-6xl px-4">
        {/* SEO Header Block */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
            MovieHub - фильмы и сериалы онлайн
          </h2>
          <p className="leading-relaxed">
            Рады приветствовать на сайте MovieHub всех любителей интересного и качественного кино! Вы любите кинематограф так же как мы? Постоянно следите за выходом новинок? Не проходит ни одного вечера, чтобы вы не посмотрели пару-тройку фильмов?
            <br className="mb-2" />
            Тогда вы пришли точно по адресу! В нашем кинотеатре можно смотреть фильмы онлайн бесплатно и без каких-либо ограничений!
          </p>
        </div>

        {/* Main SEO Content with Mascot */}
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
          <div className="flex justify-center md:col-span-3">
            <div className="rounded-2xl bg-slate-100 p-1 shadow-xl shadow-slate-200 transition-transform hover:scale-105 dark:bg-slate-800 dark:shadow-none">
              <img
                src="/mascot.jpg"
                alt="Mascot"
                className="h-56 w-56 rounded-xl object-cover"
              />
            </div>
          </div>

          <div className="space-y-4 md:col-span-9">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Лучшая коллекция</h3>
            <p>
              Специально для наших уважаемых пользователей мы постарались собрать лучшую коллекцию фильмов различных жанров, времен и народов! Команда проекта постоянно следит за выходом фильмов в прокат и регулярно добавляет картины, чтобы вы могли одними из первых наслаждаться как лучшими мировыми шедеврами, так и новинками кино совершенно бесплатно!
            </p>
            <p>
              У нас вы найдете лучшие фильмы «Золотой эпохи» Голливуда, классическое европейское кино, лучшие французские комедии, азиатское кино, советские картины и современные хиты различных лет.
            </p>
            <p>
              Мы собрали внушительную коллекцию боевиков и триллеров, фэнтези и фантастики, драм и мелодрам, здесь же вы найдете комедии, ужасы, приключенческие и исторические ленты.
            </p>
            <p>
              Специально для вашего удобства на сайте действует поисковая строка, благодаря которой можно быстро отыскать нужный фильм. Мы стараемся удовлетворять запросы широкого круга зрителей, поэтому оперативно добавляем новые фильмы практически сразу после их выхода в прокат.
            </p>
            <p className="font-medium text-slate-900 dark:text-slate-200 italic">
              Наш кинотеатр готов стать верным партнером и помощником в мире кино!
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
