/**
 * Calculate the number of days from today to a target date string (dd/MM/yyyy)
 * Returns 0 if the date is in the past.
 */
export function daysToDate(dateStr: string): number {
  const [day, month, year] = dateStr.split('/').map(Number);
  const target = new Date(year, month - 1, day);
  const now = new Date();
  // Zero out time for both dates
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.max(0, Math.ceil((target.getTime() - now.getTime()) / msPerDay));
}
