import MediaPlayer from "@/mp4/MediaPlayer";
import { Component, ComponentOptions } from "../common/Component";
import { PlayerOptions, Video } from "../types";
import { $, getExtension } from "../utils";
import MediaParser from "@/mp4/MediaParser";

class Player extends Component {
  readonly playerOptions: PlayerOptions;
  private videoInfo: Video;
  video: HTMLVideoElement;

  constructor(options?: PlayerOptions) {
    const componentOptions: ComponentOptions = {
      id: "Player",
      container: options?.container,
      desc: "div.fsplayer_video-wrapper",
    };
    super(componentOptions);
    // 默认禁止自动播放与流播放
    this.playerOptions = Object.assign(
      {
        autoPlay: false,
        streamPlay: false,
      },
      options
    );
    this.init();
  }

  init(): void {
    if (this.playerOptions.video !== undefined) {
      this.video = this.playerOptions.video;
      this.video.parentNode && this.video.parentNode.removeChild(this.video);
    } else {
      this.video = $("video");
      // 兼容移动端属性
      this.video["playsInline"] = true;
      // 设置播放器为H5播放器
      this.video["x5-video-player-type"] = "h5";
      this.video.controls = true;
    }
    // 请求跨域资源时不携带cookie
    this.video.crossOrigin = "anonymous";
    this.el.appendChild(this.video);

    // 初始化媒体资源
    this.playerOptions?.url && this.attachSource(this.playerOptions.url);
    this.initComponent();
  }

  initComponent(): void {}

  initPCEvent(): void {}

  initMobileEvent(): void {}

  dispose(): void {}

  resetComponent(): void {}

  // 给video添加媒体资源，开始初始化解析
  attachSource(url: string) {
    const extension = getExtension(url);
    if (extension === "mp4") {
      // new MediaParser(url, this);
      if (this.playerOptions.streamPlay) {
        // 启动流式播放
        new MediaPlayer(url, this);
      } else {
        new MediaParser(url, this);
        this.video.src = url;
      }
    }
  }

  // 获取视频信息
  getVideoInfo() {
    return this.videoInfo;
  }

  // 设置视频信息
  setVideoInfo(info: Video) {
    this.videoInfo = info;
  }
}

export default Player;
