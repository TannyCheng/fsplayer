// 组件元素标签属性
export interface DOMProps {
  className?: string | string[];
  id?: string;
  style?: Partial<CSSStyleDeclaration>;
  [props: string]: any;
}

export type Node = {
  el: HTMLElement;
  id: string;
};

export interface PlayerOptions {
  url?: string;
  container?: HTMLElement;
  video?: HTMLVideoElement;
  autoPlay?: boolean;
  streamPlay?: boolean;
}

export type Video = {
  url?: string; // 视频源地址
  volueme?: number; // 视频音量
  time?: string; // 视频当前时间
  duration?: number; // 视频总时长
  frameRate?: number; // 码率 kps
  brandRate?: number; // 码率 bps
  videoCodec?: string; // 视频编码方式
  audioCodec?: string; // 音频编码方式
  lastUpdateTime?: Date; // 视频最近一次更新时间
  isFragmented?: boolean; // 是否为FMP4格式文件
  width?: number; // 视频宽度分辨率
  height?: number; // 视频高度分辨率
};
