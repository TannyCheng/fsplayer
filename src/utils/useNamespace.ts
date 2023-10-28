const namespace = "fs-player";
const statePrefix = "is-";

const _bem = (
  namespace: string,
  block: string,
  blockSuffix?: string,
  element?: string,
  modifier?: string
) => {
  // 默认是block
  let cls = `${namespace}-${block}`;

  if (blockSuffix) {
    cls += `-${blockSuffix}`;
  }

  if (element) {
    cls += `__${element}`;
  }

  if (modifier) {
    cls += `--${modifier}`;
  }

  return cls;
};

export const useNameSpace = (block: string) => {
  // 创建块
  const b = (blockSuffix = "") => _bem(namespace, block, blockSuffix);

  // 创建元素
  const e = (element?: string) =>
    element ? _bem(namespace, block, "", element) : "";

  // 创建块修改器
  const m = (modifier?: string) =>
    modifier ? _bem(namespace, block, "", "", modifier) : "";

  // 创建后缀块元素
  const be = (blockSuffix?: string, element?: string) =>
    blockSuffix && element ? _bem(namespace, block, blockSuffix, element) : "";

  // 创建元素修改器
  const em = (element?: string, modifier?: string) =>
    element && modifier ? _bem(namespace, block, "", element, modifier) : "";

  // 创建块后缀修改器
  const bm = (blockSuffix?: string, modifier?: string) =>
    blockSuffix && modifier
      ? _bem(namespace, block, blockSuffix, "", modifier)
      : "";

  // 创建块元素修改器
  const bem = (blockSuffix?: string, element?: string, modifier?: string) =>
    blockSuffix && element && modifier
      ? _bem(namespace, block, blockSuffix, element, modifier)
      : "";

  // 创建动作状态
  const is: {
    (name: string, state: boolean | undefined): string;
    (name: string): string;
  } = (name: string, ...args: [boolean | undefined] | []) => {
    const state = args.length >= 1 ? args[0] : true;
    return name && state ? `${statePrefix}${name}` : "";
  };

  return {
    b,
    e,
    m,
    be,
    em,
    bm,
    bem,
    is,
  };
};
