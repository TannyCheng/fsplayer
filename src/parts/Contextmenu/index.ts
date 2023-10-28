import { Player } from "@/player";
import {
  $,
  addClass,
  addDisposableListener,
  hide,
  show,
  useNameSpace,
} from "@/utils";
import { Component } from "@/common/Component";
import { Rect } from "@/utils/rect";

export interface ContextMenuItem {
  id?: string;
  html?: string;
  disabled?: boolean;
  invisible?: boolean;
  checked?: boolean;
  init?: (player: Player, item: ContextMenuItem) => void;
  show?: (player: Player, item: ContextMenuItem) => void;
  click?: (player: Player, item: ContextMenuItem) => void;
}

const { b, bm } = useNameSpace("contextmenu");

export class ContextMenu extends Component {
  private rect: Rect;

  private showed = false;

  constructor(
    container: HTMLElement,
    private player: Player,
    private items: ContextMenuItem[]
  ) {
    super(container, `.${b()}`);
    this.hide();

    this.rect = new Rect(this.el, player);

    this.items.forEach((item) => item.init && item.init(player, item));

    addDisposableListener(this, player.el, "contextmenu", (e: MouseEvent) => {
      this.hide();
      e.preventDefault();
      e.stopPropagation();
      if (!this.showed) {
        if (this.renderItems()) {
          show(this.el);
          this.rect.update();
          this.player.rect.update();

          const { width, height } = this.rect;
          const { x, y } = this.player.rect;
          const { innerWidth, innerHeight } = window;
          const { clientX, clientY } = e;

          let left = clientX - x;
          let top = clientY - y;

          if (clientX + width > innerWidth) left = innerWidth - width;
          if (clientY + height > innerHeight) top = innerHeight - height;

          this.applyStyle({ left: `${left}px`, top: `${top}px` });
        }
      }

      this.showed = !this.showed;
    });
  }

  private getDomNodes(): HTMLElement[] {
    return this.items
      .filter((x) => x && !x.invisible)
      .map((item) => {
        const el = $(`.${b("item")}`);
        if (item.show) item.show(this.player, item);
        if (item.html) el.innerHTML = item.html;
        if (item.disabled) addClass(el, `${bm("item", "disabled")}`);
        if (item.checked) addClass(el, `${bm("item", "checked")}`);
        el.addEventListener("click", (e: MouseEvent) => {
          e.stopPropagation();
          if (item.click) item.click(this.player, item);
          this.hide();
        });
        return el;
      });
  }

  private renderItems(): boolean {
    const items = this.getDomNodes();

    if (!items.length) return false;
    this.el.textContent = "";
    const frag = document.createDocumentFragment();
    items.forEach((item) => frag.appendChild(item));
    this.el.appendChild(frag);
    return true;
  }

  hide = () => {
    hide(this.el);
  };
}
