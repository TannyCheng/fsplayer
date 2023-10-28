const env = window.navigator.userAgent.toLowerCase();

export const Env = {
  isInWeixin() {
    return env.indexOf("micromessenger") !== -1;
  },

  isInApp() {
    return /(^|;\s)app\//.test(env);
  },

  isInIos() {
    return env.match(/(iphone|ipod|ipad);?/i);
  },

  isInAndroid() {
    return env.match(/android|adr/i);
  },

  isInPc() {
    return !(
      Env.isInAndroid() ||
      Env.isInApp() ||
      Env.isInIos() ||
      Env.isInWeixin()
    );
  },

  get env(): "PC" | "Mobile" {
    return this.isInPc() ? "PC" : "Mobile";
  },
};

export const isBrowser = typeof window !== "undefined";
export const isIOS =
  isBrowser && /(iPad|iPhone|iPod)/gi.test(navigator.platform);
