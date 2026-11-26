type AvatarProps = {
  name: string;
  photoUrl?: string | null;
  size?: "sm" | "md" | "lg";
};

const SIZE_CLASSES: Record<string, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-xl",
};

const COLORS = [
  "bg-rose-400", "bg-amber-400", "bg-emerald-400",
  "bg-sky-400", "bg-violet-400", "bg-pink-400",
];

function colorForName(name: string) {
  const code = name.charCodeAt(0) || 0;
  return COLORS[code % COLORS.length];
}

export function Avatar({ name, photoUrl, size = "md" }: AvatarProps) {
  const sizeClass = SIZE_CLASSES[size];
  const initial = name.trim().charAt(0).toUpperCase() || "?";

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClass} rounded-full object-cover border-2 border-white shadow`}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} ${colorForName(name)} rounded-full flex items-center justify-center font-semibold text-white border-2 border-white shadow`}
      title={name}
    >
      {initial}
    </div>
  );
}
