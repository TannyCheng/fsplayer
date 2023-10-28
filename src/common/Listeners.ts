import { isBoolean } from "@/utils/is";
import { Env } from "../utils/env";
import { Disposable } from "@/types";

let thridOptsSupported = false;

if (Env.env === "PC") {
  try {
    const options = Object.defineProperty({}, "once", {
      get() {
        thridOptsSupported = true;
      },
    });
    window.addEventListener("test", null as any, options);
  } catch (e) {}
}

export function isListenerObjOptsSupported(): boolean {
  return thridOptsSupported;
}

export class DomListener implements Disposable {
  constructor(
    private node: EventTarget,
    private type: string,
    private handler: (e: any) => void,
    private options?: boolean | AddEventListenerOptions
  ) {
    this.options = isBoolean(options)
      ? options
      : options
      ? thridOptsSupported && options
      : false;
    node.addEventListener(type, handler, this.options);
  }

  dispose() {
    if (!this.handler) return;
    this.node.removeEventListener(this.type, this.handler, this.options);
    this.node = null!;
    this.handler = null!;
    this.options = null!;
  }
}
