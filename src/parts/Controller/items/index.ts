import { Component } from "@/common/Component";
import { spacerControlItem } from "./spacer";
import { Player } from "@/player";
import { $, addClass, addDisposableListener, useNameSpace } from "@/utils";
import { isString } from "@/utils/is";
import { ControlItem } from "..";
import { Tooltip } from "@/components/Tooltip";
import { addDisposable } from "@/utils/store";
import { Disposable } from "@/types";
import { EVENT } from "@/constant";
import { patch } from "@/utils/patch";

const { b } = useNameSpace("control-bar");

export class ControlBar extends Component {
  private controlItems: ControlItem[] = [];

  private spacer = spacerControlItem();

  constructor(
    container: HTMLElement,
    private player: Player,
    items?: (ControlItem | string)[],
    private position = 0
  ) {
    super(container, `.${b()}`);
    if (position === 0) addClass(this.el, `${b("bottom")}`);
    else if (position === 1) addClass(this.el, `${b("medium")}`);
    else if (position === 2) addClass(this.el, `${b("top")}`);
    if (items) {
      const fragment = document.createDocumentFragment();
      items.forEach((item) => {
        item = this.initControlItem(item) as ControlItem;
        if (item) {
          this.el.appendChild(item.el);
          fragment.appendChild(item.el);
          this.controlItems.push(item);
        }
      });

      this.updateTooltipPos();
      this.el.appendChild(fragment);
    }
  }

  private getControlItem(item: ControlItem | string): ControlItem | void {
    if (item === "spacer") return this.spacer;
    if (isString(item)) item = this.player.getControlItem(item) as ControlItem;
    if (!item || (item.isSupport && !item.isSupport(this.player))) return;
    return item;
  }

  private initControlItem = (
    item: ControlItem | string
  ): ControlItem | void => {
    item = this.getControlItem(item) as ControlItem;
    if (item) {
      if (!item.el) item.el = $();
      if (item.mounted) {
        if (item.tooltip) {
          item.tooltip.resetPos();
          if (this.position === 2) item.tooltip.setBottom();
        }
        if (item.update) item.update(this.position);
        return;
      }

      let tooltip: Tooltip | undefined;
      if (item.tip) tooltip = new Tooltip(item.el, item.tip);
      if (item.init) {
        if (item.init.length > 2 && !tooltip) tooltip = new Tooltip(item.el);
        item.init(this.player, this.position, tooltip as Tooltip);
      }
      if (item.dispose) addDisposable(this, item as Disposable);
      if (!tooltip) tooltip = item.tooltip;
      if (tooltip) {
        tooltip.resetPos();
        if (this.position === 2) tooltip.setBottom();
      }
      item.mounted = true;
      return item;
    }
  };

  private onHideControlItem = (item: ControlItem) => {
    if (item.hide) item.hide();
  };

  updateTooltipPos() {
    const last = this.controlItems.length - 1;
    this.controlItems.forEach((item, i) => {
      if (item.tooltip) {
        item.tooltip.resetPos();
        if (this.position === 2) item.tooltip.setBottom();
        if (i === 0) {
          item.tooltip.setLeft();
        } else if (i === last) {
          item.tooltip.setRight();
        }
      }
    });
  }

  getItems(): ControlItem[] {
    return this.controlItems;
  }

  setItems(items?: ControlItem[]) {
    if (items) {
      this.controlItems = items;
    }
  }

  update(nextItems: (ControlItem | string)[]) {
    if (nextItems) {
      const items: ControlItem[] = [];
      nextItems.forEach((item) => {
        item = this.getControlItem(item) as ControlItem;
        if (item) items.push(item);
      });

      patch(this.controlItems, items, this.el, {
        mount: this.initControlItem,
        unmount: this.onHideControlItem,
      });
      this.controlItems = items;
      this.updateTooltipPos();
      this.player.emit(EVENT.CONTROL_ITEM_UPDATE);
    }
  }
}
