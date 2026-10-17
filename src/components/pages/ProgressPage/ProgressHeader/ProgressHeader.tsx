import style from "./progressHeader.module.css";

type Props = {
  names: string[];
  value: string;
  onChange: (name: string) => void;
};

const ProgressHeader = ({ names, value, onChange }: Props) => {
  return (
    <section className="top">
      <header>
        <h1 className={style.h1}>Прогрес</h1>
        <p className={style.p}>Будь-яка вправа за обраний період</p>
      </header>

      {names.length > 0 && (
        <select
          className={style.sel}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Вправа"
        >
          {names.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      )}
    </section>
  );
};

export default ProgressHeader;
