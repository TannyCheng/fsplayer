import { Node, DOMProps } from "@/types";

// 标签描述符的正则表达式
// 支持识别如 'div', 'div.className', 'div#id'
const SelectorReg = /([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?/;

/**
 * 创建一个元素
 * @param desc 标签描述符，描述创建标签类型，类名，id属性等
 * @param props 标签属性符，描述创建标签属性
 * @param children 标签的孩子
 */
export function $<T extends HTMLElement>(
  desc?: string,
  props?: DOMProps,
  children?: string | Node[]
): T {
  let el = null;
  // 创建元素
  if (desc) {
    const match = SelectorReg.exec(desc) as string[];
    el = match[1]
      ? document.createElement(match[1])
      : document.createElement("div");
    if (match[2]) {
      el.id = match[2];
    }
    match[3] && addClass(el, match[3]);
  } else {
    el = document.createElement("div");
  }

  for (const key in props) {
    // style
    if (typeof props[key] === "object" && key === "style") {
      let styleStr = "";
      const style = props[key];
      for (const k in style) {
        styleStr += `${k}: ${style[k]}`;
      }
      el.setAttribute("style", styleStr);
    } else if (key === "id") {
      el.id = el.id ?? props[key];
    } else {
      addClass(el, props[key]);
    }
  }

  if (children !== undefined) {
    if (typeof children === "string") {
      el.innerHTML = children;
    } else {
      for (const child of children) {
        el.appendChild(child.el);
      }
    }
  }

  return el as T;
}

export function addClass(el: Element, className: string | string[]): void {
  const classList = el.classList;
  if (Array.isArray(className)) {
    for (const name of className) {
      if (!classList.contains(name)) {
        classList.add(name);
      }
    }
  } else {
    classList.add(className);
  }
}

export function removeClass(el: Element, className: string | string[]): void {
  const classList = el.classList;
  if (Array.isArray(className)) {
    classList.remove(...className);
  } else {
    classList.remove(className);
  }
}
