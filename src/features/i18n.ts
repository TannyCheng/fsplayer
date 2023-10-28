import { Env } from "@/utils/env";

const data: Record<string, Record<string, string>> = Object.create(null);

export const FULL_SCREEN = "Fullscreen";
export const EXIT_FULL_SCREEN = "Exit fullscreen";
export const WEB_FULL_SCREEN = "Web fullscreen";
export const WEB_EXIT_FULL_SCREEN = "Exit web fullscreen";
export const SETTINGS = "Settings";
export const PLAY = "Play";
export const PAUSE = "Pause";
export const MUTE = "Mute";
export const UNMUTE = "Unmute";
export const NORMAL = "Normal";
export const SPEED = "Speed";
export const PIP = "Picture in Picture";
export const EXIT_PIP = "Exit Picture in Picture";
export const LOOP = "Loop";
export const VOLUME = "Volume";
export const AIRPLAY = "Airplay";
export const LIVE = "Live";
export const AUTOPLAY = "Autoplay";

export const I18n = {
  defaultLang: "",
  currentLang: "",
  t(key: string, lang?: string): string {
    return data[lang || I18n.currentLang || I18n.defaultLang]?.[key] || key;
  },
  add(lang: string, transData: Record<string, string>): void {
    data[lang.toLowerCase()] = {
      ...data[lang.toLocaleLowerCase()],
      ...transData,
    };
    I18n.fallback();
  },

  fallback(): void {
    Object.keys(data).forEach((k) => {
      data[k.split("-")[0]] = data[k];
    });
  },

  setCurrentLang(lang?: string): void {
    this.currentLang = lang || navigator.language;
    if (this.currentLang) this.currentLang = this.currentLang.toLowerCase();
  },

  setDefaultLang(lang?: string): void {
    this.defaultLang = (lang ?? "").toLocaleLowerCase();
  },
};

I18n.add("zh-cn", {
  [FULL_SCREEN]: "全屏",
  [EXIT_FULL_SCREEN]: "退出全屏",
  [PIP]: "开启画中画",
  [EXIT_PIP]: "退出画中画",
  [SETTINGS]: "设置",
  [PLAY]: "播放",
  [PAUSE]: "暂停",
  [MUTE]: "静音",
  [UNMUTE]: "取消静音",
  [NORMAL]: "正常",
  [SPEED]: "倍速",
  [LOOP]: "洗脑循环",
  [VOLUME]: "音量",
  [AIRPLAY]: "隔空播放",
  [LIVE]: "直播",
  [AUTOPLAY]: "自动播放",
});
if (Env.env === "PC") I18n.setCurrentLang();
