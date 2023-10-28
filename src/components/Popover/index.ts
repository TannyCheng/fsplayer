import {
  $,
  addClass,
  addDisposableListener,
  getEventPath,
  removeClass,
  useNameSpace,
} from "@/utils";
import { Component } from "@/common/Component";

const { b, bm, is } = useNameSpace("popover");

export class Popover extends Component {
  readonly panelEl: HTMLElement;
  readonly maskEl: HTMLElement;

  constructor(
    container: HTMLElement,
    private readonly onHide?: (e: MouseEvent) => void,
    style?: Partial<CSSStyleDeclaration>,
    left?: boolean
  ) {
    super(container, `${b()}`);
    this.maskEl = this.el.appendChild($(`${b("mask")}`));
    this.panelEl = this.el.appendChild($(`${b("panel")}`));

    if (style) this.applyStyle(style);

    if (left) addClass(this.panelEl, `${bm("panel", "left")}`);

    addDisposableListener(this, this.maskEl, "click", (e: MouseEvent) => {
      e.stopPropagation();
      if (getEventPath(e).includes(this.panelEl)) return;
      this.hide(e);
    });
  }

  applyStyle(style: Partial<CSSStyleDeclaration>): void {
    Object.assign(this.panelEl.style, style);
  }

  setBottom() {
    addClass(this.panelEl, `${bm("panel", "bottom")}`);
  }

  show() {
    addClass(this.el, `${is("popover-show")}`);
  }

  hide(e?: MouseEvent) {
    removeClass(this.el, `${is("popover-show")}`);
    if (this.onHide) this.onHide(e!);
  }
}
