let writeGoodFn = null;
let loadPromise = null;
let loadFailed = false;

export function isWriteGoodLoaded() {
  return writeGoodFn !== null;
}

export function hasWriteGoodFailed() {
  return loadFailed;
}

export async function loadWriteGood() {
  if (writeGoodFn) return writeGoodFn;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    try {
      globalThis.match = undefined;
      const mod = await import('write-good');
      writeGoodFn = mod.default ?? mod;
      return writeGoodFn;
    } catch {
      loadFailed = true;
      throw new Error('load failed');
    }
  })();

  return loadPromise;
}

export function runWriteGood(text, cap = 200) {
  if (!writeGoodFn || !text) return [];
  return writeGoodFn(text).slice(0, cap);
}
