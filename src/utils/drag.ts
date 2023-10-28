import { Disposable } from "@/types";

type Fn = (e: PointerEvent) => any;

export class Drag implements Disposable {
  private el: HTMLElement;

  private start: Fn;

  private move: Fn;

  private end: Fn | undefined;

  private pending = false;

  private lastEvent: PointerEvent;

  constructor(dom: HTMLElement, start: Fn, move: Fn, end?: Fn) {
    this.el = dom;
    this.start = start;
    this.move = move;
    this.end = end;

    this.el.addEventListener("pointerdown", this.downHandler, true);
    this.el.addEventListener("pointerup", this.upHandler, true);
    this.el.addEventListener("pointercancel", this.upHandler, true);
  }

  private downHandler = (e: PointerEvent): void => {
    e.preventDefault();
    this.el.setPointerCapture(e.pointerId);
    this.el.addEventListener("pointermove", this.moveHandler, true);
    this.start(e);
  };

  private moveHandler = (e: PointerEvent): void => {
    e.preventDefault();
    this.lastEvent = e;
    if (this.pending) return;
    this.pending = true;
    requestAnimationFrame(this.animationHandler);
  };

  private animationHandler = () => {
    this.move(this.lastEvent);
    this.pending = false;
  };

  private upHandler = (e: PointerEvent): void => {
    e.preventDefault();
    this.el.releasePointerCapture(e.pointerId);
    this.el.removeEventListener("pointermove", this.moveHandler, true);

    if (this.end) this.end(e);
  };

  dispose() {
    if (!this.el) return;
    this.el.removeEventListener("pointerdown", this.downHandler, true);
    this.el.removeEventListener("pointerup", this.upHandler, true);
    this.el.removeEventListener("pointercancel", this.upHandler, true);
    this.el.removeEventListener("pointermove", this.moveHandler, true);
    this.start = null;
    this.move = null;
    this.end = null;
    this.lastEvent = null;
    this.el = null;
  }
}
