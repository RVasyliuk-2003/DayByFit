import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import uk from "./uk.json";
import en from "./en.json";

const STORAGE_KEY = "daybyfit:lang";

const readSaved = () => {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
};

i18n.use(initReactI18next).init({
  resources: { uk: { translation: uk }, en: { translation: en } },
  lng: readSaved() === "en" ? "en" : "uk",
  fallbackLng: "uk",
  interpolation: { escapeValue: false }, // React сам екранує текст
});

// <html lang="..."> оновлюється разом із мовою (читалки екрана, переноси)
const apply = (lng: string) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(STORAGE_KEY, lng);
  } catch {
    /* сховище недоступне */
  }
};
apply(i18n.language);
i18n.on("languageChanged", apply);

export default i18n;
