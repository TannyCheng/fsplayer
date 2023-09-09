import Player from "@/player";
import { Downloader } from "./Downloader";
import MP4box, { MP4ArrayBuffer, MP4File, MP4SourceBuffer } from "mp4box";
import { MediaTrack, MoovBoxInfo } from "@/types/mp4";

class MediaPlayer {
  url: string;
  player: Player;
  downloader: Downloader;
  mp4boxFile: MP4File;
  mediaSource: MediaSource;
  mediaInfo: MoovBoxInfo;
  lastSeekTime: number = 0;

  constructor(url: string, player: Player) {
    this.url = url;
    this.player = player;
    this.init();
  }

  init() {
    this.mp4boxFile = MP4box.createFile();
    this.downloader = new Downloader(this.url);
    this.mediaSource = new MediaSource();
    this.player.video.src = URL.createObjectURL(this.mediaSource);
    this.initEvent();
  }

  initEvent() {
    this.mediaSource.addEventListener("sourceopen", (e) => {
      console.log("Starting to load MP4 file");
      this.loadFile();
    });

    // 开始解析moovbox时的回调
    this.mp4boxFile.onMoovStart = () => {
      console.log("Starting to parse moovbox information");
    };

    // moov box解析成功后触发
    this.mp4boxFile.onReady = (info: MoovBoxInfo) => {
      console.log("Moov box has been parsed successfully");
      this.mediaInfo = info;
      if (info.isFragmented) {
        this.mediaSource.duration = info.fragment_duration / info.timescale;
      } else {
        this.mediaSource.duration = info.duration / info.timescale;
      }
      // 当请求到了Moov box解析其中的视频元信息，暂停发送进一步的http请求
      this.downloader.stop();
      this.initializeAllSourceBuffers();
    };

    // MP4分片
    this.mp4boxFile.onSegment = (id, user, buffer, sampleNumber, is_last) => {
      let sb = user;
      sb.segmentIndex++;
      // 缓冲区
      sb.pendingAppends.push({ id, buffer, sampleNumber, is_last });
      this.onUpdateEnd(sb, false);
    };

    // 播放器跳转事件
    this.player.on("seeking", (e: Event) => {
      const video = this.player.video;
      let start = 0,
        end = 0;
      if (this.lastSeekTime !== video.currentTime) {
        // 查找跳转位置是否已经加载
        for (let i = 0; i < video.buffered.length; i++) {
          start = video.buffered.start(i);
          end = video.buffered.end(i);
          if (video.currentTime >= start && video.currentTime <= end) {
            return;
          }
        }

        // 若跳转位置还未加载，则停止当前加载，加载跳转位置片段
        this.downloader.stop();
        const seek = this.mp4boxFile.seek(video.currentTime, true);
        this.downloader.setChunkStart(seek.offset);
        this.downloader.resume();
        this.lastSeekTime = video.currentTime;
      }
    });
  }

  loadFile() {
    // 若MediaSource还未附着到video元素则不执行
    if (this.mediaSource.readyState !== "open") {
      return;
    }
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

  //
  start() {
    this.downloader.setChunkStart(this.mp4boxFile.seek(0, true).offset);
    this.mp4boxFile.start();
    this.downloader.resume();
  }

  /**
   * @description 根据传入的媒体轨道类型构建对应的SourceBuffer
   * @param mp4track
   */
  addSourceBufferToMediaSource(mp4track: MediaTrack) {
    let track_id = mp4track.id;
    let codec = mp4track.codec;
    // mime指定对应媒体的编解码方式/规范
    let mime = `video/mp4; codecs="${codec}"`;
    let sb: MP4SourceBuffer;
    if (MediaSource.isTypeSupported(mime)) {
      try {
        console.log(
          `MSE - SourceBuffer # ${track_id},Creation with type ${mime}`
        );

        // 根据moov box中解析出来的track去一一创建对应的sourcebuffer
        sb = this.mediaSource.addSourceBuffer(mime);
        sb.addEventListener("error", (e) => {
          console.error(`MSE SourceBuffer #${track_id}`, e);
        });
        sb.ms = this.mediaSource;
        sb.id = track_id;
        this.mp4boxFile.setSegmentOptions(track_id, sb);
        sb.pendingAppends = [];
      } catch (e) {
        console.error(
          `MSE - SourceBuffer # ${track_id}:
          Cannot create buffer with type ${mime}` + e
        );
      }
    } else {
      throw new Error(`Your Browser doesn't support ${mime} media type`);
    }
  }

  initializeAllSourceBuffers() {
    if (this.mediaInfo) {
      this.mediaInfo.tracks.forEach((track) =>
        this.addSourceBufferToMediaSource(track)
      );
      console.log("MP4File Initialize SourceBuffer");

      this.initializeSourceBuffers();
    }
  }

  initializeSourceBuffers() {
    this.mp4boxFile.initializeSegmentation().forEach((seg, idx) => {
      if (idx === 0) {
        seg.user.ms.pendingInits = 0;
      }

      this.onInitAppended = this.onInitAppended.bind(this);
      seg.user.onupdateend = this.onInitAppended;
      console.log(
        `MSE - SourceBuffer # ${seg.user.id}:
        Appending initialization data`
      );
      seg.user.appendBuffer(seg.buffer);
      seg.user.segmentIndex = 0;
      seg.user.ms.pendingInits++;
    });
  }

  onInitAppended(e: Event) {
    let sb = e.target as MP4SourceBuffer;
    if (sb.ms.readyState === "open") {
      sb.sampleNumber = 0;
      sb.onupdateend = null;
      sb.addEventListener("updateend", () => this.onUpdateEnd(sb, true));

      // 处理缓冲区
      this.onUpdateEnd(sb, true);
      sb.ms.pendingInits--;
      // 缓冲区添加完毕,Downloader加载下一片段
      if (sb.ms.pendingInits === 0) {
        this.start();
      }
    }
  }

  // 数据传输到SourceBuffer结束时触发
  onUpdateEnd(sb: MP4SourceBuffer, isEndOfAppend: boolean) {
    if (isEndOfAppend) {
      if (sb.sampleNumber) {
        this.mp4boxFile.releaseUsedSamples(sb.id, sb.sampleNumber);
        delete sb.sampleNumber;
      }
      // 最后一个片段加载完毕，关闭MSE流
      if (sb.is_last) {
        let flag = true;
        for (let i = 0; i < sb.ms.sourceBuffers.length; i++) {
          if (sb.ms.sourceBuffers[i].updating) {
            flag = false;
            break;
          }
        }
        if (flag) {
          console.log("Close MediaSource Stream");

          sb.ms.endOfStream();
        }
      }
    }
    // 缓冲区不为空且此时没在传输，则取缓冲区数据传输
    if (
      sb.ms.readyState === "open" &&
      sb.updating === false &&
      sb.pendingAppends.length > 0
    ) {
      const buffer = sb.pendingAppends.shift();
      sb.sampleNumber = buffer.sampleNumber;
      sb.is_last = buffer.is_last;
      sb.appendBuffer(buffer.buffer);
    }
  }
}

export default MediaPlayer;
