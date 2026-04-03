import { useTheme } from "../context/ThemeContext";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { theme } = useTheme();
  const { t } = useTranslation();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-12 text-slate-600 transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-400">
      <div className="mx-auto max-w-6xl px-4">
        {/* SEO Header Block */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-bold text-slate-900 dark:text-slate-100">
            {t("footer.title")}
          </h2>
          <p className="leading-relaxed">
            {t("footer.description1")}
            <br className="mb-2" />
            {t("footer.description2")}
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{t("footer.collectionTitle")}</h3>
            <p>
              {t("footer.collectionText")}
            </p>
            <p>
              {t("footer.genresText")}
            </p>
            <p>
              {t("footer.genresList")}
            </p>
            <p>
              {t("footer.searchConvenience")}
            </p>
            <p className="font-medium text-slate-900 dark:text-slate-200 italic">
              {t("footer.partnership")}
            </p>
          </div>
        </div>

        {/* Legal Links Footer */}
        <div className="mt-12 flex flex-wrap justify-between items-center gap-6 border-t border-slate-200 pt-8 text-sm font-semibold uppercase tracking-wider dark:border-slate-800">
           <span className="text-slate-400 dark:text-slate-500 lowercase font-normal italic tracking-normal">
              {t("footer.copyright")}
           </span>
        </div>
      </div>
    </footer>
  );
}
