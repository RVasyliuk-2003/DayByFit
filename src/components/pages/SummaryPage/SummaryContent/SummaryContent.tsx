import style from "./summaryContent.module.css";

import { useState } from "react";
import { useTranslation } from "react-i18next";

import type { Workout, WorkoutType } from "../../../../types";
import { fmtDur, toDateKey, shortDate } from "../../../../date";
import { getType, typeName } from "../../../../workoutTypes";
import {
  buildTable,
  getStats,
  shortDetails,
  toCsv,
  toTsv,
  type Period,
} from "../../../../summary";

type Props = {
  period: Period;
  onPeriod: (p: Period) => void;
  from: string;
  to: string;
  onFrom: (v: string) => void;
  onTo: (v: string) => void;
  rows: Workout[];
  invalid: boolean;
  types: WorkoutType[];
};

const PERIODS: Period[] = ["week", "month", "all", "custom"];

const MAX_ROWS = 8;

const SummaryContent = ({
  period,
  onPeriod,
  from,
  to,
  onFrom,
  onTo,
  rows,
  invalid,
  types,
}: Props) => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");

  const showMessage = (text: string) => {
    setMessage(text);
    setTimeout(() => setMessage(""), 2500);
  };

  const hasRows = rows.length > 0;
  const stats = getStats(rows, types);
  const tableRows = [...rows].reverse().slice(0, MAX_ROWS); // на екрані свіжі зверху
  const todayKey = toDateKey(new Date());

  const handleCsv = () => {
    const csv = toCsv(buildTable(rows, types));
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `daybyfit-${todayKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showMessage(t("summary.saved"));
  };

  const handleShare = async () => {
    const text = toTsv(buildTable(rows, types));
    try {
      if (navigator.share) {
        await navigator.share({ title: t("summary.shareTitle"), text });
      } else {
        await navigator.clipboard.writeText(text);
        showMessage(t("summary.copied"));
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // сам закрив вікно
      showMessage(t("summary.shareFailed"));
    }
  };

  return (
    <section style={{ padding: "20px 20px 24px" }}>
      <div className={style.wrap}>
        <div
          className={style.seg}
          role="group"
          aria-label={t("summary.periodLabel")}
        >
          {PERIODS.map((p) => (
            <button
              type="button"
              key={p}
              aria-pressed={period === p}
              onClick={() => onPeriod(p)}
            >
              {t(`summary.${p}`)}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div className={style.range}>
            <label>
              {t("summary.from")}
              <input
                type="date"
                value={from}
                max={todayKey}
                onChange={(e) => onFrom(e.target.value)}
              />
            </label>
            <label>
              {t("summary.to")}
              <input
                type="date"
                value={to}
                max={todayKey}
                onChange={(e) => onTo(e.target.value)}
              />
            </label>
          </div>
        )}

        {hasRows ? (
          <>
            <div className={style.split}>
              {stats.byType.map(({ type, count }) => (
                <div
                  key={type.id}
                  style={{ flex: count, background: type.color }}
                >
                  {typeName(type)} {count}
                </div>
              ))}
            </div>

            <div className={style.two}>
              <div>
                <span>{t("summary.totalTime")}</span>
                <strong>{fmtDur(stats.totalMin)}</strong>
              </div>
              <div>
                <span>
                  {t("summary.workoutsOften", { count: rows.length })}
                </span>
                <strong>
                  {stats.topTod
                    ? t(`timeOfDay.${stats.topTod}`).toLowerCase()
                    : "—"}
                </strong>
              </div>
            </div>

            <h2 className={style.h2}>{t("summary.tableTitle")}</h2>
            <table className={style.tbl}>
              <thead>
                <tr>
                  <th>{t("summary.colDate")}</th>
                  <th>{t("summary.colType")}</th>
                  <th>{t("summary.colTime")}</th>
                  <th>{t("summary.colDetails")}</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((w) => {
                  const type = getType(types, w.typeId);
                  return (
                    <tr key={w.id}>
                      <td>{shortDate(w.date)}</td>
                      <td>
                        <span
                          className={style.chip}
                          style={{ background: type?.color }}
                        >
                          {type ? typeName(type) : "—"}
                        </span>
                      </td>
                      <td>{fmtDur(w.durationMin)}</td>
                      <td>{shortDetails(w)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {rows.length > MAX_ROWS && (
              <p className={style.more}>
                {t("summary.shown", { shown: MAX_ROWS, total: rows.length })}
              </p>
            )}
          </>
        ) : (
          <p className={style.empty}>
            {invalid ? t("summary.invalid") : t("summary.noWorkouts")}
          </p>
        )}

        <div className={style.actions}>
          <button
            type="button"
            className={style.primary}
            onClick={handleShare}
            disabled={!hasRows}
          >
            {t("summary.share")}
          </button>
          <button
            type="button"
            className={style.ghost}
            onClick={handleCsv}
            disabled={!hasRows}
          >
            {t("summary.saveCsv")}
          </button>
        </div>

        {message && (
          <p className={style.message} role="status">
            {message}
          </p>
        )}
      </div>
    </section>
  );
};

export default SummaryContent;
