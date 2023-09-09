import { Component, ComponentOptions } from "@/common/Component";

export class ContextMenuItem extends Component {
  private content: string | Component;
  constructor(container: HTMLElement, content: string | Component) {
    const options: ComponentOptions = {
      id: "ContextMenuItem",
      container,
      props: {
        className: "fp-video-menu-item",
      },
    };
    super(options);
    this.content = content;
    this.init();
  }

  initPCEvent(): void {}

  initMobileEvent(): void {}

  initComponent(): void {
    if (typeof this.content === "string") {
      this.el.innerHTML = this.content;
    } else {
      this.el.appendChild(this.content.el);
    }
  }

  resetComponent(): void {}

  dispose(): void {}
}
