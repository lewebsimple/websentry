import { KVAdapter } from "../../core/runtime/KvAdapter";

type Entry = {
  value: unknown;
  expiresAt?: number;
};

export class InMemoryKVAdapter implements KVAdapter {
  private store = new Map<string, Entry>();

  async get<T = unknown>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.value as T;
  }

  async set<T = unknown>(key: string, value: T, ttlMs?: number): Promise<void> {
    const entry: Entry = {
      value,
      expiresAt: ttlMs ? Date.now() + ttlMs : undefined,
    };

    this.store.set(key, entry);
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }
}
