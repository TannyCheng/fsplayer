export type EventObject = {
  [props: string]: Function[];
};

export class Event {
  private $events: EventObject = {};

  constructor() {}

  // 事件监听
  on(event: string, callback: Function): void {
    this.$events[event] = this.$events[event] ?? [];
    this.$events[event].push(callback);
  }

  // 触发事件
  emit(event: string, ...args: unknown[]) {
    if (this.$events[event]) {
      this.$events[event].forEach((cb) => {
        cb.call(this, ...args);
      });
    }
  }

  // 取消事件监听
  off(event: string, cb: Function) {
    if (this.$events[event]) {
      this.$events[event] = this.$events[event].filter((fn) => fn !== cb);
    }
  }
}
