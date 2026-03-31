const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

const MINUTE = 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;

export function relativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffSec = Math.floor((date.getTime() - now.getTime()) / 1000);
  const absDiff = Math.abs(diffSec);

  if (absDiff < MINUTE) {
    return "just now";
  }
  if (absDiff < HOUR) {
    const mins = Math.round(absDiff / MINUTE);
    return rtf.format(-mins, "minute");
  }
  if (absDiff < DAY) {
    const hours = Math.round(absDiff / HOUR);
    return rtf.format(-hours, "hour");
  }
  if (absDiff < WEEK) {
    const days = Math.round(absDiff / DAY);
    return rtf.format(-days, "day");
  }

  // Older than a week: show short date
  return date.toLocaleDateString("en", { month: "short", day: "numeric" });
}
