"use client";

/**
 * Holds the user-supplied local media file for the "open a file" source.
 *
 * A local file can't live in the URL like a YouTube id, so we keep it here:
 *   - in memory for the active session, and
 *   - cached once in IndexedDB (best-effort) so a reload can restore the same
 *     file without re-picking it.
 *
 * Keyed by a short opaque id that DOES go in the URL (`?src=local:<id>`), so a
 * reload knows which cached file to reopen. All IndexedDB access is defensive.
 */

import { create } from "zustand";

export interface LocalSource {
  id: string;
  file: File;
  name: string;
}

const DB_NAME = "looper";
const STORE_NAME = "local-media";

function isBrowser(): boolean {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openDb(): Promise<IDBDatabase | null> {
  if (!isBrowser()) return Promise.resolve(null);
  return new Promise((resolve) => {
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

/** Generate a short id without Math.random (works in all environments). */
function makeId(): string {
  const bytes = new Uint8Array(8);
  if (isBrowser() && window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(bytes);
  }
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Persist a file so a reload can restore it. Best-effort; never throws. */
export async function cacheLocalFile(id: string, file: File): Promise<void> {
  const db = await openDb();
  if (!db) return;
  try {
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      tx.objectStore(STORE_NAME).put(file, id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
  } finally {
    db.close();
  }
}

/**
 * Cheap existence check — the Saved Loops shelf lists a local entry only if
 * its file is still cached, without pulling the blob into memory.
 */
export async function hasCachedFile(id: string): Promise<boolean> {
  const db = await openDb();
  if (!db) return false;
  try {
    return await new Promise<boolean>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).getKey(id);
      request.onsuccess = () => resolve(request.result != null);
      request.onerror = () => resolve(false);
    });
  } finally {
    db.close();
  }
}

/** Load a previously cached file by id, or null. */
export async function loadCachedFile(id: string): Promise<File | null> {
  const db = await openDb();
  if (!db) return null;
  try {
    return await new Promise<File | null>((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const request = tx.objectStore(STORE_NAME).get(id);
      request.onsuccess = () => {
        const value = request.result;
        resolve(value instanceof File ? value : null);
      };
      request.onerror = () => resolve(null);
    });
  } finally {
    db.close();
  }
}

interface LocalSourceStore {
  current: LocalSource | null;
  /** Register a freshly-picked file, returning its opaque id. Caches it too. */
  setFile: (file: File) => string;
  /** Restore an in-memory source (e.g. from an IndexedDB reload). */
  restore: (source: LocalSource) => void;
  clear: () => void;
}

export const useLocalSourceStore = create<LocalSourceStore>((set) => ({
  current: null,
  setFile: (file) => {
    const id = makeId();
    const source: LocalSource = { id, file, name: file.name };
    set({ current: source });
    void cacheLocalFile(id, file);
    return id;
  },
  restore: (source) => set({ current: source }),
  clear: () => set({ current: null }),
}));

/** Media-file acceptance shared by the picker and validation. */
export const ACCEPTED_MEDIA =
  "video/*,audio/*,.mp4,.webm,.mov,.m4v,.ogg,.mp3,.wav,.m4a,.aac,.flac";

export function isMediaFile(file: File): boolean {
  return (
    file.type.startsWith("video/") ||
    file.type.startsWith("audio/") ||
    /\.(mp4|webm|mov|m4v|ogg|ogv|mp3|wav|m4a|aac|flac)$/i.test(file.name)
  );
}
