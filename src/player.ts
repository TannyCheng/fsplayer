import { EventEmitter } from "./common/EventEmitter";
import { EVENT } from "./constant";
import { Icon } from "./features";
import { Fullscreen } from "./features/fullscreen";
import { I18n } from "./features/i18n";
import { PictureInPicture } from "./features/pip";
import { Shortcut } from "./features/shortcut";
import {
  registerNameMap,
  setVideoAttrs,
  setVideoSources,
  setVideoVolumeFromLocal,
  transferEvent,
} from "./helper";
import MediaParser from "./mp4/MediaParser";
import MediaPlayer from "./mp4/MediaPlayer";
import { processOptions } from "./option";
import { Poster } from "./parts";
import { ContextMenu, ContextMenuItem } from "./parts/Contextmenu";
import { Control, ControlItem } from "./parts/Controller";
import { SettingItem } from "./parts/Controller/items/setting";
import { Loading } from "./parts/Loading";
import { Disposable, PlayerOptions, Plugin, VideoInfo } from "./types";
import {
  $,
  addClass,
  addDisposableListener,
  clamp,
  getEl,
  getExtension,
  removeNode,
  useNameSpace,
} from "./utils";
import { isString } from "./utils/is";
import { Rect } from "./utils/rect";
import { addDisposable, dispose } from "./utils/store";
import * as components from "@/components";

export class Player extends EventEmitter implements Disposable {
  container: HTMLElement | null;

  el: HTMLElement;

  opts: Required<PlayerOptions>;

  mouted = false;

  private videoInfo!: VideoInfo;

  private prevVolume = 0.5;

  private readonly settingNameMap: Record<string, SettingItem> =
    Object.create(null);

  private readonly contextmenuNameMap: Record<string, ContextMenuItem> =
    Object.create(null);

  private readonly controlNameMap: Record<string, ControlItem> =
    Object.create(null);

  private readonly plugins: Set<Plugin> = new Set();

  readonly __settingItems!: SettingItem[];

  readonly video: HTMLVideoElement;

  readonly rect: Rect;

  readonly shortcut!: Shortcut;

  readonly control: Control;

  readonly fullscreen: Fullscreen;

  readonly pip: PictureInPicture;

  readonly loading!: Loading;

  readonly contextmenu: ContextMenu;

  readonly poster: Poster;

  static components = components;

  static I18n = I18n;

  static Icon = Icon;

  static Player = Player;

  static EVENT = EVENT;

  Player!: typeof Player;

  EVENT!: typeof EVENT;

  constructor(opts?: PlayerOptions) {
    const { b } = useNameSpace("video");
    super();
    this.opts = processOptions(opts);
    I18n.setCurrentLang(this.opts.i18n);
    this.container = getEl(this.opts.container);
    this.el = $(".fs-player", {
      tabindex: "0",
      "data-screen": "normal",
      "data-ctrl-hidden": true,
      class: "no-cursor",
    });
    if (this.opts.video) {
      this.video = this.opts.video;
      addClass(this.video, `${b()}`);
    } else {
      this.video = $(`video.${b()}`);
    }

    this.attachSource(this.opts.src ?? this.video.src);
    setVideoAttrs(this.video, this.opts.videoProps);
    setVideoSources(this.video, this.opts.videoSources);
    setVideoVolumeFromLocal(this.video);
    transferEvent(this);

    this.el.appendChild(this.video);

    registerNameMap(this);

    this.rect = addDisposable(this, new Rect(this.el, this));
    this.shortcut = addDisposable(this, new Shortcut(this, this.opts.shortcut));
    this.fullscreen = addDisposable(this, new Fullscreen(this));
    this.pip = addDisposable(this, new PictureInPicture(this));
    this.loading = addDisposable(this, new Loading(this.el, this));
    this.poster = addDisposable(this, new Poster(this.el, this));
    this.contextmenu = addDisposable(
      this,
      new ContextMenu(
        this.el,
        this,
        this.opts.contextMenus
          .map((item) => {
            if (isString(item)) return this.contextmenuNameMap[item];
            return item;
          })
          .filter(Boolean)
      )
    );
    this.__settingItems = this.opts.settings
      .map((item) => {
        if (isString(item)) return this.settingNameMap[item];
        return item;
      })
      .filter(Boolean);
    this.control = addDisposable(this, new Control(this.el, this));

    if (this.opts.plugins) {
      this.opts.plugins.forEach((plugin) => this.use(plugin));
    }

    if (!this.opts.isTouch) {
      this.enableClickPause();
      addDisposableListener(this, this.el, "mouseenter", () => {
        this.control.showTransient();
      });
    }

    this.emit(EVENT.AFTER_INIT);
  }

  get currentTime(): number {
    return this.video.currentTime;
  }

  set currentTime(value: number) {
    if (!this.duration) return;
    const diff = value - this.video.currentTime;
    if (!diff) return;
    this.video.currentTime = clamp(value, 0, this.duration);
  }

  get loaded(): boolean {
    return this.video.readyState >= 3;
  }

  get duration(): number {
    return this.video.duration || 0;
  }

  get buffered(): TimeRanges {
    return this.video.buffered;
  }

  get volume(): number {
    return this.video.volume;
  }

  set volume(value: number) {
    this.video.volume = clamp(value);
    if (this.muted && value > 0) this.muted = false;
  }

  get muted(): boolean {
    return this.video.muted || this.volume === 0;
  }

  set muted(value: boolean) {
    this.video.muted = value;
  }

  get playbackrate(): number {
    return this.video.playbackRate;
  }

  set playbackrate(value: number) {
    this.video.playbackRate = value;
  }

  get ended(): boolean {
    return this.video.ended;
  }

  get paused(): boolean {
    return this.video.paused;
  }

  get playing(): boolean {
    return !this.paused && !this.ended;
  }

  get loop(): boolean {
    return this.video.loop;
  }

  set loop(value: boolean) {
    this.video.loop = value;
  }

  get autoplay(): boolean {
    return this.video.autoplay;
  }

  set autoplay(value: boolean) {
    this.video.autoplay = value;
  }

  play(): void {
    this.video.play();
  }

  pause(): void {
    this.video.pause();
  }

  seek(seconds: number) {
    this.video.currentTime = clamp(seconds, 0, this.duration);
  }

  forward(v = this.opts.seekStep) {
    this.currentTime += v;
  }

  rewind(v = this.opts.seekStep) {
    this.currentTime -= v;
  }

  volumeUp(v = this.opts.volumeStep) {
    const vol = v + this.volume;
    if (vol >= 1) this.volume = 1;
    else this.volume = vol;
  }

  volumeDown(v = this.opts.volumeStep) {
    const vol = this.volume - v;
    if (vol <= 0) this.volume = 0;
    else this.volume = vol;
  }

  toggle = (e?: Event): void => {
    e?.stopPropagation();
    if (this.paused) {
      this.play();
    } else {
      this.pause();
    }
  };

  toggleVolume(): void {
    if (this.muted) {
      this.volume = this.prevVolume || 0.5;
      this.muted = false;
    } else {
      this.prevVolume = this.volume;
      this.muted = true;
    }
  }

  eachBuffer(fn: (start: number, end: number) => boolean | void) {
    const len = this.buffered.length;
    for (let i = len - 1; i >= 0; i--) {
      if (fn(this.buffered.start(i), this.buffered.end(i))) {
        break;
      }
    }
  }

  enableClickPause() {
    this.el.addEventListener("click", this.toggle);
  }

  disableClickPause() {
    this.el.removeEventListener("click", this.toggle);
  }

  registerSettingItem(item: SettingItem, id?: string) {
    this.settingNameMap[id ?? (item.id as string)] = item;
  }

  registerContextMenuItem(item: ContextMenuItem, id?: string) {
    this.contextmenuNameMap[id ?? (item.id as string)] = item;
  }

  registerControlItem(item: ControlItem, id?: string) {
    this.controlNameMap[id ?? (item.id as string)] = item;
  }

  getSettingItem(id: string): SettingItem | undefined {
    return this.settingNameMap[id];
  }

  getContextMenuItem(id: string): ContextMenuItem | undefined {
    return this.contextmenuNameMap[id];
  }

  getControlItem(id: string): ControlItem | undefined {
    return this.controlNameMap[id];
  }

  updateOptions(opts: PlayerOptions) {
    if (opts.videoProps !== this.opts.videoProps)
      if (opts.src && opts.src !== this.opts.src) this.attachSource(opts.src);
    if (opts.videoSources !== this.opts.videoSources)
      this.opts = { ...this.opts, ...opts };
    if (this.opts.shortcut) {
      this.shortcut.enable();
    } else {
      this.shortcut.disable();
    }
    this.emit(EVENT.UPDATE_OPTIONS, this.opts);
  }

  mount(el?: PlayerOptions["container"]): void {
    if (this.mouted) {
      el = getEl(el) as HTMLElement;
      if (el && el !== this.opts.container) {
        if (this.container) this.container.removeChild(this.el);
        this.container = el;
        this.container.appendChild(this.el);
        this.emit(EVENT.UPDATE_SIZE);
      }
      return;
    }

    if (el) this.container = getEl(el) || this.container;
    if (!this.container) return;
    this.container.appendChild(this.el);
    this.emit(EVENT.MOUNTED);
    this.mouted = true;
  }

  use(plugin: Plugin): this {
    if (!plugin || this.plugins.has(plugin)) return this;
    this.plugins.add(plugin);
    if (plugin.dispose) {
      addDisposable(this, plugin as Disposable);
    }
    plugin.install(this);
    return this;
  }

  attachSource(src: string) {
    const ext = getExtension(this.opts.src);
    if (ext === "mp4") {
      if (this.opts.stream) {
        new MediaPlayer(src, this);
      } else {
        new MediaParser(src, this);
      }
    } else {
      this.opts.src = src;
    }
  }

  getVideoInfo() {
    return this.videoInfo;
  }

  setVideoInfo(info: VideoInfo) {
    this.videoInfo = info;
  }

  dispose() {
    if (!this.el) return;
    this.emit(EVENT.BEFORE_DISPOSE);
    dispose(this);
    const plugins = this.opts.plugins;
    if (plugins) plugins.forEach((p) => p.dispose && p.dispose());
    this.removeAllListeners();
    removeNode(this.el);
    this.el = null!;
    this.container = null;
  }
}

Player.prototype.Player = Player;
Player.prototype.EVENT = EVENT;
