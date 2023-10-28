import { DOMAttrs, Disposable } from "@/types";
import { $, removeNode } from "../utils";
import { dispose } from "../utils/store";
import { isString } from "../utils/is";

export class Component implements Disposable {
  el: HTMLElement;

  constructor(
    container?: HTMLElement,
    desc?: HTMLElement | string,
    attrs?: DOMAttrs,
    children?: string | Array<Node>
  ) {
    if (!isString(desc)) {
      this.el = desc;
    } else {
      this.el = $(desc, attrs, children);
    }
    if (container) container.appendChild(this.el);
  }

  applyStyle(style: Partial<CSSStyleDeclaration>) {
    Object.assign(this.el.style, style);
  }

  dispose() {
    removeNode(this.el);
    dispose(this);
  }
}
