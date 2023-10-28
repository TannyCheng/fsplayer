import {
  $,
  addDisposableListener,
  containClass,
  toggleClass,
  useNameSpace,
} from "@/utils";
import { Component } from "@/common/Component";

const { b, e, is } = useNameSpace("switch");

export class Switch extends Component {
  constructor(
    container: HTMLElement,
    value?: boolean,
    change?: (v: boolean) => void
  ) {
    super(container, `.${b()}`);
    const core = $(`span.${e("core")}`);
    const action = $(`.${e("action")}`);
    core.appendChild(action);
    this.el.appendChild(core);

    this.toggle(value ?? false);
    if (change) {
      addDisposableListener(this, this.el, "click", (e: MouseEvent) => {
        e.stopPropagation();
        this.toggle();
        change(this.isActive);
      });
    }
  }

  toggle(value?: boolean) {
    toggleClass(this.el, `${is("switch-active")}`, value);
  }

  get isActive() {
    return containClass(this.el, `${is("switch-active")}`);
  }
}
