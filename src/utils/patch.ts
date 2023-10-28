import { removeNode } from ".";

interface Node {
  id?: any;
  el: HTMLElement;
}

type op = {
  mount?: (node: Node) => void;
  unmount?: (node: Node) => void;
  update?: (node: Node) => void;
};

function isSameNode(a: Node, b: Node) {
  if (!a || !b) return false;
  return a === b || a.id === b.id;
}

function unmount(node: Node, unmountNode?: (n: Node) => void) {
  removeNode(node.el);
  if (unmountNode) unmountNode(node);
}

function mountOrMove(
  node: Node,
  container: HTMLElement,
  anchor?: Node,
  op?: (n: Node) => void
) {
  container.insertBefore(node.el, anchor?.el || null);
  if (op) op(node);
}

function lis(arr: number[]): number[] {
  const p: number[] = [];
  const m = [arr[0]];
  let lo = 0,
    hi = 0,
    mid = 0,
    last = 0;

  for (let i = 1, l = arr.length, item: number; i < l; i++) {
    item = arr[i];
    if (item !== 1) {
      last = m.length - 1;
      if (item > arr[m[last]]) {
        p[i] = m[last];
        m.push(i);
      } else {
        (lo = 0), (hi = last);
        while (lo < hi) {
          mid = ((lo + hi) / 2) | 0;
          if (item > arr[m[mid]]) {
            lo = mid + 1;
          } else {
            hi = mid;
          }
        }
        p[i] = m[lo - 1];
        m[lo] = i;
      }
    }
  }

  last = m.length;
  lo = m[last - 1];
  while (last--) {
    m[last] = lo;
    lo = p[lo];
  }

  return m;
}

export function patch(
  preNodes: Node[],
  nextNodes: Node[],
  container: HTMLElement,
  op: op = {}
) {
  let preEnd = preNodes.length - 1;
  let nextEnd = nextNodes.length - 1;
  let startIndex = 0;
  let preNode = preNodes[startIndex];
  let nextNode = nextNodes[startIndex];

  while (isSameNode(preNode, nextNode)) {
    startIndex++;
    preNode = preNodes[startIndex];
    nextNode = nextNodes[startIndex];
  }

  if (startIndex < preEnd && startIndex < nextEnd) {
    preNode = preNodes[preEnd];
    nextNode = nextNodes[nextEnd];

    while (isSameNode(preNode, nextNode)) {
      preNode = preNodes[--preEnd];
      nextNode = nextNodes[--nextEnd];
    }
  }

  if (startIndex > preEnd && startIndex > nextEnd) return;

  if (startIndex > preEnd) {
    for (let i = startIndex; i <= nextEnd; i++) {
      mountOrMove(nextNodes[i], container, undefined, op.mount);
    }
  } else if (startIndex > nextEnd) {
    for (let i = startIndex; i <= preEnd; i++) {
      unmount(preNodes[i], op.unmount);
    }
  } else {
    const toPatch = [];
    const idMap = new Map<any, number>();
    for (let i = startIndex; i <= nextEnd; i++) {
      toPatch.push(-1);
      idMap.set(nextNodes[i].id ?? nextNodes[i], i);
    }

    let moved = false;
    let prePos = 0;
    let nextIdx = 0;
    for (let i = startIndex; i <= preEnd; i++) {
      preNode = preNodes[i];
      nextIdx = idMap.get(preNode.id ?? preNode)!;

      if (nextIdx == null) {
        unmount(preNode, op.unmount);
      } else {
        toPatch[nextIdx - startIndex] = i;

        if (prePos > nextIdx) {
          moved = true;
        } else {
          prePos = nextIdx;
        }
      }
    }

    const incSeq = moved ? lis(toPatch) : [];
    let j = incSeq.length - 1;
    for (let i = toPatch.length - 1, item: number, anchor: Node; i > -1; i--) {
      item = toPatch[i];
      nextIdx = startIndex + i;
      anchor = nextNodes[nextIdx + 1];
      if (item === -1) {
        mountOrMove(nextNodes[nextIdx], container, anchor, op.mount);
      } else if (moved) {
        if (i === incSeq[j]) {
          j--;
        } else {
          mountOrMove(nextNodes[nextIdx], container, anchor, op.update);
        }
      }
    }
  }
}

type CSSStyle = Partial<CSSStyleDeclaration>;

export function patchStyle(
  el: HTMLElement,
  preStyle: CSSStyle,
  nextStyle?: CSSStyle
) {
  if (nextStyle === undefined) return;
  if (!nextStyle) {
    el.removeAttribute("style");
  } else {
    Object.keys(nextStyle).forEach((k: any) => {
      el.style[k] = nextStyle[k] || "";
    });
    Object.keys(preStyle).forEach((k: any) => {
      if (!(k in nextStyle)) {
        el.style[k] = "";
      }
    });
  }
}

const propMap: Record<string, boolean> = {
  checked: true,
  muted: true,
  multiple: true,
  selected: true,
};

function setAttr(el: HTMLElement, key: string, value: any) {
  if (propMap[key]) {
    (el as any)[key] = value;
  } else if (value === null) {
    el.removeAttribute(key);
  } else {
    el.setAttribute(key, value);
  }
}

export function patchProps(
  el: HTMLElement,
  preProps: Record<string, any>,
  nextProps?: Record<string, any>
) {
  if (nextProps === undefined) return;
  let pre: any, next: any;
  Object.keys(nextProps).forEach((k) => {
    pre = preProps[k];
    next = nextProps[k];
    if (k === "style") {
      patchStyle(el, preProps[k], nextProps[k]);
    } else if (pre !== next) {
      setAttr(el, k, next);
    }
  });
  Object.keys(preProps).forEach((k) => {
    if (!(k in preProps)) {
      setAttr(el, k, undefined);
    }
  });
}
