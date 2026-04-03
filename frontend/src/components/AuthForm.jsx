import { Link } from "react-router-dom";

const baseInputClass =
  "w-full rounded border border-slate-700 bg-slate-950 p-3 outline-none focus:border-red-500";

export default function AuthForm({
  title,
  fields,
  error,
  loading,
  submitLabel,
  loadingLabel,
  footerText,
  footerLinkTo,
  footerLinkLabel,
  onChange,
  onSubmit,
}) {
  return (
    <section className="mx-auto max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="mb-4 text-2xl font-bold">{title}</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((field) => (
          <input
            key={field.name}
            name={field.name}
            type={field.type}
            placeholder={field.placeholder}
            value={field.value}
            onChange={onChange}
            className={baseInputClass}
          />
        ))}
        {error && <p className="text-sm text-red-400">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-red-600 py-2 text-white hover:bg-red-500 disabled:opacity-60"
        >
          {loading ? loadingLabel : submitLabel}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-400">
        {footerText}{" "}
        <Link to={footerLinkTo} className="text-red-400 hover:text-red-300">
          {footerLinkLabel}
        </Link>
      </p>
    </section>
  );
}
