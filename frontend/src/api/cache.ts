interface CacheEntry {
  data: unknown;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

export const cachedGet = async <T>(
  url: string,
  ttlMs: number,
  fetchFn: () => Promise<T>
): Promise<T> => {
  const entry = cache.get(url);

  if (entry && entry.expiresAt > Date.now()) {
    return entry.data as T;
  }

  const data = await fetchFn();

  cache.set(url, { data, expiresAt: Date.now() + ttlMs });

  return data;
};

export const invalidateCache = (prefixes: string[]) => {
  for (const key of Array.from(cache.keys())) {
    if (prefixes.some((prefix) => key.startsWith(prefix))) {
      cache.delete(key);
    }
  }
};