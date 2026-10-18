import { useTranslation } from "react-i18next";
import { getLocale } from "../../../../i18n/locale";
import { toDateKey } from "../../../../date";
import { useWorkoutDate } from "../../../../useWorkoutDate";

const AddWorkoutHeader = () => {
  const { t, i18n } = useTranslation();
  const locale = getLocale(i18n.language);
  const { dateObj, dateKey } = useWorkoutDate();

  const isToday = dateKey === toDateKey(new Date());

  const dayMonth = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
  }).format(dateObj);

  const weekday = new Intl.DateTimeFormat(locale, { weekday: "long" }).format(
    dateObj,
  );
  const prefix = isToday
    ? t("form.today")
    : weekday.charAt(0).toUpperCase() + weekday.slice(1);

  return (
    <section>
      <header className="top">
        <h1 className="h1">{t("form.title")}</h1>
        <p className="p">
          {prefix}, {dayMonth}
        </p>
      </header>
    </section>
  );
};

export default AddWorkoutHeader;
