import style from "./coach.module.css";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { useAuth } from "../../auth/authContext";
import {
  askCoach,
  fetchCoachHistory,
  CoachLimitError,
  type CoachMessage,
} from "../../coach";

const SUGGESTIONS = ["coach.s1", "coach.s2", "coach.s3"] as const;

const Coach = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [height, setHeight] = useState(
    () => window.visualViewport?.height ?? window.innerHeight,
  );
  const bottomRef = useRef<HTMLDivElement>(null);

  // історія вантажиться при першому відкритті (і заново, якщо зайшов інший акаунт)
  useEffect(() => {
    if (!open || !userId || loadedFor === userId) return;
    let cancelled = false;

    fetchCoachHistory()
      .then((list) => {
        if (cancelled) return;
        setMessages(list);
        setLoadedFor(userId);
      })
      .catch(() => {
        if (!cancelled) setError(t("coach.loadFailed"));
      });

    return () => {
      cancelled = true;
    };
  }, [open, userId, loadedFor, t]);

  // висота панелі = видима область, тож клавіатура на телефоні не ховає поле вводу
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => setHeight(vv.height);
    vv.addEventListener("resize", update);
    return () => vv.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const ready = loadedFor === userId;
  const shown = ready ? messages : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [shown.length, sending, open, height]);

  const send = async (raw: string) => {
    const message = raw.trim();
    if (!message || sending || !ready) return;

    setSending(true);
    setError("");
    setText("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: message },
    ]);

    try {
      const reply = await askCoach(message);
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    } catch (e) {
      // повертаємо повідомлення в поле, щоб його можна було надіслати ще раз
      setMessages((prev) => prev.slice(0, -1));
      setText(message);
      setError(
        e instanceof CoachLimitError ? t("coach.limit") : t("coach.failed"),
      );
    } finally {
      setSending(false);
    }
  };

  if (!user) return null; // гостям тренер недоступний

  return (
    <>
      {!open && (
        <button
          type="button"
          className={style.fab}
          onClick={() => setOpen(true)}
          aria-label={t("coach.open")}
        >
          <svg
            viewBox="0 0 24 24"
            width="26"
            height="26"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <rect x="4" y="8" width="16" height="12" rx="3" />
            <path d="M12 8V5" />
            <circle cx="12" cy="3.5" r="1" />
            <circle cx="9" cy="14" r="1" fill="currentColor" />
            <circle cx="15" cy="14" r="1" fill="currentColor" />
            <path d="M2 13v3M22 13v3" />
          </svg>
        </button>
      )}

      {open && (
        <div
          className={style.panel}
          style={{ height }}
          role="dialog"
          aria-modal="true"
          aria-label={t("coach.title")}
        >
          <header className={style.head}>
            <div>
              <h2 className={style.title}>{t("coach.title")}</h2>
              <p className={style.sub}>{t("coach.subtitle")}</p>
            </div>
            <button
              type="button"
              className={style.close}
              onClick={() => setOpen(false)}
              aria-label={t("coach.close")}
            >
              ×
            </button>
          </header>

          <div className={style.list}>
            {ready && shown.length === 0 && (
              <div className={style.intro}>
                <p>{t("coach.intro")}</p>
                <div className={style.chips}>
                  {SUGGESTIONS.map((key) => (
                    <button
                      type="button"
                      key={key}
                      className={style.chip}
                      onClick={() => send(t(key))}
                    >
                      {t(key)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {shown.map((m) => (
              <div
                key={m.id}
                className={m.role === "user" ? style.user : style.bot}
              >
                {m.role === "user" ? (
                  m.content
                ) : (
                  <ReactMarkdown>{m.content}</ReactMarkdown>
                )}
              </div>
            ))}

            {sending && <div className={style.bot}>{t("coach.typing")}</div>}
            {error && (
              <p className={style.error} role="alert">
                {error}
              </p>
            )}
            <div ref={bottomRef} />
          </div>

          <form
            className={style.form}
            onSubmit={(e) => {
              e.preventDefault();
              void send(text);
            }}
          >
            <textarea
              className={style.input}
              rows={1}
              value={text}
              placeholder={t("coach.placeholder")}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                // на комп'ютері Enter надсилає, Shift+Enter новий рядок; на телефоні Enter це новий рядок
                if (
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  !e.nativeEvent.isComposing &&
                  window.matchMedia("(pointer: fine)").matches
                ) {
                  e.preventDefault();
                  void send(text);
                }
              }}
            />
            <button
              type="submit"
              className={style.send}
              disabled={sending || !ready || !text.trim()}
              aria-label={t("coach.send")}
            >
              ↑
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default Coach;
