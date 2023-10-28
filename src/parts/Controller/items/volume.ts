import { Player } from "@/player";
import { ControlItem } from "..";
import { Tooltip } from "@/components/Tooltip";
import { Rect } from "@/utils/rect";
import {
  $,
  addClass,
  addDisposableListener,
  clamp,
  getEventPath,
  hide,
  show,
  useNameSpace,
} from "@/utils";
import { I18n, MUTE, UNMUTE } from "@/features/i18n";
import { isString } from "@/utils/is";
import { addDisposable } from "@/utils/store";
import { EVENT } from "@/constant";
import { Drag } from "@/utils/drag";
import { Component } from "@/common/Component";
import { Icon } from "@/features/icons";

const { b, m, be } = useNameSpace("volume");
const controlItemClass = "fs-player-control-item";

export class Volume extends Component implements ControlItem {
  readonly id = "volume";

  private player!: Player;

  private box!: HTMLElement;

  private number!: HTMLElement;

  private inner!: HTMLElement;

  private thumb!: HTMLElement;

  private bar!: HTMLElement;

  private volumeIcon!: HTMLElement;

  private muteIcon!: HTMLElement;

  private rect!: Rect;

  private isVertical!: boolean;

  private timer!: NodeJS.Timeout;

  tooltip!: Tooltip;

  init(player: Player, _: any, tooltip: Tooltip) {
    this.player = player;
    this.tooltip = tooltip;
    this.isVertical = player.opts.volumeVertical;

    addClass(this.el, [
      controlItemClass,
      `${this.isVertical ? m("vertical") : m("horizon")}`,
    ]);

    this.volumeIcon = this.el.appendChild(Icon.volume());
    this.muteIcon = this.el.appendChild(Icon.muted());

    const len = player.opts.volumeBarLength;

    this.box = $(`.${b("box")}`);
    this.bar = $(`.${b("bar")}`);
    this.inner = $(`.${be("bar", "inner")}`);
    this.thumb = $(`.${be("bar", "thumb")}`);
    this.bar.append(this.inner, this.thumb);

    if (this.isVertical) {
      tooltip.hide();
      this.number = $(`.${b("number")}`);
      this.box.append(this.number, this.bar);
    } else {
      this.box.append(this.bar);
    }

    // this.box.style[this.isVertical ? "height" : "width"] = isString(len)
    //   ? len
    //   : `${len}px`;

    this.el.appendChild(this.box);
    this.rect = new Rect(this.bar, player);

    addDisposable(this, player.on(EVENT.VOLUME_CHANGE, this.onVolumeChange));
    addDisposable(this, new Drag(this.box, this.onDragStart, this.onDragging));
    addDisposableListener(this, this.el, "click", (e: MouseEvent) => {
      e.stopPropagation();
      if (getEventPath(e).includes(this.bar)) return;
      player.toggleVolume();
    });
    addDisposableListener(this, this.el, "pointerenter", this.showVolumeBox);
    addDisposableListener(this, this.el, "pointerleave", this.hideVolumeBox);
    addDisposableListener(this, this.box, "click", (e: MouseEvent) =>
      e.stopPropagation()
    );
    addDisposableListener(this, this.box, "pointerenter", this.showVolumeBox);
    addDisposableListener(this, this.box, "pointerleave", this.hideVolumeBox);

    if (player.opts.isTouch) {
      addDisposableListener(this, this.bar, "touchstart", (e) =>
        e.preventDefault()
      );
    }

    this.onVolumeChange();
  }

  private onDragStart = (e: PointerEvent) => {
    this.onDragging(e);
  };

  private onDragging = (e: PointerEvent) => {
    this.rect.update();
    this.player.volume = clamp(
      (this.isVertical
        ? this.rect.height - e.clientY + this.rect.y
        : e.clientX - this.rect.x) /
        (this.isVertical ? this.rect.height : this.rect.width)
    );
  };

  private onVolumeChange = () => {
    if (this.player.muted) {
      this.mute();
    } else {
      this.unmute();
    }

    if (this.isVertical) {
      this.number.innerText = `${Math.round(this.player.volume * 100)}`;
      this.inner.style.transform = `scaleY(${this.player.volume})`;
      this.thumb.style.bottom = `${this.player.volume * this.rect.height}px`;
    } else {
      const width = this.rect.width
        ? this.rect.width
        : parseInt(this.player.opts.volumeBarLength as string);
      this.inner.style.transform = `scaleX(${this.player.volume})`;
      this.thumb.style.left = `${this.player.volume * width}px`;
    }
  };

  private showVolumeBox = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null!;
    }
    if (this.isVertical) show(this.box);
    else {
      this.thumb.style.opacity = "1";
      this.box.style.width = `${this.player.opts.volumeBarLength}px`;
    }
  };

  private hideVolumeBox = () => {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      if (this.isVertical) hide(this.box);
      else {
        this.box.style.width = "0";
        this.thumb.style.opacity = "0";
      }
    }, 300);
  };

  mute() {
    show(this.muteIcon);
    hide(this.volumeIcon);
    this.tooltip.html = I18n.t(UNMUTE);
  }

  unmute() {
    show(this.volumeIcon);
    hide(this.muteIcon);
    this.tooltip.html = I18n.t(MUTE);
  }
}

export const volumeControlItem = () => new Volume();
