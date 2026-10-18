import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { Workout, WorkoutType } from "../../../types";
import { toDateKey } from "../../../date";
import { getRange, getRows, getSubtitle, type Period } from "../../../summary";
import SummaryHeader from "./SummaryHeader/SummaryHeader";
import SummaryContent from "./SummaryContent/SummaryContent";

type Props = { workouts: Workout[]; types: WorkoutType[] };

const SummaryPage = ({ workouts, types }: Props) => {
  useTranslation();
  const today = toDateKey(new Date());

  const [period, setPeriod] = useState<Period>("month");
  const [from, setFrom] = useState(`${today.slice(0, 8)}01`); // перше число місяця
  const [to, setTo] = useState(today);

  const range = getRange(period, from, to);
  const rows = getRows(workouts, range);

  return (
    <section>
      <SummaryHeader subtitle={getSubtitle(period, from, to)} />
      <SummaryContent
        period={period}
        onPeriod={setPeriod}
        from={from}
        to={to}
        onFrom={setFrom}
        onTo={setTo}
        rows={rows}
        invalid={range === null}
        types={types}
      />
    </section>
  );
};

export default SummaryPage;
