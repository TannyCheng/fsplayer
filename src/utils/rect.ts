import { EVENT } from "@/constant";
import { Player } from "@/player";
import { Disposable } from "@/types";

export class Rect implements Disposable {
  private rect: DOMRect;

  constructor(private el: HTMLElement, private player?: Player) {
    this.rect = {} as DOMRect;
    if (player) {
      player.on(EVENT.UPDATE_SIZE, this.update);
    }
  }

  get changed() {
    const newRect = this.el.getBoundingClientRect();
    const ret =
      newRect.y !== this.rect.y ||
      newRect.x !== this.rect.x ||
      newRect.width !== this.rect.width ||
      newRect.height !== this.rect.height;
    if (ret) this.rect = newRect;
    return ret;
  }

  get isHeightGtWidth() {
    return this.width < this.height;
  }

  get width(): number {
    this.tryUpdate(this.rect.width);
    return this.rect.width;
  }

  get height(): number {
    this.tryUpdate(this.rect.height);
    return this.rect.height;
  }

  get x(): number {
    this.tryUpdate(this.rect.x);
    return this.rect.x;
  }

  get y(): number {
    this.tryUpdate(this.rect.y);
    return this.rect.y;
  }

  private tryUpdate(v: number) {
    if (!v) this.update();
  }

  update = () => {
    this.rect = this.el.getBoundingClientRect();
  };

  dispose() {
    if (this.player) this.player.off(EVENT.UPDATE_SIZE, this.update);
    this.el = null;
    this.rect = null;
  }
}
