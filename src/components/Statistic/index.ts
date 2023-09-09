import { Component, ComponentOptions } from "@/common/Component";
import { Player } from "@/player";

export class Statistic extends Component {
  private player: Player;

  constructor(player: Player, container?: HTMLElement, desc?: string) {
    const options: ComponentOptions = {
      id: "Statistic",
      container,
      desc,
    };
    super(options);
    this.player = player;
    this.init();
  }

  initComponent(): void {
    // TODO: 初始化视频统计信息组件
  }

  initMobileEvent(): void {}

  initPCEvent(): void {}

  resetComponent(): void {}

  dispose(): void {}
}
