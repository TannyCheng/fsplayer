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
import { addDisposable } from "@/utils/store";
import { I18n, PAUSE, PLAY } from "@/features/i18n";
import { EVENT } from "@/constant";
import { ControlItem } from "..";
import { Component } from "@/common/Component";

const { b } = useNameSpace("play");
const controlItemClass = "fs-player-control-item";

class PlayButton extends Component implements ControlItem {
  readonly id = "play";

  private playIcon!: HTMLElement;

  private pauseIcon!: HTMLElement;

  tooltip!: Tooltip;

  init(player: Player, _: any, tooltip: Tooltip) {
    addClass(this.el, [controlItemClass, `${b()}`]);
    this.tooltip = tooltip;
    this.playIcon = this.el.appendChild(Icon.play());
    this.pauseIcon = this.el.appendChild(Icon.pause());
    if (player.paused) {
      this.onPause();
    } else {
      this.onPlay();
    }

    addDisposable(this, player.on(EVENT.PLAY, this.onPlay));
    addDisposable(this, player.on(EVENT.PAUSE, this.onPause));
    addDisposableListener(this, this.el, "click", player.toggle);
    addDisposableListener(this, this.el, "pointerenter", () =>
      this.tooltip.show()
    );
    addDisposableListener(this, this.el, "pointerleave", () =>
      this.tooltip.hide()
    );
  }

  private onPlay = () => {
    hide(this.playIcon);
    show(this.pauseIcon);
    this.tooltip.html = I18n.t(PAUSE);
  };

  private onPause = () => {
    hide(this.pauseIcon);
    show(this.playIcon);
    this.tooltip.html = I18n.t(PLAY);
  };
}

export const playControlItem = () => new PlayButton();
