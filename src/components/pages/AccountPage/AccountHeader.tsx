import { useTranslation } from "react-i18next";
import { useAuth } from "../../../auth/authContext";

const AccountHeader = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  return (
    <header className="top">
      <h1 className="h1">{t("account.title")}</h1>
      <p className="p">{user ? user.email : t("account.subtitleOut")}</p>
    </header>
  );
};

export default AccountHeader;
