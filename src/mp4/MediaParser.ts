import { Player } from "@/player";
import MP4box, { MP4ArrayBuffer, MP4File } from "mp4box";
import { Downloader } from "./Downloader";
import { VideoInfo } from "@/types";

class MediaParser {
  url: string;
  mp4boxFile: MP4File;
  downloader: Downloader;

  constructor(url: string, private player: Player) {
    this.url = url;
    this.player.video.src = url;
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
      const videoInfo: VideoInfo = {
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
    this.downloader.setCallback((bytes: MP4ArrayBuffer, total: number) => {
      let nextStart = 0;
      if (bytes) {
        nextStart = this.mp4boxFile.appendBuffer(bytes);
        this.downloader.eof = nextStart >= total - 1 ? true : false;
      }
      // 文件加载完毕
      if (this.downloader.eof) {
        console.log("MP4 file has been loaded successfully");

        this.mp4boxFile.flush();
      } else {
        this.downloader.setChunkStart(nextStart);
      }
    });
    this.downloader.start();
  }
}

export default MediaParser;
