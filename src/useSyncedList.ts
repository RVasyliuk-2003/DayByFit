import { useEffect, useRef, useState } from "react";
import { useAuth } from "./auth/authContext";

type Options<T> = {
  storageKey: string;
  fetchAll: () => Promise<T[]>;
  insert: (item: T) => Promise<void>;
  remove?: (id: string) => Promise<void>;
  update?: (item: T) => Promise<void>;
};

// uid потрібен, щоб після зміни акаунта не показати чужий список
type Cloud<T> = { uid: string; list: T[] };

// зміна, яка ще не дійшла до бази
type Op<T> =
  | { kind: "add"; id: string; item: T }
  | { kind: "update"; id: string; item: T; prev?: T }
  | { kind: "remove"; id: string; prev?: T };

const readJson = <V>(key: string, fallback: V): V => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as V) : fallback;
  } catch {
    return fallback;
  }
};

const writeJson = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* сховище переповнене або недоступне */
  }
};

const errorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (typeof e === "object" && e && "message" in e) {
    return String((e as { message: unknown }).message);
  }
  return String(e);
};

// проблема зі зв'язком: спробуємо ще раз пізніше, зміну не відкочуємо
const isRetryable = (e: unknown) =>
  !navigator.onLine ||
  /fetch|network|load failed|timeout|abort|offline/i.test(errorMessage(e));

// 23505: такий запис уже є (перша спроба дійшла, а відповідь загубилась): це успіх
const isDuplicate = (e: unknown) =>
  typeof e === "object" && e !== null && (e as { code?: string }).code === "23505";

// накладаємо ще не надіслані зміни на свіжий список із бази
const applyOps = <T extends { id: string }>(list: T[], ops: Op<T>[]): T[] =>
  ops.reduce((acc, op) => {
    if (op.kind === "remove") return acc.filter((x) => x.id !== op.id);
    const exists = acc.some((x) => x.id === op.id);
    if (op.kind === "update") {
      return exists ? acc.map((x) => (x.id === op.id ? op.item : x)) : acc;
    }
    return exists
      ? acc.map((x) => (x.id === op.id ? op.item : x))
      : [...acc, op.item];
  }, list);

export const useSyncedList = <T extends { id: string }>({
  storageKey,
  fetchAll,
  insert,
  remove,
  update,
}: Options<T>) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const cacheKey = (uid: string) => `${storageKey}:cache:${uid}`;
  const outboxKey = (uid: string) => `${storageKey}:outbox:${uid}`;

  const [local, setLocal] = useState<T[]>(() => readJson<T[]>(storageKey, []));
  const [cloud, setCloud] = useState<Cloud<T> | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0); // збільшуємо, щоб повторити завантаження
  const [pending, setPending] = useState(0); // скільки змін чекає надсилання

  const queue = useRef<Op<T>[]>([]);
  const inflight = useRef<Op<T> | null>(null);
  const flushing = useRef(false);
  const stale = useRef(false); // останнє завантаження списку не вдалось
  const flushRef = useRef<() => Promise<void>>(async () => {});

  // дані гостя (без входу) зберігаємо в браузері
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(local));
  }, [storageKey, local]);

  // при вході підхоплюємо чергу й кеш цього користувача
  useEffect(() => {
    if (!userId) return;
    queue.current = readJson<Op<T>[]>(outboxKey(userId), []);
    setPending(queue.current.length);

    const cached = readJson<T[] | null>(cacheKey(userId), null);
    if (cached) {
      setCloud((prev) => (prev?.uid === userId ? prev : { uid: userId, list: cached }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, storageKey]);

  // свіжі дані з хмари; якщо зв'язку нема, лишається кеш
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetchAll()
      .then((server) => {
        if (cancelled) return;
        stale.current = false;
        setCloud({ uid: userId, list: applyOps(server, queue.current) });
      })
      .catch(() => {
        if (cancelled) return;
        stale.current = true;
        // є кеш: працюємо з ним без паніки; кешу нема: показуємо помилку
        if (readJson<T[] | null>(cacheKey(userId), null) === null) setError(true);
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, attempt, fetchAll]);

  // кеш оновлюється після кожної зміни списку
  useEffect(() => {
    if (cloud) writeJson(cacheKey(cloud.uid), cloud.list);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cloud, storageKey]);

  const items = !userId ? local : cloud?.uid === userId ? cloud.list : [];
  const loading = userId !== null && cloud?.uid !== userId && !error;

  const changeCloud = (fn: (list: T[]) => T[]) => {
    if (!userId) return;
    setCloud((prev) => ({
      uid: userId,
      list: fn(prev && prev.uid === userId ? prev.list : []),
    }));
  };

  // ───────── черга надсилання ─────────

  const drop = (op: Op<T>) => {
    if (!userId) return;
    const idx = queue.current.indexOf(op);
    if (idx >= 0) queue.current.splice(idx, 1);
    writeJson(outboxKey(userId), queue.current);
    setPending(queue.current.length);
  };

  const run = async (op: Op<T>) => {
    if (op.kind === "add") {
      try {
        await insert(op.item);
      } catch (e) {
        if (!isDuplicate(e)) throw e;
      }
    } else if (op.kind === "update") {
      if (update) await update(op.item);
    } else if (remove) {
      await remove(op.id);
    }
  };

  // сервер відмовив остаточно: повертаємо список як було
  const rollback = (op: Op<T>) => {
    if (op.kind === "add") {
      changeCloud((list) => list.filter((x) => x.id !== op.id));
    } else if (op.kind === "update") {
      const prev = op.prev;
      if (prev) changeCloud((list) => list.map((x) => (x.id === prev.id ? prev : x)));
    } else if (op.prev) {
      const prev = op.prev;
      changeCloud((list) => [...list, prev]);
    }
  };

  const flush = async () => {
    if (!userId || flushing.current) return;
    flushing.current = true;
    try {
      while (queue.current.length > 0) {
        const op = queue.current[0];
        inflight.current = op;
        try {
          await run(op);
        } catch (e) {
          inflight.current = null;
          if (isRetryable(e)) break; // залишаємо в черзі, спробуємо пізніше
          drop(op);
          rollback(op);
          setError(true);
          continue;
        }
        inflight.current = null;
        drop(op);
      }
    } finally {
      flushing.current = false;
      inflight.current = null;
    }
  };

  useEffect(() => {
    flushRef.current = flush;
  });

  // додаємо зміну в чергу, об'єднуючи з попередньою для того ж запису
  const enqueue = (op: Op<T>) => {
    if (!userId) return;
    const q = queue.current;

    let i = -1;
    for (let k = q.length - 1; k >= 0; k--) {
      if (q[k].id === op.id) {
        i = k;
        break;
      }
    }

    if (i === -1 || q[i] === inflight.current) {
      q.push(op); // операцію, що вже летить, не чіпаємо
    } else {
      const old = q[i];
      if (op.kind === "update" && old.kind === "add") {
        q[i] = { kind: "add", id: op.id, item: op.item };
      } else if (op.kind === "update" && old.kind === "update") {
        q[i] = { kind: "update", id: op.id, item: op.item, prev: old.prev };
      } else if (op.kind === "remove" && old.kind === "add") {
        q.splice(i, 1); // до сервера воно так і не дійшло
      } else if (op.kind === "remove" && old.kind === "update") {
        q[i] = { kind: "remove", id: op.id, prev: old.prev };
      } else {
        q.push(op);
      }
    }

    writeJson(outboxKey(userId), q);
    setPending(q.length);
    void flush();
  };

  // коли повертається зв'язок або застосунок знову відкрито, пробуємо надіслати
  useEffect(() => {
    if (!userId) return;

    const kick = () => {
      if (stale.current) setAttempt((a) => a + 1);
      void flushRef.current();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") kick();
    };

    window.addEventListener("online", kick);
    document.addEventListener("visibilitychange", onVisible);
    const timer = window.setInterval(() => {
      if (queue.current.length > 0 || stale.current) kick();
    }, 15000);
    void flushRef.current();

    return () => {
      window.removeEventListener("online", kick);
      document.removeEventListener("visibilitychange", onVisible);
      window.clearInterval(timer);
    };
  }, [userId]);

  // ───────── дії ─────────

  const add = (item: T) => {
    if (!userId) {
      setLocal((prev) => [...prev, item]);
      return;
    }
    changeCloud((list) => [...list, item]);
    enqueue({ kind: "add", id: item.id, item });
  };

  const change = (item: T) => {
    if (!userId) {
      setLocal((prev) => prev.map((x) => (x.id === item.id ? item : x)));
      return;
    }
    if (!update) return;
    const prev = items.find((x) => x.id === item.id);
    changeCloud((list) => list.map((x) => (x.id === item.id ? item : x)));
    enqueue({ kind: "update", id: item.id, item, prev });
  };

  const removeItem = (id: string) => {
    if (!userId) {
      setLocal((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    if (!remove) return;
    const prev = items.find((x) => x.id === id);
    changeCloud((list) => list.filter((x) => x.id !== id));
    enqueue({ kind: "remove", id, prev });
  };

  const retry = () => {
    setError(false);
    setAttempt((a) => a + 1);
    void flush();
  };

  return {
    items,
    loading,
    error: error && userId !== null,
    pending,
    add,
    remove: removeItem,
    change,
    retry,
    dismissError: () => setError(false),
  };
};