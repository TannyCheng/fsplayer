import { ContextMenuItem } from "@/parts/Contextmenu";
import { ControlItem } from "@/parts/Controller";
import { SettingItem } from "@/parts/Controller/items/setting";
import { Player } from "@/player";

export interface DOMAttrs {
  id?: string;
  class?: string | string[];
  [attr: string]: any;
}

export type MoovBoxInfo = {
  duration?: number;
  timescale?: number;
  isFragmented?: boolean;
  isProgressive?: boolean;
  hasIOD?: boolean;
  craeted?: Date;
  modified?: Date;
  tracks?: MediaTrack[];
  [props: string]: any;
};

export type MediaTrack = {
  id: number;
  created?: Date;
  modified?: Date;
  volume?: number;
  track_width?: number;
  track_height?: number;
  timescale?: number;
  duration?: number;
  bitrate?: number;
  codec?: string;
  language?: string;
  [props: string]: any;
};

export interface Disposable {
  dispose: () => void;
}

export interface Plugin extends Partial<Disposable> {
  install: (player: Player) => void;
}

export interface VideoSource {
  src?: string;
  type?: string;
}

export interface VideoInfo {
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
}

export interface PlayerOptions {
  container?: HTMLElement | string;
  video?: HTMLVideoElement;
  src?: string;
  stream?: boolean;
  videoProps?: Record<string, any>;
  videoSources?: VideoSource[];
  live?: boolean;
  autoSeekTime?: number;
  controls?: (ControlItem | string)[][];
  bpControls?: { [key: string]: (ControlItem | string)[][] };
  settings?: (SettingItem | string)[];
  contextMenus?: (ContextMenuItem | string)[];
  plugins?: Plugin[];
  seekStep?: number;
  volumeStep?: number;
  i18n?: string;
  themeColor?: string;
  posterBgColor?: string;
  progressBg?: string;
  progressDot?: HTMLElement;
  volumeProgressBg?: string;
  volumeBarLength?: number | string;
  volumeVertical?: boolean;
  loadingEl?: HTMLElement;
  poster?: string;
  posterEnable?: boolean;
  posterPlayEl?: HTMLElement;
  isTouch?: boolean;
  shortcut?: boolean;
  [key: string]: any;
}
