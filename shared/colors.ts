/**
 * Available colors for timer intervals
 */
export const INTERVAL_COLORS = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Red", value: "#ef4444" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Orange", value: "#f97316" },
  { name: "Pink", value: "#ec4899" },
  { name: "Cyan", value: "#06b6d4" },
  { name: "Amber", value: "#f59e0b" },
  { name: "Lime", value: "#84cc16" },
  { name: "Indigo", value: "#6366f1" },
] as const;

export type ColorValue = (typeof INTERVAL_COLORS)[number]["value"];

/**
 * Get color by value
 */
export function getColorName(value: string): string {
  const color = INTERVAL_COLORS.find((c) => c.value === value);
  return color?.name || "Blue";
}

/**
 * Get all available colors
 */
export function getAllColors() {
  return INTERVAL_COLORS;
}
