import {
  addClass,
  addDisposableListener,
  containClass,
  toggleClass,
  useNameSpace,
} from "@/utils";
import { Component } from "@/common/Component";

export interface CheckboxOptions {
  html?: string;
  checked?: boolean;
  change?: (newValue: boolean) => void;
}

const { b, is } = useNameSpace("checkbox");

export class Checkbox extends Component {
  constructor(container: HTMLElement, opts: CheckboxOptions) {
    super(container, `${b()}`);
    if (opts.html) this.el.innerHTML = opts.html;
    if (opts.change) {
      addDisposableListener(this, this.el, "click", () => {
        toggleClass(this.el, `${is("checkbox-active")}`);
        opts.change!(containClass(this.el, `${is("checkbox-active")}`));
      });
    }
    if (opts.checked) addClass(this.el, `${is("checkbox-active")}`);
  }

  update(v: boolean) {
    toggleClass(this.el, `${is("checkbox-active")}`, v);
  }
}
