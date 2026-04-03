import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function NotFoundPage() {
  const { t } = useTranslation();
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-5xl font-bold text-red-500">{t("notFound.title")}</h1>
      <p className="text-slate-300">{t("notFound.subtitle")}</p>
      <Link to="/" className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500">
        {t("notFound.back")}
      </Link>
    </section>
  );
}
