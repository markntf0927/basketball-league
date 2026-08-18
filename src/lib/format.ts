const dateTime = new Intl.DateTimeFormat("zh-Hant-HK", {
  timeZone: "Asia/Hong_Kong",
  month: "numeric",
  day: "numeric",
  weekday: "short",
  hour: "numeric",
  minute: "2-digit",
});

const dateOnly = new Intl.DateTimeFormat("zh-Hant-HK", {
  timeZone: "Asia/Hong_Kong",
  year: "numeric",
  month: "long",
  day: "numeric",
});

export function formatMatchWhen(date: Date) {
  return dateTime.format(date);
}

export function formatDate(date: Date) {
  return dateOnly.format(date);
}

export function youtubeId(url: string | null | undefined) {
  if (!url) return null;
  const watch = url.match(/[?&]v=([\w-]{11})/);
  if (watch) return watch[1];
  const short = url.match(/youtu\.be\/([\w-]{11})/);
  if (short) return short[1];
  return null;
}

export function pctLabel(value: number) {
  return value.toFixed(3).replace(/^0/, "");
}
