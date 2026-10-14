import style from "./progressHeader.module.css";

const ProgressHeader = () => {
  return (
    <section className="top">
      <header>
        <h1 className={style.h1}>Прогрес</h1>
        <p className={style.p}>Будь-яка вправа за обраний період</p>
      </header>

      <select className={style.sel}></select>
    </section>
  );
};

export default ProgressHeader;
