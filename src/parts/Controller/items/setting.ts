import { Switch } from "@/components/Switch";
import { Player } from "@/player";
import {
  $,
  addClass,
  addDisposableListener,
  getEventPath,
  hide,
  show,
  useNameSpace,
} from "@/utils";
import { Component } from "@/common/Component";
import { ControlItem } from "..";
import { Tooltip } from "@/components/Tooltip";
import { I18n, SETTINGS } from "@/features/i18n";
import { Icon } from "@/features/icons";
import { Popover } from "@/components/Popover";

export interface SettingItemOption<T = any> {
  html?: string;
  selectedHtml?: string;
  value?: T;
}

export interface SettingItem<T = any> {
  id?: string;
  html?: string;
  type?: "switch" | "select";
  checked?: boolean;
  options?: SettingItemOption<T>[];
  value?: T;
  init?: (player: Player, item: SettingItem) => void;
  change?: (value: T, player: Player, item: SettingItem) => void;
  _switch?: Switch;
  _selectedEl?: HTMLElement;
  _optionEls?: HTMLElement[];
  _optionEl?: HTMLElement;
  [key: string]: any;
}

const clsPrefix = "fs-player";
const { b } = useNameSpace("setting");
// TODO:fix when setting-item's type is select
class Setting extends Component implements ControlItem {
  readonly id = "settings";

  private player!: Player;

  private items!: SettingItem[];

  private popover!: Popover;

  private panelEl!: HTMLElement;

  tooltip!: Tooltip;

  tip = I18n.t(SETTINGS);

  init(player: Player, position: number, tooltip: Tooltip) {
    this.player = player;
    this.tooltip = tooltip;
    addClass(this.el, [`${clsPrefix}-control-item`, `${b()}`]);
    this.items = player.__settingItems;
    this.el.appendChild(Icon.settings());
    this.panelEl = this.el.appendChild($(`.${b("panel")}`));

    addDisposableListener(this, this.el, "click", (e) => {
      e.stopPropagation();
      if (this.panelEl.style.display === "block") {
        hide(this.panelEl);
      } else {
        show(this.panelEl);
      }
    });

    this.items.forEach((item) => item.init && item.init(player, item));
    this.renderHome();
  }

  update(position: number) {}

  private setPos(position: number) {
    // this.popover.reset;
  }

  private renderHome(): void {
    this.items.forEach((item) => {
      const el =
        !item._switch && !item._selectedEl && !item._optionEl
          ? $(`.${b("item")}`)
          : null;

      if (el) {
        el.appendChild($(undefined, undefined, item.html));
        el.appendChild($(`.${clsPrefix}-spacer`));
      }

      if (item.type === "switch") {
        if (!item._switch) item._switch = new Switch(el!, item.checked);
      } else {
        if (!item.options || !item.options.length) return;
        if (!item._selectedEl) {
          addClass(el!, `${b()}`);
          item._selectedEl = el?.appendChild($());
        }

        const opt = item.options.find((x) => x.value === item.value);
        if (!opt) return;
        (item._selectedEl as HTMLElement).innerHTML =
          opt.selectedHtml ?? opt.html ?? "";
      }

      if (item._optionEl) {
        item._optionEl.style.display = "none";
      }

      if (el) {
        el.addEventListener("click", this.onItemClick(item));
        this.panelEl.appendChild(el);
      }
    });
  }

  private onItemClick = (item: SettingItem) => (e: Event) => {
    e.stopPropagation();
    if (item.type === "switch") {
      item.checked = !item.checked;
      item._switch?.toggle(item.checked);
      if (item.change) item.change(item.checked, this.player, item);
    } else {
    }
  };

  private onOptionClick =
    (item: SettingItem, option: SettingItemOption) => () => {
      if (item.value !== option.value) {
        item.value = option.value;
        if (item.change) item.change(option.value, this.player, item);
      }
    };

  private back = (item: SettingItem) => () => {};

  private showOptionPage(opt: HTMLElement) {}

  show = (e: MouseEvent) => {
    // if (getEventPath(e).includes()) return
    // this.renderHome();
    show(this.panelEl);
  };

  hide = (e?: MouseEvent) => {
    if (e) e.stopPropagation();
    hide(this.panelEl);
  };
}

export const settingControlItem = () => new Setting();
