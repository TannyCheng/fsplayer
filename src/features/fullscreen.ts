import { EVENT } from "@/constant";
import { Player } from "@/player";
import { Disposable } from "@/types";
import { addDisposableListener } from "@/utils";
import { isFunction } from "@/utils/is";
import { addDisposable, dispose } from "@/utils/store";

const prefixList = ["webkit", "moz", "ms"];

export class Fullscreen implements Disposable {
  private target!: HTMLElement;

  private readonly prefix = this.getPrefix;

  constructor(private player: Player) {
    addDisposableListener(
      this,
      document,
      `${this.prefix}fullscreenchange` as any,
      () => {
        let evt = "";
        if (this.isActive) {
          this.player.el.setAttribute("data-screen", "full");
          evt = EVENT.ENTER_FULLSCREEN;
        } else {
          this.player.el.setAttribute("data-screen", "normal");
          evt = EVENT.EXIT_FULLSCREEN;
        }
        this.player.emit(evt);
        this.player.emit(EVENT.UPDATE_SIZE);
      }
    );

    addDisposable(
      this,
      player.on(EVENT.UPDATE_OPTIONS, () => {
        this.disableDoubleClick();
      })
    );

    this.setTarget();

    if (this.isActive) this.player.el.setAttribute("data-screen", "full");

    if (!this.player.opts.isTouch) {
      this.enableDoubleClick();
    }
  }

  private getPrefix(): string {
    if (isFunction(document.exitFullscreen)) return "";
    let prefix = "";
    prefixList.forEach((p) => {
      if (
        isFunction((document as any)[`${p}ExitFullscreen`]) ||
        isFunction((document as any)[`${p}CancelFullscreen`])
      ) {
        prefix = p;
      }
    });
    return prefix;
  }

  get requestFullscreen(): Element["requestFullscreen"] {
    return (
      HTMLElement.prototype.requestFullscreen ||
      (HTMLElement.prototype as any).webkitRequestFullscreen ||
      (HTMLElement.prototype as any).mozRequestFullscreen ||
      (HTMLElement.prototype as any).msRequestFullscreen
    );
  }

  get exitFullscreen(): Document["exitFullscreen"] {
    return (
      Document.prototype.exitFullscreen ||
      (Document.prototype as any).webkitExitFullscreen ||
      (Document.prototype as any).cancelFullScreen ||
      (Document.prototype as any).mozCancelFullScreen ||
      (Document.prototype as any).msExitFullscreen
    );
  }

  get fullscreenElement(): Document["fullscreenElement"] {
    return (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement
    );
  }

  get isActive(): boolean {
    return this.target === this.fullscreenElement;
  }

  setTarget(dom?: HTMLElement, video?: HTMLVideoElement) {
    this.target = dom ?? this.player.el;
    if (this.isActive) this.enter();
  }

  enableDoubleClick() {
    this.player.video.addEventListener("dblclick", this.toggle);
  }

  disableDoubleClick() {
    this.player.video.removeEventListener("dblclick", this.toggle);
  }

  toggle = (e: Event) => {
    e.stopPropagation();
    if (this.isActive) {
      this.exit();
      this.player.emit(EVENT.EXIT_FULLSCREEN);
    } else {
      this.enter();
      this.player.emit(EVENT.ENTER_FULLSCREEN);
    }
  };

  enter() {
    this.requestFullscreen.call(this.target, {
      navigationUI: "hide",
    });
    this.player.emit(EVENT.UPDATE_SIZE);
  }

  exit(): boolean {
    if (!this.isActive) return false;
    this.exitFullscreen.call(document);
    this.player.emit(EVENT.UPDATE_SIZE);
    return true;
  }

  dispose() {
    if (!this.player) return;
    this.player.off(EVENT.ENTER_FULLSCREEN);
    this.player.off(EVENT.EXIT_FULLSCREEN);
    this.disableDoubleClick();
    this.player = null!;
    dispose(this);
  }
}
