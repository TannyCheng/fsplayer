import { $ } from "@/utils/dom";
import { Event } from "./Event";
import { Node, DOMProps } from "@/types";

/**
 * 组件配置项
 * id 每个组件的唯一id
 * container 包裹组件的容器
 * desc 元素描述符，指定组件标签
 * props 元素属性
 */
export interface ComponentOptions {
  id: string;
  container?: HTMLElement;
  desc?: string;
  props?: DOMProps;
  children?: string | Node[];
  [prop: string]: any;
}

export abstract class Component {
  protected events = new Event();
  readonly id: string;
  el: HTMLElement;

  constructor(options: ComponentOptions) {
    const { id, props, desc, children } = options;
    this.id = id;
    this.el = $(desc, props, children);

    if (options.container) {
      options.container.appendChild(this.el);
    }
  }

  on(event: string, callback: Function) {
    this.events.on(event, callback);
  }

  emit(event: string, ...args: unknown[]) {
    this.events.emit(event, ...args);
  }

  off(event: string, callback: Function) {
    this.events.off(event, callback);
  }

  init(): void {
    this.initComponent();
    this.initEvent();
  }

  initEvent(): void {
    this.initPCEvent();
    this.initMobileEvent();
  }

  abstract initPCEvent(): void;
  abstract initMobileEvent(): void;
  abstract initComponent(): void;
  abstract resetComponent(): void;
  abstract dispose(): void;
}
