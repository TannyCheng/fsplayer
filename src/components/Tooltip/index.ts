import { $, addClass, hide, removeClass, show, useNameSpace } from "@/utils";
import { Component } from "@/common/Component";

const { b } = useNameSpace("tooltip");

export class Tooltip extends Component {
  private content: HTMLElement;

  constructor(container: HTMLElement, html?: string) {
    super(container, `.${b()}`);
    this.content = this.el.appendChild($(`.${b("content")}`));
    if (html) this.html = html;
  }

  get html(): string {
    return this.content.innerHTML;
  }

  set html(html: string) {
    this.content.innerHTML = html;
  }

  resetPos(): void {
    removeClass(this.el, `${b("left")}`);
    removeClass(this.el, `${b("right")}`);
    removeClass(this.el, `${b("bottom")}`);
  }

  setBottom() {
    addClass(this.el, `${b("bottom")}`);
  }

  setLeft() {
    addClass(this.el, `${b("left")}`);
  }

  setRight() {
    addClass(this.el, `${b("right")}`);
  }

  hide() {
    hide(this.el);
  }

  show() {
    show(this.el);
  }
}
