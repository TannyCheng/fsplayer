import { Player } from "@/player";
import { Disposable } from "@/types";
import { addDisposableListener } from "@/utils";
import { dispose } from "@/utils/store";

export type ShortcutHandler = (player: Player) => void;

const editableTagNames = ["input", "textarea", "select"];

const shortcutKeyList = [
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Space",
  "Escape",
];

export class Shortcut implements Disposable {
  private map: Record<string, ShortcutHandler>;

  constructor(private player: Player, enable: boolean) {
    this.map = Object.create(null);

    this.register("Space", (p) => p.toggle());
    this.register("ArrowLeft", (p) => p.rewind());
    this.register("ArrowRight", (p) => p.forward());
    this.register("ArrowUp", (p) => p.volumeUp());
    this.register("ArrowDown", (p) => p.volumeDown());

    if (enable) this.enable();
  }

  private onKeydown = (e: KeyboardEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;

    const focused = document.activeElement;

    if (focused) {
      const tag = focused.tagName.toLowerCase();
      const editable = focused.getAttribute("contenteditable");
      if (editableTagNames.includes(tag) || editable || editable === "") {
        return;
      }
    }

    const key = e.key === " " ? "Space" : e.key;

    let handled = false;
    if (this.map[key]) {
      this.map[key](this.player);
      handled = true;
    }

    if (handled) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  register(key: string, handler: ShortcutHandler): void {
    this.map[key] = handler;
  }

  unregister(key: string): boolean {
    return delete this.map[key];
  }

  dispose(): void {
    if (!this.map) return;
    dispose(this);
    this.map = null!;
  }

  enable(): void {
    this.disable();
    addDisposableListener(this, this.player.el, "keydown", this.onKeydown);
  }

  disable(): void {
    dispose(this);
  }
}
