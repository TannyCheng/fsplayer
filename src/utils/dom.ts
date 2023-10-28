import { DOMAttrs } from "@/types";
import { isString } from "./is";
import { useNameSpace } from ".";

// 标签描述符的正则表达式
// 支持识别如 'div', 'div.class', 'div#id'
const SELECTOR_REGEX = /([\w-]+)?(?:#([\w-]+))?(?:\.([\w-]+))?/;

/**
 * 创建一个元素
 * @param desc 标签描述符，描述创建标签类型，类名，id属性等
 * @param attrs 标签属性符，描述创建标签属性
 * @param children 标签的孩子
 */
export function $<T extends HTMLElement>(
  desc?: string,
  attrs?: DOMAttrs,
  children?: string | Array<Node>
): T {
  let match: string[] = [];
  // 创建元素
  if (desc) match = SELECTOR_REGEX.exec(desc) ?? [];

  const el = document.createElement(match[1] ?? "div");

  if (match[2]) el.id = match[2];
  if (match[3]) addClass(el, match[3]);

  for (const key in attrs) {
    if (key === "id") {
      el.id = el.id ?? attrs[key];
    } else if (key === "class") {
      addClass(el, attrs[key]);
    } else {
      el.setAttribute(key, attrs[key]);
    }
  }

  if (children !== undefined) {
    if (isString(children)) {
      el.innerHTML = children;
    } else {
      children.forEach((c) => el.appendChild(c));
    }
  }

  return el as T;
}

export function getEl(
  el: HTMLElement | string | undefined | null
): HTMLElement | null {
  if (!el) return null;
  if (isString(el)) return document.querySelector(el);
  return el;
}

export function removeNode(node: Element): void {
  if (!node) return;
  if (node.remove) {
    node.remove();
  } else if (node.parentNode) {
    node.parentNode.removeChild(node);
  }
}

export function addClass<T extends Element>(
  el: T,
  cls: string | string[] = ""
): T {
  if (isString(cls)) {
    cls = cls.trim();
    if (!cls) return el;
    cls.split(" ").forEach((c) => el.classList.add(c));
  } else {
    cls.forEach((c) => {
      c = c.trim();
      el.classList.add(c);
    });
  }
  return el;
}

export function removeClass<T extends Element>(
  el: T,
  cls: string | string[]
): T {
  if (Array.isArray(cls)) {
    el.classList.remove(...cls);
  } else {
    el.classList.remove(cls);
  }
  return el;
}

export function containClass(el: Element, cls: string): boolean {
  return el.classList.contains(cls);
}

export function toggleClass(
  el: Element,
  cls: string,
  force?: boolean
): boolean {
  if (force) {
    el.classList.add(cls);
    return true;
  }
  if (force === false) {
    el.classList.remove(cls);
    return true;
  }
  return el.classList.toggle(cls, force);
}

export function show(el: HTMLElement | SVGElement) {
  el.style.display = "block";
}

export function hide(el: HTMLElement | SVGElement) {
  el.style.display = "none";
}

const svgNameSpace = "http://www.w3.org/2000/svg";

export function createSvg(d?: string | string[], viewbox = "0 0 24 24") {
  const svg = document.createElementNS(svgNameSpace, "svg");
  svg.setAttribute("viewBox", viewbox);
  if (d && !Array.isArray(d)) {
    const path = document.createElementNS(svgNameSpace, "path");
    path.setAttributeNS(null, "d", d);
    svg.appendChild(path);
  } else if (d && Array.isArray(d)) {
    for (const str of d) {
      const path = document.createElementNS(svgNameSpace, "path");
      path.setAttributeNS(null, "d", str);
      svg.append(path);
    }
  }
  return svg;
}

export function createButtonIcon(d?: string | string[], viewbox?: string) {
  const buttonIcon = $("div", {
    class: useNameSpace("button").b("icon"),
  });
  const commonIcon = $("span", {
    class: useNameSpace("icon").b(),
  });
  const svg = createSvg(d, viewbox);
  commonIcon.append(svg);
  buttonIcon.append(commonIcon);
  return buttonIcon;
}

export function isMouseInDom(e: MouseEvent, el: HTMLElement) {
  const { top, left } = el.getBoundingClientRect();
  let { width, height } = getComputedStyle(el);
  let x = parseInt(width);
  let y = parseInt(height);
  if (
    top <= e.clientY &&
    e.clientY <= top + y &&
    left <= e.clientX &&
    e.clientX <= left + x
  ) {
    return true;
  }
  return false;
}

export function getEventPath(ev: Event): EventTarget[] {
  return (ev as any).path || ev.composedPath();
}

export function measureElementSize(el: HTMLElement): {
  width: number;
  height: number;
} {
  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.position = "absolute";
  clone.style.opacity = "0";
  clone.removeAttribute("hidden");

  const parent = clone.parentNode || document.body;

  parent.appendChild(clone);

  const rect = clone.getBoundingClientRect();

  parent.removeChild(clone);

  return rect;
}

export function getCssVar(target: HTMLElement, ...args: unknown[]): string {
  let prop = "--fs-player";
  for (const name of args) {
    prop = `${prop}-${name}`;
  }
  return getComputedStyle(target).getPropertyValue(prop);
}

export function setCssVar(
  target: HTMLElement,
  value: string,
  ...args: unknown[]
) {
  let prop = "--fs-player";
  for (const name of args) {
    prop = `${prop}-${name}`;
  }
  target.style.setProperty(prop, value);
}
