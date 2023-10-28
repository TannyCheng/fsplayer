import { EVENT } from "@/constant";
import { Player } from "@/player";
import { addClass, hide, repeatStr, show, useNameSpace } from "@/utils";
import { Component } from "@/common/Component";
import { addDisposable } from "@/utils/store";

const { b } = useNameSpace("loading");

export class Loading extends Component {
  private timer!: NodeJS.Timeout;

  private startWaitingTime = 0;

  constructor(container: HTMLElement, private player: Player) {
    super(
      container,
      player.opts.loadingEl ?? `.${b()}`,
      undefined,
      player.opts.loadingEl ? undefined : repeatStr(`<i></i>`, 12)
    );

    addDisposable(this, player.on(EVENT.CAN_PLAY, this.hide));
    addDisposable(
      this,
      player.on(EVENT.WAITING, () => {
        if (!this.player.currentTime) return;
        this.tryShow();
      })
    );
    addDisposable(
      this,
      player.on(EVENT.STALLED, () => {
        const curTime = this.player.currentTime;
        if (!curTime) return;

        let show = true;
        this.player.eachBuffer((start, end) => {
          if (start <= curTime && end >= curTime) {
            show = false;
            return true;
          }
        });

        if (show) this.tryShow();
      })
    );
  }

  private _checkCanPlay = () => {
    if (this.startWaitingTime !== this.player.currentTime) {
      this.hide();
      clearTimeout(this.timer);
      this.player.off(EVENT.TIME_UPDATE, this._checkCanPlay);
    }
  };

  private checkCanPlay() {
    this.startWaitingTime = this.player.currentTime;
    this.player.off(EVENT.TIME_UPDATE, this._checkCanPlay);
    this.player.on(EVENT.TIME_UPDATE, this._checkCanPlay);
  }

  private tryShow() {
    this.checkCanPlay();
    clearTimeout(this.timer);
    this.timer = setTimeout(this.show, 100);
  }

  show = (): void => {
    show(this.el);
    this.player.emit(EVENT.SHOW_LOADING);
  };

  hide = () => {
    hide(this.el);
    this.player.emit(EVENT.HIDE_LOADING);
  };
}
