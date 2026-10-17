import i18n from "./i18n";

export const toDateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fmtDur = (min: number) => {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h && m)
    return `${i18n.t("duration.h", { n: h })} ${i18n.t("duration.min", { n: m })}`;
  if (h) return i18n.t("duration.h", { n: h });
  return i18n.t("duration.min", { n: m });
};

export const parseDateKey = (key: string | null): Date | null => {
  if (!key) return null;
  const [y, m, d] = key.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return toDateKey(date) === key ? date : null;
};

export const shortDate = (key: string) => {
  const [, m, d] = key.split("-");
  return `${d}.${m}`;
};
