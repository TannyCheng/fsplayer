import { Component } from "@/common/Component";
import { ControlItem } from "..";
import { Tooltip } from "@/components/Tooltip";
import { Player } from "@/player";
import { addClass, addDisposableListener, useNameSpace } from "@/utils";
import { EXIT_PIP, I18n, PIP } from "@/features/i18n";
import { addDisposable } from "@/utils/store";
import { EVENT } from "@/constant";
import { Icon } from "@/features/icons";

const { b } = useNameSpace("pip");
const controlItemClass = "fs-player-control-item";

class PictureInPicture extends Component implements ControlItem {
  readonly id = "pip";

  private player!: Player;

  tooltip!: Tooltip;

  init(player: Player, position: number, tooltip: Tooltip) {
    addClass(this.el, [controlItemClass, `${b()}`]);
    this.player = player;
    this.tooltip = tooltip;
    this.tooltip.html = I18n.t(PIP);
    this.el.appendChild(Icon.pip());
    addDisposable(this, player.on(EVENT.ENTER_PIP, this.enter));
    addDisposable(this, player.on(EVENT.EXIT_PIP, this.exit));
    addDisposableListener(this, this.el, "click", player.pip.toggle);
    addDisposableListener(this, this.el, "pointerenter", () =>
      this.tooltip.show()
    );
    addDisposableListener(this, this.el, "pointerleave", () =>
      this.tooltip.hide()
    );
  }

  private enter = () => {
    this.tooltip.html = I18n.t(EXIT_PIP);
  };

  private exit = () => {
    this.tooltip.html = I18n.t(PIP);
  };
}

export const pipControlItem = () => new PictureInPicture();
