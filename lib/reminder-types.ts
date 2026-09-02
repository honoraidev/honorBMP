// Client-safe reminder types & helpers — no store/db imports, so this module
// can be pulled into client components without dragging mysql2 into the bundle.

export type ReminderLevel = "overdue" | "due_soon" | "upcoming";

export interface Reminder {
  id: string;
  level: ReminderLevel;
  title: string;
  detail: string;
  href: string;
  dueDate: string;
  daysLeft: number;
}

export function reminderCountLabel(daysLeft: number): string {
  if (daysLeft < 0) return `已逾期 ${Math.abs(daysLeft)} 天`;
  if (daysLeft === 0) return "今日截止";
  return `尚有 ${daysLeft} 天`;
}
