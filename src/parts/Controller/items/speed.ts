import { Component } from "@/common/Component";
import { ControlItem } from "..";
import { Player } from "@/player";
import {
  $,
  addClass,
  addDisposableListener,
  hide,
  removeClass,
  show,
  useNameSpace,
} from "@/utils";
import { I18n, SPEED } from "@/features/i18n";

const { b, bm } = useNameSpace("speed");
const controlItemClass = "fs-player-control-item";

class Speed extends Component implements ControlItem {
  readonly id = "speed";

  private current!: HTMLElement;

  private menu!: HTMLElement;

  private selected!: HTMLElement;

  private timer!: NodeJS.Timeout;

  private player!: Player;

  init(player: Player) {
    this.player = player;
    addClass(this.el, [controlItemClass, `${b()}`]);
    this.current = this.el.appendChild($(`.${b("current")}`));
    this.menu = this.el.appendChild($(`.${b("menu")}`));
    this.current.innerText = I18n.t(SPEED);
    const speedList = ["2.0x", "1.5x", "1.25x", "1.0x", "0.75x", "0.5x"];
    speedList.forEach((speed) => {
      const item = this.menu.appendChild($(`.${b("menu-item")}`));
      item.innerText = speed;
      if (speed === "1.0x") {
        this.selected = item;
        addClass(item, `${bm("menu-item", "selected")}`);
      }
      addDisposableListener(this, item, "click", this.clickItem);
    });

    addDisposableListener(this, this.el, "pointerenter", this.showMenu);
    addDisposableListener(this, this.el, "pointerleave", this.hideMenu);
    addDisposableListener(this, this.menu, "pointerenter", this.showMenu);
    addDisposableListener(this, this.menu, "pointerleave", this.hideMenu);
  }

  private clickItem = (e: MouseEvent) => {
    removeClass(this.selected, `${bm("menu-item", "selected")}`);
    const item = e.target as HTMLElement;
    this.selected = item;
    addClass(this.selected, `${bm("menu-item", "selected")}`);
    e.stopPropagation();
    const speed = parseFloat(item.innerText);
    this.player.playbackrate = speed;
    this.current.innerText =
      item.innerText === "1.0x" ? I18n.t(SPEED) : item.innerText;
  };

  private showMenu = () => {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null!;
    }
    show(this.menu);
  };

  private hideMenu = () => {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      hide(this.menu);
    }, 300);
  };
}

export const speedControlItem = () => new Speed();
