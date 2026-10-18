import { useTranslation } from "react-i18next";

const ExercisesHeader = () => {
  const { t } = useTranslation();

  return (
    <section>
      <header className="top">
        <h1 className="h1">{t("exercises.title")}</h1>
        <p className="p">{t("exercises.subtitle")}</p>
      </header>
    </section>
  );
};

export default ExercisesHeader;
