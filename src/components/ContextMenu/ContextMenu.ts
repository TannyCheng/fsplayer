import { Component, ComponentOptions } from "@/common/Component";
import { ContextMenuItem } from ".";

export class ContextMenu extends Component {
  constructor(container?: HTMLElement, desc?: string) {
    const options: ComponentOptions = {
      id: "ContextMenu",
      container,
      desc,
      props: {
        className: "fp-video-menu",
      },
    };
    super(options);
    this.init();
  }

  initComponent(): void {
    // TODO:初始化视频统计信息组件并挂载到Menu上
  }

  initEvent(): void {}

  initPCEvent(): void {}

  initMobileEvent(): void {}

  resetComponent(): void {}

  dispose(): void {}

  registerContextMenuItem(content: ContextMenuItem, cb?: (e?: Event) => any) {
    this.el.appendChild(content.el);
    if (cb !== undefined) {
      content.el.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        cb.call(this, e);
      });
    }
  }
}
