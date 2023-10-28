import { DomListener } from "@/common/Listeners";
import { addDisposable } from "./store";

export * from "./dom";
export * from "./useNamespace";
export * from "./is";
export * from "./patch";

export function clamp(n: number, lower = 0, upper = 1): number {
  return Math.max(Math.min(n, upper), lower);
}

export function repeatStr(str: string, n: number): string {
  const res = [];
  for (let i = 0; i < n; i++) {
    res.push(str);
  }
  return res.join("");
}

export function addDisposableListener<
  K extends keyof GlobalEventHandlersEventMap
>(
  key: any,
  node: EventTarget,
  type: K,
  listener: (event: GlobalEventHandlersEventMap[K]) => void,
  useCapture?: boolean
): DomListener;

export function addDisposableListener(
  key: any,
  el: EventTarget,
  type: string,
  listener: EventListener,
  options?: boolean | AddEventListenerOptions
): DomListener {
  const domListener = new DomListener(el, type, listener, options);
  if (key) addDisposable(key, domListener);
  return domListener;
}

export function formatTime(time: number) {
  const h = Math.floor(time / 3600);
  time = time % 3600;
  const min = Math.floor(time / 60);
  time = time % 60;
  const sec = Math.round(time);
  let minstr = min >= 10 ? `${min}` : `0${min}`;
  let secstr = sec >= 10 ? `${sec}` : `0${sec}`;
  return h > 0 ? `${h}:${minstr}:${secstr}` : `${minstr}:${secstr}`;
}

export function getExtension(url: string): string | void {
  let index = url.lastIndexOf(".");
  if (index !== -1) {
    return url.slice(index + 1);
  }
}

export function throttle(fn: Function, ctx?: unknown): any {
  let pending = false;
  let first = true;
  let args: typeof arguments | null = null;
  return function () {
    args = arguments;
    if (first) {
      first = false;
      return fn.apply(ctx, args);
    }

    if (pending) return;
    pending = true;
    requestAnimationFrame(() => {
      fn.apply(ctx, args);
      pending = false;
    });
  };
}

export const internalUtils = { formatTime };
