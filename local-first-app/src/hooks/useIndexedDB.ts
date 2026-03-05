import { useState, useEffect } from "react";

const DB_NAME = "local-first-db";
const DB_VERSION = 1;
const STORE_NAME = "app-state";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

async function getValue<T>(key: string): Promise<T | undefined> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T | undefined);
  });
}

async function setValue<T>(key: string, value: T): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(value, key);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

export function useIndexedDB<T>(key: string, initialValue: T) {
  const [count, setCount_] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getValue<T>(key).then((storedValue) => {
      if (storedValue !== undefined) {
        setCount_(storedValue);
      }
      setIsLoading(false);
    });
  }, [key]);

  const setCount = (newValue: T | ((prev: T) => T)) => {
    setCount_((prev) => {
      const resolvedValue =
        newValue instanceof Function ? newValue(prev) : newValue;
      setValue(key, resolvedValue);
      return resolvedValue;
    });
  };

  return [count, setCount, isLoading] as const;
}
