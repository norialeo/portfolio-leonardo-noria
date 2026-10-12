// Cor de cada linguagem nos gráficos do GitHub (dentro da paleta do site).
const COLORS: Record<string, string> = {
  Python: "#3b82f6",
  Java: "#ffb224",
  "Jupyter Notebook": "#f97316",
  TypeScript: "#c8ff3d",
  JavaScript: "#facc15",
  Go: "#22d3ee",
  HTML: "#ef4444",
  CSS: "#a78bfa",
  Dart: "#2dd4bf",
};

export function languageColor(name: string) {
  return COLORS[name] ?? "#6f7a73";
}
