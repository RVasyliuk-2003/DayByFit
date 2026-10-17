import style from "./summaryContent.module.css";

import { useState } from "react";
import type { Workout, WorkoutType } from "../../../../types";
import { fmtDur, toDateKey } from "../../../../date";
import { plural } from "../../../../format";
import { getType, timeLabels } from "../../../../workoutTypes";
import {
  buildTable,
  getStats,
  shortDate,
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

const PERIODS: { value: Period; label: string }[] = [
  { value: "week", label: "Тиждень" },
  { value: "month", label: "Місяць" },
  { value: "all", label: "Весь час" },
  { value: "custom", label: "Період" },
];

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
    showMessage("Файл збережено");
  };

  const handleShare = async () => {
    const text = toTsv(buildTable(rows, types));
    try {
      if (navigator.share) {
        await navigator.share({ title: "Мої тренування", text });
      } else {
        await navigator.clipboard.writeText(text);
        showMessage("Таблицю скопійовано");
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return; // сам закрив вікно
      showMessage("Не вдалося поділитись. Спробуй зберегти як CSV");
    }
  };

  return (
    <section style={{ padding: "20px 20px 24px" }}>
      <div className={style.wrap}>
        <div className={style.seg} role="group" aria-label="Період підсумку">
          {PERIODS.map((p) => (
            <button
              type="button"
              key={p.value}
              aria-pressed={period === p.value}
              onClick={() => onPeriod(p.value)}
            >
              {p.label}
            </button>
          ))}
        </div>

        {period === "custom" && (
          <div className={style.range}>
            <label>
              Від
              <input
                type="date"
                value={from}
                max={todayKey}
                onChange={(e) => onFrom(e.target.value)}
              />
            </label>
            <label>
              До
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
                  {type.name} {count}
                </div>
              ))}
            </div>

            <div className={style.two}>
              <div>
                <span>Разом часу</span>
                <strong>{fmtDur(stats.totalMin)}</strong>
              </div>
              <div>
                <span>
                  {rows.length}{" "}
                  {plural(rows.length, "тренування", "тренування", "тренувань")}
                  , найчастіше
                </span>
                <strong>
                  {stats.topTod ? timeLabels[stats.topTod].toLowerCase() : "—"}
                </strong>
              </div>
            </div>

            <h2 className={style.h2}>Таблиця для надсилання</h2>
            <table className={style.tbl}>
              <thead>
                <tr>
                  <th>Дата</th>
                  <th>Тип</th>
                  <th>Час</th>
                  <th>Деталі</th>
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
                          {type?.name}
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
                Показано {MAX_ROWS} із {rows.length}. У файлі будуть усі.
              </p>
            )}
          </>
        ) : (
          <p className={style.empty}>
            {invalid
              ? "Обери обидві дати: початок має бути не пізніше за кінець."
              : "За цей період тренувань немає."}
          </p>
        )}

        <div className={style.actions}>
          <button
            type="button"
            className={style.primary}
            onClick={handleShare}
            disabled={!hasRows}
          >
            Поділитись таблицею
          </button>
          <button
            type="button"
            className={style.ghost}
            onClick={handleCsv}
            disabled={!hasRows}
          >
            Зберегти як CSV
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
