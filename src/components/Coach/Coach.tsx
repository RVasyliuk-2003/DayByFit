import style from "./coach.module.css";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { useAuth } from "../../auth/authContext";
import {
  askCoach,
  clearCoach,
  fetchAbout,
  fetchCoachHistory,
  saveAbout,
  CoachLimitError,
  type CoachMessage,
} from "../../coach";

const SUGGESTIONS = ["coach.s1", "coach.s2", "coach.s3"] as const;

// спеціальні «нерозривні» дефіси не дають рядкові перенестись
const clean = (s: string) => s.replace(/[\u2010\u2011\u2012]/g, "-");

const Markdown = ({ text }: { text: string }) => (
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      // таблиця може бути ширшою за бульбашку, тому гортається вбік
      table: ({ children }) => (
        <div className={style.tableWrap}>
          <table>{children}</table>
        </div>
      ),
    }}
  >
    {clean(text)}
  </ReactMarkdown>
);

const readViewport = () => ({
  height: window.visualViewport?.height ?? window.innerHeight,
  top: window.visualViewport?.offsetTop ?? 0,
});

const FAB = 52; // розмір кнопки
const NAV_SPACE = 90; // висота нижньої навігації

type FabPos = { side: "left" | "right"; top: number };

const clampTop = (top: number) =>
  Math.min(Math.max(top, 12), window.innerHeight - FAB - NAV_SPACE);

const loadFab = (): FabPos => {
  try {
    const p = JSON.parse(localStorage.getItem("coachFab") ?? "null");
    if (
      (p?.side === "left" || p?.side === "right") &&
      typeof p.top === "number"
    )
      return p;
  } catch {
    /* сховище недоступне */
  }
  return { side: "right", top: window.innerHeight - FAB - 112 };
};

const Coach = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<CoachMessage[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [vp, setVp] = useState(readViewport);

  // екран «Про мене»
  const [view, setView] = useState<"chat" | "about">("chat");
  const [about, setAbout] = useState("");
  const [aboutState, setAboutState] = useState<
    "idle" | "loading" | "saving" | "saved" | "error"
  >("idle");

  // перетягування кнопки
  const [fab, setFab] = useState(loadFab);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    offX: number;
    offY: number;
    moved: boolean;
  } | null>(null);

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
      .catch((e) => {
        if (!cancelled)
          setError(
            e instanceof CoachLimitError
              ? t("coach.limit")
              : `${t("coach.failed")} (${e instanceof Error ? e.message : "?"})`,
          );
      });

    return () => {
      cancelled = true;
    };
  }, [open, userId, loadedFor, t]);

  // панель лишається в межах ВИДИМОЇ області: і за висотою, і за зсувом
  useEffect(() => {
    const v = window.visualViewport;
    if (!v) return;
    const update = () => setVp(readViewport());
    v.addEventListener("resize", update);
    v.addEventListener("scroll", update);
    return () => {
      v.removeEventListener("resize", update);
      v.removeEventListener("scroll", update);
    };
  }, []);

  // поки чат відкритий, сторінка під ним не гортається
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // при закритті чату наступного разу починаємо з екрана розмови
  useEffect(() => {
    if (!open) setView("chat");
  }, [open]);

  // завантажуємо «Про мене», коли відкриваємо цей екран
  useEffect(() => {
    if (view !== "about" || !userId) return;
    let cancelled = false;
    fetchAbout()
      .then((a) => {
        if (cancelled) return;
        setAbout(a);
        setAboutState("idle");
      })
      .catch(() => {
        if (!cancelled) setAboutState("error");
      });
    return () => {
      cancelled = true;
    };
  }, [view, userId]);

  const ready = loadedFor === userId;
  const shown = ready ? messages : [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [shown.length, streaming, open, vp.height]);

  const clear = async () => {
    if (sending || !window.confirm(t("coach.clearConfirm"))) return;

    // друге питання: чи стирати довготривалі нотатки про користувача
    const forget = window.confirm(t("coach.forgetConfirm"));
    try {
      await clearCoach(forget);
      setMessages([]);
      setError("");
    } catch {
      setError(t("coach.failed"));
    }
  };

  const send = async (raw: string) => {
    const message = raw.trim();
    if (!message || sending || !ready) return;

    setSending(true);
    setError("");
    setText("");
    setStreaming("");
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", content: message },
    ]);

    try {
      const reply = await askCoach(message, setStreaming);
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
      setStreaming(null);
      setSending(false);
    }
  };

  const openAbout = () => {
    setAboutState("loading");
    setView("about");
  };

  const saveAboutText = async () => {
    if (!userId) return;
    setAboutState("saving");
    try {
      await saveAbout(userId, about.trim());
      setAboutState("saved");
    } catch {
      setAboutState("error");
    }
  };

  const onFabDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      offX: e.clientX - r.left,
      offY: e.clientY - r.top,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onFabMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    if (!d) return;
    if (!d.moved && Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 8)
      return;
    d.moved = true;
    setDrag({ x: e.clientX - d.offX, y: e.clientY - d.offY });
  };

  const onFabUp = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;

    if (!d.moved) {
      setOpen(true); // звичайний тап
      return;
    }

    // відпустили: прилипаємо до найближчого боку
    const next: FabPos = {
      side: e.clientX < window.innerWidth / 2 ? "left" : "right",
      top: clampTop(e.clientY - d.offY),
    };
    setFab(next);
    setDrag(null);
    try {
      localStorage.setItem("coachFab", JSON.stringify(next));
    } catch {
      /* не страшно */
    }
  };

  const onFabCancel = () => {
    dragRef.current = null;
    setDrag(null);
  };

  // УСІ хуки вище; ранній вихід лише тут
  if (!user) return null; // гостям тренер недоступний

  const showChips = ready && !sending && !text && !focused;

  return (
    <>
      {!open && (
        <button
          type="button"
          className={`${style.fab} ${fab.side === "left" ? style.fabLeft : ""}`}
          style={
            drag
              ? { left: drag.x, top: drag.y, right: "auto", bottom: "auto" }
              : { top: clampTop(fab.top), bottom: "auto" }
          }
          onPointerDown={onFabDown}
          onPointerMove={onFabMove}
          onPointerUp={onFabUp}
          onPointerCancel={onFabCancel}
          onClick={(e) => {
            // тап пальцем обробляє pointerup; тут лише клавіатура (Enter/Space)
            if (e.detail === 0) setOpen(true);
          }}
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
          style={{ top: vp.top, height: vp.height }}
          role="dialog"
          aria-modal="true"
          aria-label={t("coach.title")}
        >
          <header className={style.head}>
            <div>
              <h2 className={style.title}>{t("coach.title")}</h2>
              <p className={style.sub}>{t("coach.subtitle")}</p>
            </div>
            <div className={style.actions}>
              {view === "chat" && (
                <button
                  type="button"
                  className={style.clear}
                  onClick={openAbout}
                >
                  {t("coach.about")}
                </button>
              )}
              {view === "chat" && shown.length > 0 && (
                <button type="button" className={style.clear} onClick={clear}>
                  {t("coach.clear")}
                </button>
              )}
              <button
                type="button"
                className={style.close}
                onClick={() => setOpen(false)}
                aria-label={t("coach.close")}
              >
                ×
              </button>
            </div>
          </header>

          {view === "about" ? (
            <div className={style.about}>
              <p className={style.aboutHint}>{t("coach.aboutHint")}</p>
              <textarea
                className={style.aboutInput}
                value={about}
                maxLength={1000}
                placeholder={t("coach.aboutPlaceholder")}
                disabled={aboutState === "loading"}
                onChange={(e) => {
                  setAbout(e.target.value);
                  setAboutState("idle");
                }}
              />
              <div className={style.aboutRow}>
                <small>{about.length}/1000</small>
                {aboutState === "saved" && (
                  <small>{t("coach.aboutSaved")}</small>
                )}
                {aboutState === "error" && (
                  <small className={style.error}>{t("coach.failed")}</small>
                )}
              </div>
              <div className={style.aboutBtns}>
                <button
                  type="button"
                  className={style.aboutSave}
                  onClick={saveAboutText}
                  disabled={aboutState === "saving" || aboutState === "loading"}
                >
                  {t("coach.aboutSave")}
                </button>
                <button
                  type="button"
                  className={style.clear}
                  onClick={() => setView("chat")}
                >
                  {t("coach.aboutBack")}
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className={style.list}>
                {ready && shown.length === 0 && streaming === null && (
                  <p className={style.intro}>{t("coach.intro")}</p>
                )}

                {shown.map((m) => (
                  <div
                    key={m.id}
                    className={m.role === "user" ? style.user : style.bot}
                  >
                    {m.role === "user" ? (
                      m.content
                    ) : (
                      <Markdown text={m.content} />
                    )}
                  </div>
                ))}

                {streaming !== null && (
                  <div className={style.bot}>
                    {streaming ? (
                      <Markdown text={streaming} />
                    ) : (
                      t("coach.typing")
                    )}
                  </div>
                )}

                {error && (
                  <p className={style.error} role="alert">
                    {error}
                  </p>
                )}
                <div ref={bottomRef} />
              </div>

              <div className={style.footer}>
                {showChips && (
                  <div className={style.quick}>
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
                )}

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
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
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
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Coach;
