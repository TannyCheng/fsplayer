import { Component } from "@/common/Component";
import { ControlItem } from "..";
import { Player } from "@/player";
import { I18n, LIVE } from "@/features/i18n";
import { $, addClass, formatTime, useNameSpace } from "@/utils";
import { addDisposable } from "@/utils/store";
import { EVENT } from "@/constant";

const { b, e, m } = useNameSpace("time");

class Time extends Component implements ControlItem {
  readonly id = "time";

  private currentEl!: HTMLElement;

  private durationEl!: HTMLElement;

  init(player: Player) {
    if (player.opts.live) {
      addClass(this.el, m("live"));
      this.el.textContent = I18n.t(LIVE);
    } else {
      addClass(this.el, ["fs-player-control-item", `${b()}`]);
      this.currentEl = this.el.appendChild($("span"));
      this.el.appendChild($(`span.${e("seperator")}`));
      this.durationEl = this.el.appendChild($("span"));

      this.current = player.currentTime;
      this.duration = player.duration;

      addDisposable(
        this,
        player.on(EVENT.TIME_UPDATE, () => {
          this.current = player.currentTime;
        })
      );
      addDisposable(
        this,
        player.on(EVENT.DURATION_CHANGE, () => {
          this.duration = player.duration;
        })
      );
    }
  }

  private set current(v: number) {
    this.currentEl.textContent = formatTime(v);
  }

  private set duration(v: number) {
    this.durationEl.textContent = formatTime(v);
  }
}

export const timeControlItem = () => new Time();
