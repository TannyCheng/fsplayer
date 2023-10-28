import { $, addDisposableListener, clamp, useNameSpace } from "@/utils";
import { Component } from "@/common/Component";
import { Drag } from "@/utils/drag";
import { Rect } from "@/utils/rect";
import { addDisposable } from "@/utils/store";

export interface SliderOptions {
  value?: number;
  stops?: { value: number; html?: string }[];
  change?: (value: number) => void;
  step?: boolean;
}

const { b, e, be } = useNameSpace("slider");

export class Slider extends Component {
  private readonly trackEl: HTMLElement;

  private readonly dotEl: HTMLElement;

  private readonly step: boolean | undefined;

  readonly rect: Rect;

  constructor(container: HTMLElement, private opts: SliderOptions) {
    super(container, `${b()}`);

    this.rect = new Rect(this.el);

    this.trackEl = this.el
      .appendChild($(`${b("track")}`))
      .appendChild($(`${be("track", "inner")}`));
    if (opts.stops) {
      let stop;
      opts.stops.forEach((s) => {
        stop = $(
          `${e("stop")}`,
          undefined,
          s.html ? `<span>${s.html}</span>` : ""
        );
        stop.style.left = `${s.value * 100}%`;
        this.el.appendChild(stop);
      });
    }

    this.dotEl = this.el.appendChild($(`${b("dot")}`));

    addDisposable(
      this,
      new Drag(
        this.el,
        (e: PointerEvent) => {
          this.rect.update();
          this.onDrag(e);
        },
        this.onDrag
      )
    );
    addDisposableListener(this, this.el, "touchstart", (e: Event) =>
      e.preventDefault()
    );

    this.step = opts.stops && opts.step;

    this.update(opts.value ?? 0, undefined, false);
  }

  update(value: number, x?: number, trigger = true) {
    if (this.step) {
      let closed = Infinity;
      let c,
        v = 0;
      this.opts.stops!.forEach((s) => {
        c = Math.abs(value - s.value);
        if (c < closed) {
          closed = c;
          v = s.value;
        }
      });
      value = v;
      x = null!;
    }

    const w = this.rect.isHeightGtWidth ? this.rect.height : this.rect.width;
    x = x !== null ? x : value * w;
    this.trackEl.style.transform = `scaleX(${clamp(value)})`;
    this.dotEl.style.transform = `translateX(${clamp(x!, 0, w)}px)`;

    if (trigger && this.opts.change) this.opts.change(value);
  }

  private onDrag = (e: PointerEvent) => {
    const isHeightGtWidth = this.rect.isHeightGtWidth;
    const x = isHeightGtWidth
      ? e.clientY - this.rect.y
      : e.clientX - this.rect.x;
    this.update(x / (isHeightGtWidth ? this.rect.height : this.rect.width), x);
  };
}
