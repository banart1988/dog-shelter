export type EnclosureStatus = "no-caretaker" | "overdue" | "warning" | "ok";

export function getEnclosureStatus(
  caretakerId: string | null,
  lastWalkedAt: string | Date | null
): EnclosureStatus {
  if (!caretakerId) return "no-caretaker";

  if (!lastWalkedAt) return "overdue";

  const daysSince =
    (Date.now() - new Date(lastWalkedAt).getTime()) / (1000 * 60 * 60 * 24);

  if (daysSince > 30) return "overdue";
  if (daysSince > 14) return "warning";
  return "ok";
}

export const STATUS_COLOR: Record<EnclosureStatus, string> = {
  "no-caretaker": "bg-black",
  overdue: "bg-red-500",
  warning: "bg-orange-400",
  ok: "bg-green-500",
};

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}
