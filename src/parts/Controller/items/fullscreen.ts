import { Component } from "@/common/Component";
import { ControlItem } from "..";
import { Tooltip } from "@/components/Tooltip";
import { Player } from "@/player";
import {
  addClass,
  addDisposableListener,
  hide,
  show,
  useNameSpace,
} from "@/utils";
import { Icon } from "@/features/icons";
import { EXIT_FULL_SCREEN, FULL_SCREEN, I18n } from "@/features/i18n";
import { addDisposable } from "@/utils/store";
import { EVENT } from "@/constant";

const { b } = useNameSpace("fullscreen");
const controlItemClass = "fs-player-control-item";

class FullScreen extends Component implements ControlItem {
  readonly id = "fullscreen";
  private enterIcon!: HTMLElement;
  private exitIcon!: HTMLElement;
  private player!: Player;
  tooltip!: Tooltip;

  init(player: Player, position: number, tooltip: Tooltip) {
    addClass(this.el, [controlItemClass, `${b()}`]);
    this.tooltip = tooltip;
    this.tooltip.html = I18n.t(FULL_SCREEN);
    this.player = player;
    this.enterIcon = this.el.appendChild(Icon.enterFullscreen());
    this.exitIcon = this.el.appendChild(Icon.exitFullscreen());

    addDisposable(this, player.on(EVENT.ENTER_FULLSCREEN, this.enter));
    addDisposable(this, player.on(EVENT.EXIT_FULLSCREEN, this.exit));
    addDisposableListener(this, this.el, "click", player.fullscreen.toggle);
    addDisposableListener(this, this.el, "mouseenter", () =>
      this.tooltip.show()
    );
    addDisposableListener(this, this.el, "mouseleave", () =>
      this.tooltip.hide()
    );
  }

  private enter = () => {
    show(this.exitIcon);
    hide(this.enterIcon);
    this.player.el.setAttribute("data-screen", "full");
    this.tooltip.html = I18n.t(EXIT_FULL_SCREEN);
  };

  private exit = () => {
    show(this.enterIcon);
    hide(this.exitIcon);
    this.player.el.setAttribute("data-screen", "normal");
    this.tooltip.html = I18n.t(FULL_SCREEN);
  };
}

export const fullscreenControlItem = () => new FullScreen();
