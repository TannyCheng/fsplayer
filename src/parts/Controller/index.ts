import { Tooltip } from "@/components/Tooltip";
import { Player } from "@/player";
import { Disposable } from "@/types";
import {
  $,
  addClass,
  addDisposableListener,
  removeClass,
  useNameSpace,
} from "@/utils";
import { Component } from "@/common/Component";
import { ControlBar } from "./items";
import { addDisposable } from "@/utils/store";
import { EVENT } from "@/constant";

export interface ControlItem extends Partial<Disposable> {
  el: HTMLElement;
  id?: string;
  tip?: string;
  tooltip?: Tooltip;
  mounted?: boolean;
  init?: (player: Player, position: number, tooltip: Tooltip) => void;
  update?: (position: number) => void;
  hide?: () => void;
  isSupport?: (player: Player) => boolean;
  [key: string]: any;
}

type BpControl = { bp: number; controls: (ControlItem | string)[][] };

const { b } = useNameSpace("control");

export class Control extends Component {
  // ignore
  private showTimer!: NodeJS.Timeout;

  private delayHidTime = 3000;

  private latch = 0;

  private controlBars: ControlBar[] = [];

  private controls: BpControl[];

  currentBp: number | undefined;

  constructor(container: HTMLElement, private player: Player) {
    super(container, `.${b()}`);
    this.el.appendChild($(`.${b("mask")}`));

    this.controlBars[1] = addDisposable(
      this,
      new ControlBar(this.el, player, player.opts.controls[1], 1)
    );
    this.controlBars[0] = addDisposable(
      this,
      new ControlBar(this.el, player, player.opts.controls[0], 0)
    );
    this.controlBars[2] = addDisposable(
      this,
      new ControlBar(container, player, player.opts.controls[2], 2)
    );
    console.log(this.controlBars);

    const bpControls = player.opts.bpControls;
    this.controls = Object.keys(bpControls)
      .map((bp) => ({ bp: Number(bp), controls: bpControls[bp] }))
      .sort((a, b) => a.bp - b.bp);

    if (this.controls.length) {
      addDisposable(this, player.on(EVENT.UPDATE_SIZE, this.emitAndUpdateBp));
      addDisposable(this, player.on(EVENT.MOUNTED, this.emitAndUpdateBp));
    }

    addDisposableListener(this, this.el, "click", (e) => e.stopPropagation());
    addDisposableListener(this, this.el, "mouseenter", this.show);
    addDisposableListener(this, this.el, "mousemove", (e) =>
      e.stopPropagation()
    );
    addDisposableListener(this, this.el, "mouseleave", this.showTransient);
    addDisposableListener(this, player.el, "mouseenter", this.showTransient);
    addDisposableListener(this, player.el, "mousemove", this.showTransient);
    addDisposableListener(this, player.el, "mouseleave", this.tryHide);
  }

  private filterItems(
    items: ControlItem[],
    toFilter: ControlItem[]
  ): ControlItem[] | undefined {
    if (items.length && toFilter.length) {
      const map = new Map();
      items.forEach((i) => map.set(i, true));
      return toFilter.filter((item) => !map.get(item));
    }
  }

  private emitAndUpdateBp = (): BpControl | undefined => {
    const width = this.player.rect.width;
    const matched = this.controls.find((c) => width <= c.bp);
    console.log(matched);

    if (this.currentBp !== matched?.bp) {
      this.currentBp = matched?.bp;
      const controls = matched?.controls ?? this.player.opts.controls;
      controls.forEach((control, index) => {
        this.updateItems(control, index);
      });
      this.player.emit(EVENT.BP_CHANGE, this.currentBp);
    }
    return matched;
  };

  updateItems(items: Parameters<ControlBar["update"]>[0], index = 0): void {
    const curBar = this.controlBars[index];
    if (!curBar) return;
    curBar.update(items || []);
    const barItems = curBar.getItems();
    this.controlBars.forEach((bar, i) => {
      if (i === index) return;
      bar.setItems(this.filterItems(barItems, bar.getItems()));
      bar.updateTooltipPos();
    });
  }

  require(): void {
    this.latch++;
  }

  release(): void {
    if (this.latch) {
      this.latch--;
      this.tryHide();
    }
  }

  show = (): void => {
    if (this.showTimer) clearTimeout(this.showTimer);
    this.showTimer = null!;
    removeClass(this.player.el, "no-cursor");
    this.player.el.setAttribute("data-ctrl-hidden", "false");
    this.player.emit(EVENT.SHOW_CONTROLLER);
  };

  hide = (): void => {
    addClass(this.player.el, "no-cursor");
    this.player.el.setAttribute("data-ctrl-hidden", "true");
    this.player.emit(EVENT.HIDE_CONTROLLER);
  };

  showTransient = (): void => {
    this.show();
    clearTimeout(this.showTimer);
    this.showTimer = setTimeout(this.tryHide, this.delayHidTime);
  };

  tryHide = (): void => {
    if (!this.latch) {
      this.hide();
    }
  };
}
