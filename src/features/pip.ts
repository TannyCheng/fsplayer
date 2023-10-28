import { EVENT } from "@/constant";
import { Player } from "@/player";
import { Disposable } from "@/types";
import { dispose } from "@/utils/store";

export class PictureInPicture implements Disposable {
  constructor(private player: Player) {}

  get isActive(): boolean {
    return document.pictureInPictureElement === this.player.video;
  }

  toggle = (e: Event) => {
    e.stopPropagation();
    if (this.isActive) {
      document.exitPictureInPicture();
    } else {
      this.player.video.requestPictureInPicture();
    }
  };

  dispose() {
    this.player.off(EVENT.ENTER_PIP);
    this.player.off(EVENT.EXIT_PIP);
    this.player = null!;
    dispose(this);
  }
}
