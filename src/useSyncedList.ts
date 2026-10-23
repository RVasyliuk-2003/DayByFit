import { useEffect, useState } from "react";
import { useAuth } from "./auth/authContext";

type Options<T> = {
  storageKey: string;
  fetchAll: () => Promise<T[]>;
  insert: (item: T) => Promise<void>;
  remove?: (id: string) => Promise<void>;
  update?: (item: T) => Promise<void>;
};

// uid потрібен, щоб після зміни акаунта не показати чужий список, поки вантажиться свій
type Cloud<T> = { uid: string; list: T[] };

const readLocal = <T>(key: string): T[] => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
};

export const useSyncedList = <T extends { id: string }>({
  storageKey,
  fetchAll,
  insert,
  remove,
  update,
}: Options<T>) => {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [local, setLocal] = useState<T[]>(() => readLocal<T>(storageKey));
  const [cloud, setCloud] = useState<Cloud<T> | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0); // збільшуємо, щоб повторити завантаження

  // дані гостя (без входу) зберігаємо в браузері
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(local));
  }, [storageKey, local]);

  // після входу завантажуємо дані акаунта
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    fetchAll()
      .then((list) => {
        if (!cancelled) setCloud({ uid: userId, list });
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, attempt, fetchAll]);

  const items = !userId ? local : cloud?.uid === userId ? cloud.list : [];
  const loading = userId !== null && cloud?.uid !== userId && !error;

  const changeCloud = (fn: (list: T[]) => T[]) =>
    setCloud((prev) =>
      prev && prev.uid === userId
        ? { uid: prev.uid, list: fn(prev.list) }
        : prev,
    );

  // оптимістично: спершу показуємо, потім пишемо в базу; не вийшло, то відкочуємо
  const add = (item: T) => {
    if (!userId) {
      setLocal((prev) => [...prev, item]);
      return;
    }
    changeCloud((list) => [...list, item]);
    insert(item).catch(() => {
      changeCloud((list) => list.filter((x) => x.id !== item.id));
      setError(true);
    });
  };

  const removeItem = (id: string) => {
    if (!userId) {
      setLocal((prev) => prev.filter((x) => x.id !== id));
      return;
    }
    if (!remove) return;
    const removed = items.find((x) => x.id === id);
    changeCloud((list) => list.filter((x) => x.id !== id));
    remove(id).catch(() => {
      if (removed) changeCloud((list) => [...list, removed]);
      setError(true);
    });
  };

    // замінюємо елемент із тим самим id; у разі збою повертаємо старий
  const change = (item: T) => {
    if (!userId) {
      setLocal((prev) => prev.map((x) => (x.id === item.id ? item : x)));
      return;
    }
    if (!update) return;
    const before = items.find((x) => x.id === item.id);
    changeCloud((list) => list.map((x) => (x.id === item.id ? item : x)));
    update(item).catch(() => {
      if (before) {
        changeCloud((list) => list.map((x) => (x.id === before.id ? before : x)));
      }
      setError(true);
    });
  };

  const retry = () => {
    setError(false);
    setAttempt((a) => a + 1);
  };

  return {
    items,
    loading,
    error: error && userId !== null,
    add,
    remove: removeItem,
    change,
    retry,
    dismissError: () => setError(false),
  };
};
