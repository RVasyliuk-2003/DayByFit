import style from "./installButton.module.css";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
};

const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

const isIos = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.userAgent)); // iPad з iPadOS

const InstallButton = () => {
  const { t } = useTranslation();
  const [installed, setInstalled] = useState(isStandalone);
  const [promptEvent, setPromptEvent] = useState<InstallEvent | null>(null);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    // Android / Chrome: браузер сам повідомляє, що застосунок можна встановити
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setPromptEvent(e as InstallEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setPromptEvent(null);
    };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (installed) return null; // уже встановлено, кнопка не потрібна

  const ios = isIos();
  if (!ios && !promptEvent) return null; // браузер не вміє або ще не дозволив встановлення

  const onClick = async () => {
    if (promptEvent) {
      await promptEvent.prompt();
      setPromptEvent(null);
    } else {
      setHint((v) => !v); // iPhone: показуємо підказку, програмно встановити не можна
    }
  };

  return (
    <div>
      <button type="button" className={style.btn} onClick={onClick}>
        {t("install.button")}
      </button>
      {hint && (
        <p className={style.hint} role="status">
          {t("install.ios")}
        </p>
      )}
    </div>
  );
};

export default InstallButton;
