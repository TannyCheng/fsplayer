import Player from "@/player";
import MP4box, { MP4ArrayBuffer, MP4File } from "mp4box";
import { Downloader } from "./Downloader";
import { Video } from "@/types";

class MediaParser {
  url: string;
  player: Player;
  mp4boxFile: MP4File;
  downloader: Downloader;

  constructor(url: string, player: Player) {
    this.url = url;
    this.player = player;
    this.mp4boxFile = MP4box.createFile();
    this.downloader = new Downloader(url);
    this.init();
  }

  init() {
    this.initEvent();
    this.loadFile();
  }

  initEvent() {
    this.mp4boxFile.onReady = (info) => {
      this.downloader.stop();
      const videoInfo: Video = {
        url: this.url,
        lastUpdateTime: info.modified,
        videoCodec: info.tracks[0].codec,
        audioCodec: info.tracks[1].codec,
        isFragmented: info.isFragmented,
        width: info.tracks[0].track_width,
        height: info.tracks[0].track_height,
      };
      this.player.setVideoInfo(videoInfo);
    };
  }

  loadFile() {
    this.downloader.setCallback((bytes: MP4ArrayBuffer, eof: boolean) => {
      let nextStart = 0;
      if (bytes) {
        nextStart = this.mp4boxFile.appendBuffer(bytes);
      }
      // 文件加载完毕
      if (eof) {
        this.mp4boxFile.flush();
      } else {
        this.downloader.setChunkStart(nextStart);
      }
    });
    this.downloader.start();
  }
}

export default MediaParser;
