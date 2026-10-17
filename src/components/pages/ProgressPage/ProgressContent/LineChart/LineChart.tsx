import style from "./lineChart.module.css";

type Props = { values: number[]; labels: string[] };

const W = 340;
const H = 180;
const PL = 34;
const PR = 16;
const PT = 22;
const PB = 28;

const LineChart = ({ values, labels }: Props) => {
  const n = values.length;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const pad = Math.max(1, (max - min) * 0.25);
  const lo = Math.floor(min - pad);
  const hi = Math.ceil(max + pad);

  const x = (i: number) => PL + (i * (W - PL - PR)) / (n - 1);
  const y = (v: number) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB);

  const pts = values.map((v, i) => ({ x: x(i), y: y(v) }));
  const line = pts
    .map((p, i) => `${i ? "L" : "M"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const area = `${line} L${x(n - 1).toFixed(1)} ${H - PB} L${x(0).toFixed(1)} ${H - PB} Z`;

  const ticks = [lo, Math.round((lo + hi) / 2), hi];
  const labelStep = Math.ceil(n / 6); // не більше ~6 підписів
  const last = pts[n - 1];

  return (
    <svg
      className={style.chart}
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Графік прогресу"
    >
      {ticks.map((t) => (
        <g key={t}>
          <line
            className={style.grid}
            x1={PL}
            x2={W - PR}
            y1={y(t)}
            y2={y(t)}
          />
          <text className={style.tick} x={PL - 8} y={y(t) + 4} textAnchor="end">
            {t}
          </text>
        </g>
      ))}

      <path className={style.area} d={area} />
      <path className={style.line} d={line} />

      {pts.slice(0, -1).map((p, i) => (
        <circle key={i} className={style.dot} cx={p.x} cy={p.y} r={3.5} />
      ))}
      <circle className={style.lastDot} cx={last.x} cy={last.y} r={7} />
      <text
        className={style.lastVal}
        x={last.x}
        y={last.y - 14}
        textAnchor="end"
      >
        {values[n - 1]}
      </text>

      {labels.map(
        (l, i) =>
          (n - 1 - i) % labelStep === 0 && (
            <text
              key={i}
              className={style.tick}
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
            >
              {l}
            </text>
          ),
      )}
    </svg>
  );
};

export default LineChart;
