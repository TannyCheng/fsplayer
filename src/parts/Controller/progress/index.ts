import { Component } from "@/common/Component";
import { ControlItem } from "..";
import { Player } from "@/player";
import { Tooltip } from "@/components/Tooltip";
import {
  $,
  addClass,
  addDisposableListener,
  clamp,
  useNameSpace,
} from "@/utils";
import { Rect } from "@/utils/rect";
import { addDisposable } from "@/utils/store";
import { Drag } from "@/utils/drag";
import { EVENT } from "@/constant";

const { b, be } = useNameSpace("progress");

export class Progress extends Component implements ControlItem {
  readonly id = "progress";

  private bar!: HTMLElement;

  private inner!: HTMLElement;

  private thumb!: HTMLElement;

  private buffer!: HTMLElement;

  private player!: Player;

  private rect!: Rect;

  tooltip?: Tooltip;

  init(player: Player) {
    this.player = player;

    addClass(this.el, [`${b()}`]);

    this.bar = this.el.appendChild($(`.${b("bar")}`));
    this.inner = this.bar.appendChild($(`.${be("bar", "inner")}`));
    this.buffer = this.bar.appendChild($(`.${be("bar", "buffer")}`));
    this.thumb = this.bar.appendChild($(`.${be("bar", "thumb")}`));

    this.rect = new Rect(this.bar, player);

    addDisposable(
      this,
      new Drag(this.el, this.onDragStart, this.onDragging, this.onDragEnd)
    );
    addDisposable(this, player.on(EVENT.TIME_UPDATE, this.updateInner));
    addDisposable(this, player.on(EVENT.PROGRESS, this.updateBuffer));
    addDisposable(
      this,
      player.on(EVENT.UPDATE_SIZE, () => {
        this.resetInner();
      })
    );
    addDisposable(
      this,
      player.on(EVENT.UPDATE_OPTIONS, () => {
        if (!player.playing) this.resetInner();
      })
    );
    addDisposable(
      this,
      player.on(EVENT.CONTROL_ITEM_UPDATE, () => {
        this.rect.update();
        this.resetInner();
      })
    );
    addDisposableListener(this, this.el, "click", (e: MouseEvent) => {
      e.stopPropagation();
      this.updateInner();
    });

    if (player.opts.isTouch) {
      addDisposableListener(this, this.el, "touchstart", (e: TouchEvent) =>
        e.preventDefault()
      );
    }
  }

  private resetInner() {
    this.setInnerLength(this.player.currentTime / this.player.duration);
  }

  private setInnerLength(percentage: number) {
    this.inner.style.transform = `scaleX(${clamp(percentage)})`;
    const w = this.rect.isHeightGtWidth ? this.rect.height : this.rect.width;

    this.thumb.style.left = `${clamp(w * percentage, 0, w)}px`;
  }

  private setBufferLength(percentage: number) {
    this.buffer.style.transform = `scaleX(${clamp(percentage)})`;
  }

  private onDragStart = (e: PointerEvent) => {
    this.rect.update();
    this.onDragging(e);
  };

  private onDragging = (e: PointerEvent) => {
    const isHeightGtWidth = this.rect.isHeightGtWidth;
    const x = isHeightGtWidth
      ? e.clientY - this.rect.y
      : e.clientX - this.rect.x;
    this.setInnerLength(
      x / (isHeightGtWidth ? this.rect.height : this.rect.width)
    );
  };

  private onDragEnd = (e: PointerEvent) => {
    const isHeightGtWidth = this.rect.isHeightGtWidth;
    this.player.seek(
      this.getCurrentTime(
        isHeightGtWidth ? e.clientY : e.clientX,
        isHeightGtWidth
      )
    );
  };

  private updateBuffer = () => {
    if (!this.player.buffered.length) this.setBufferLength(0);

    const currentTime = this.player.currentTime;
    let percentage = 0;

    this.player.eachBuffer((start, end) => {
      if (start <= currentTime && end >= currentTime) {
        percentage = clamp(end / this.player.duration);
        return true;
      }
    });

    this.setBufferLength(percentage);
  };

  private updateInner = () => {
    this.setInnerLength(this.player.currentTime / this.player.duration);
  };

  private getCurrentTime(x: number, isHeightGtWidth: boolean): number {
    return (
      clamp(
        (x - (isHeightGtWidth ? this.rect.y : this.rect.x)) /
          (isHeightGtWidth ? this.rect.height : this.rect.width)
      ) * this.player.duration
    );
  }
}

export const progressControlItem = () => new Progress();
