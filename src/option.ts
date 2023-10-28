import { PlayerOptions } from "./types";
import { isTouch } from "./utils/is";

const defaultOptions = (): Partial<PlayerOptions> => ({
  shortcut: true,
  seekStep: 15,
  volumeStep: 0.1,
  volumeBarLength: 100,
  volumeVertical: true,
  stream: false,
  settings: ["loop", "autoplay"],
  contextMenus: ["statistics", "version"],
  posterEnable: true,
  videoProps: {
    preload: "auto",
    playsinline: "true",
  },
});

export function processOptions(opts?: PlayerOptions): Required<PlayerOptions> {
  const defaultOpts = defaultOptions();
  const res = {
    ...defaultOpts,
    isTouch: isTouch(),
    ...opts,
  } as Required<PlayerOptions>;

  res.videoProps = Object.assign(
    defaultOpts.videoProps!,
    opts?.videoProps ?? {}
  );

  res.controls = res.controls ?? [
    [
      "play",
      res.isTouch ? "" : "volume",
      "time",
      "spacer",
      "speed",
      "settings",
      "pip",
      // "airplay",
      "fullscreen",
    ],
    [res.live ? "" : "progress"],
  ];

  res.bpControls = res.bpControls ?? {
    650: [
      ["play", res.live ? "" : "progress", "time", "fullscreen"],
      [],
      ["spacer", "airplay", "settings"],
    ],
  };

  res.controls = res.controls.filter(Boolean).map((x) => x.filter(Boolean));

  const newBpcontrols: PlayerOptions["bpControls"] = {};

  Object.keys(res.bpControls)
    .filter((x) => x && !isNaN(Number(x)) && Array.isArray(res.bpControls[x]))
    .forEach((k) => {
      newBpcontrols[k] = res.bpControls[k]
        .filter(Boolean)
        .map((x) => x.filter(Boolean));
    });

  res.bpControls = newBpcontrols;

  return res;
}

export default processOptions();
