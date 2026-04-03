export default function Toast({ message, type = "success" }) {
  if (!message) {
    return null;
  }

  const colors =
    type === "error"
      ? "bg-red-600/90 border-red-400"
      : "bg-emerald-600/90 border-emerald-400";

  return (
    <div className={`fixed right-4 top-20 z-30 rounded border px-4 py-2 text-white shadow ${colors}`}>
      {message}
    </div>
  );
}
