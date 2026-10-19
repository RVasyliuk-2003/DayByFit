import style from "./exerciseInput.module.css";

import { useState } from "react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  suggestions: string[];
  placeholder: string;
  className?: string; // клас самого поля, щоб воно виглядало як було
};

const ExerciseInput = ({
  value,
  onChange,
  suggestions,
  placeholder,
  className,
}: Props) => {
  const [open, setOpen] = useState(false);

  const query = value.trim().toLowerCase();
  const items = suggestions
    .filter((n) => n.toLowerCase().includes(query) && n.toLowerCase() !== query)
    .slice(0, 6);

  return (
    <div className={style.wrap}>
      <input
        className={className}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
      />

      {open && items.length > 0 && (
        <ul className={style.list}>
          {items.map((name) => (
            <li key={name}>
              <button
                type="button"
                className={style.item}
                // mousedown, а не click: click приходить уже після blur поля,
                // і список зникне раніше. preventDefault не дає полю втратити фокус.
                onMouseDown={(e) => {
                  e.preventDefault();
                  onChange(name);
                  setOpen(false);
                }}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ExerciseInput;
