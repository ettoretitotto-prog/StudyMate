const ONE_DAY_MS = 86_400_000;

export function getAppTimeZone() {
  return process.env.NEXT_PUBLIC_APP_TIME_ZONE || "Europe/Rome";
}

export function formatDateKey(date = new Date(), timeZone = getAppTimeZone()) {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return `${year}-${month}-${day}`;
}

export function addDaysToDateKey(dateKey: string, days: number) {
  const date = new Date(`${dateKey}T12:00:00.000Z`);
  date.setTime(date.getTime() + days * ONE_DAY_MS);
  return date.toISOString().slice(0, 10);
}

export function getTodayDateKey() {
  return formatDateKey(new Date());
}

export function getDateRangeForKey(dateKey: string) {
  const nextDateKey = addDaysToDateKey(dateKey, 1);

  return {
    startIso: `${dateKey}T00:00:00.000Z`,
    endIso: `${nextDateKey}T00:00:00.000Z`
  };
}
