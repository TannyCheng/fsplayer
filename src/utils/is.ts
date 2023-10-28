const toString = Object.prototype.toString;

export function isString(o: unknown): o is string {
  return toString.call(o) === `[object String]`;
}

export function isFunction(o: unknown): o is Function {
  return typeof o === "function";
}

export function isBoolean(o: unknown): o is boolean {
  return toString.call(o) === `[object Boolean]`;
}

export function isNumber(o: unknown): o is number {
  return toString.call(o) === "[object Number]";
}

export function isTouch(): boolean {
  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}
