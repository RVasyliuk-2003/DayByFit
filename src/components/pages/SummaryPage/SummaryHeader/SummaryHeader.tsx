import { useTranslation } from "react-i18next";

type Props = { subtitle: string };

const SummaryHeader = ({ subtitle }: Props) => {
  const { t } = useTranslation();

  return (
    <header className="top">
      <h1 className="h1">{t("summary.title")}</h1>
      <p className="p">{subtitle}</p>
    </header>
  );
};

export default SummaryHeader;
