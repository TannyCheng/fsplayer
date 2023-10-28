import { EVENT } from "@/constant";
import { Player } from "@/player";
import {
  addClass,
  addDisposableListener,
  hide,
  show,
  useNameSpace,
} from "@/utils";
import { Component } from "@/common/Component";
import { addDisposable } from "@/utils/store";
import { Icon } from "@/features";

const { b } = useNameSpace("poster");

export class Poster extends Component {
  private playEl: HTMLElement;

  private poster: string;

  private tryToPlayed = false;

  constructor(container: HTMLElement, private player: Player) {
    super(container, `.${b()}`);
    this.poster = player.opts.poster;
    this.playEl = player.opts.posterPlayEl || Icon.bigPlay();
    addClass(this.playEl, `${b("play")}`);
    this.el.appendChild(this.playEl);
    this.hide();

    if (!player.opts.posterEnable) return;

    this.show();

    if (this.poster)
      this.applyStyle({ backgroundImage: `url(${this.poster})` });

    addDisposableListener(this, this.el, "click", (e: MouseEvent) => {
      e.stopPropagation();
      if (this.tryToPlayed) {
        show(this.playEl);
        player.pause();
        this.tryToPlayed = false;
        return;
      }
      this.tryToPlayed = true;
      if (player.loaded) {
        this.hide();
      } else {
        hide(this.playEl);
        player.loading.show();
      }
      player.play();
    });

    addDisposable(this, player.on(EVENT.CAN_PLAY, this.tryHide));
    addDisposable(this, player.on(EVENT.LOADED_METADATA, this.tryHide));
    addDisposable(
      this,
      player.on(EVENT.UPDATE_OPTIONS, () => {
        if (
          player.opts.poster &&
          player.opts.poster !== this.poster &&
          !player.playing
        ) {
          this.poster = player.opts.poster;
          this.applyStyle({ backgroundImage: `url(${this.poster})` });
          this.tryToPlayed = false;
          this.addTimeUpdateHandler();
          this.show();
        }
      })
    );

    this.addTimeUpdateHandler();
  }

  get isActive(): boolean {
    return this.el.style.display !== "none";
  }

  private addTimeUpdateHandler() {
    this.player.off(EVENT.TIME_UPDATE, this.onTimeUpdate);
    this.player.on(EVENT.TIME_UPDATE, this.onTimeUpdate);
  }

  private onTimeUpdate = () => {
    if (this.player.playing) {
      this.tryToPlayed = true;
      this.hide();
      this.player.off(EVENT.TIME_UPDATE, this.onTimeUpdate);
    }
  };

  private tryHide = () => {
    if (!this.tryToPlayed) return;
    this.hide();
  };

  show() {
    show(this.el);
    show(this.playEl);
  }

  hide() {
    hide(this.el);
  }
}
