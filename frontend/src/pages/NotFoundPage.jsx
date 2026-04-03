import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-5xl font-bold text-red-500">404</h1>
      <p className="text-slate-300">Страница не найдена</p>
      <Link to="/" className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-500">
        На главную
      </Link>
    </section>
  );
}
