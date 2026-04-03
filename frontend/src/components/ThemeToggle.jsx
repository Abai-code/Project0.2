import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-9 w-16 cursor-pointer items-center rounded-full bg-slate-200 p-1 transition-colors duration-300 focus:outline-none dark:bg-slate-700 shadow-inner"
      aria-label="Toggle theme"
    >
      <div
        className={`flex h-7 w-7 transform items-center justify-center rounded-full bg-white text-lg transition-transform duration-300 ease-in-out shadow-md ${
          theme === "dark" ? "translate-x-7 bg-slate-800" : "translate-x-0"
        }`}
      >
        {theme === "dark" ? "🌙" : "☀️"}
      </div>
      <span className="sr-only">
        {theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      </span>
    </button>
  );
}
