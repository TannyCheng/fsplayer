import { Disposable } from "@/types";

const disposableMap: Map<any, Array<Disposable>> = new Map();

export function getDisposableMap(): Map<any, Array<Disposable>> {
  return disposableMap;
}

export function addDisposable<T extends Disposable>(
  key: any,
  disposable: T
): T {
  if (!disposableMap.has(key)) disposableMap.set(key, []);
  disposableMap.get(key)?.push(disposable);
  return disposable;
}

export function dispose(key: any) {
  if (disposableMap.has(key)) {
    disposableMap.get(key)?.forEach((item) => item.dispose());
    disposableMap.delete(key);
  }
}
