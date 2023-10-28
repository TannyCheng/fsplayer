import { EVENT } from "./constant";
import { statisticsContextMenuItem } from "./contextmenu-items/statistics";
import { versionContextMenuItem } from "./contextmenu-items/version";
import { fullscreenControlItem } from "./parts/Controller/items/fullscreen";
import { pipControlItem } from "./parts/Controller/items/pip";
import { playControlItem } from "./parts/Controller/items/playbutton";
import { settingControlItem } from "./parts/Controller/items/setting";
import { speedControlItem } from "./parts/Controller/items/speed";
import { timeControlItem } from "./parts/Controller/items/time";
import { volumeControlItem } from "./parts/Controller/items/volume";
import { progressControlItem } from "./parts/Controller/progress";
import { Player } from "./player";
import { autoPlaySettingItem } from "./setting-items/autoplay";
import { loopSettingItem } from "./setting-items/loop";
import { Disposable, PlayerOptions } from "./types";
import { throttle } from "./utils";
import { addDisposable } from "./utils/store";

function trans(player: Player, from: string, to: string): Disposable {
  const fn = (e: Event) => player.emit(to, e);
  player.video.addEventListener(from, fn);
  return { dispose: () => player.video.removeEventListener(from, fn) };
}

function transThrottle(
  player: Player,
  from: string,
  to: string,
  dom: HTMLElement | Window = player.video,
  fn = (e: Event) => {
    player.emit(to, e);
  }
) {
  dom.addEventListener(from, throttle(fn));
  return { dispose: () => dom.removeEventListener(from, fn) };
}

export function setVideoAttrs(
  video: HTMLVideoElement,
  props: PlayerOptions["videoProps"]
) {
  if (!props) return;
  Object.keys(props).forEach((k) => {
    video.setAttribute(k, props[k]);
  });
}

export function setVideoSources(
  video: HTMLVideoElement,
  sources: PlayerOptions["videoSources"]
): void {
  if (!sources) return;
  video.innerHTML = "";
  if (!sources.length) return;
  const fragment = document.createDocumentFragment();
  sources.forEach((s: any) => {
    const source = document.createElement("source");
    Object.keys(s).forEach((k) => {
      source.setAttribute(k, s[k]);
    });
    fragment.appendChild(source);
  });
  video.appendChild(fragment);
}

const storageVolumeKey = "fsplayer:volume";

export function setVideoVolumeFromLocal(video: HTMLVideoElement): void {
  try {
    const volume = parseFloat(localStorage.getItem(storageVolumeKey)!);
    if (!isNaN(volume)) video.volume = volume;
  } catch (error) {}
}

export function saveVideoVolume(volume: number) {
  try {
    localStorage.setItem(storageVolumeKey, String(volume));
  } catch (error) {}
}

export function registerNameMap(player: Player) {
  player.registerContextMenuItem(statisticsContextMenuItem());
  player.registerContextMenuItem(versionContextMenuItem());

  player.registerSettingItem(loopSettingItem());
  player.registerSettingItem(autoPlaySettingItem());

  player.registerControlItem(playControlItem());
  player.registerControlItem(volumeControlItem());
  player.registerControlItem(timeControlItem());
  player.registerControlItem(fullscreenControlItem());
  player.registerControlItem(pipControlItem());
  player.registerControlItem(speedControlItem());
  player.registerControlItem(progressControlItem());
  player.registerControlItem(settingControlItem());
}

export function tryEmitUpdateSize(player: Player, e: Event) {
  if (player && player.rect.changed) {
    player.emit(EVENT.UPDATE_SIZE, e);
  }
}

export function transferEvent(player: Player) {
  const dis = (d: Disposable) => addDisposable(player, d);

  dis(trans(player, "durationchange", EVENT.DURATION_CHANGE));
  dis(trans(player, "ratechange", EVENT.RATE_CHANGE));
  dis(trans(player, "play", EVENT.PLAY));
  dis(trans(player, "pause", EVENT.PAUSE));
  dis(trans(player, "ended", EVENT.ENDED));
  dis(trans(player, "waiting", EVENT.WAITING));
  dis(trans(player, "stalled", EVENT.STALLED));
  dis(trans(player, "canplay", EVENT.CAN_PLAY));
  dis(trans(player, "loadedmetadata", EVENT.LOADED_METADATA));
  dis(trans(player, "error", EVENT.ERROR));
  dis(trans(player, "seeked", EVENT.SEEKED));
  dis(trans(player, "enterpictureinpicture", EVENT.ENTER_PIP));
  dis(trans(player, "exitpictureinpicture", EVENT.EXIT_PIP));

  dis(transThrottle(player, "timeupdate", EVENT.TIME_UPDATE));
  dis(transThrottle(player, "volumechange", EVENT.VOLUME_CHANGE));
  dis(transThrottle(player, "progress", EVENT.PROGRESS));

  dis(
    transThrottle(player, "resize", EVENT.UPDATE_SIZE, window, (e) =>
      tryEmitUpdateSize(player, e)
    )
  );

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(
      throttle(() => {
        player.emit(EVENT.UPDATE_SIZE);
        ro.observe(player.el);
        dis({ dispose: () => ro.disconnect() });
      })
    );
  }

  player.on(EVENT.LOADED_METADATA, () => {
    if (player.video.paused) {
      player.emit(EVENT.PAUSE);
    } else {
      player.emit(EVENT.PLAY);
    }
  });
}
