import { MP4ArrayBuffer } from "mp4box";

type States = "paused" | "loading" | "stopped" | "none" | "finished";

type ArrayBufferWrapper = {
  bytes: Promise<MP4ArrayBuffer>;
  start: number;
};

const rRange = /(\d+)-(\d+)\/(\d+)/;

export class Downloader {
  // 每次请求的文件大小, 默认150KB
  private chunkSize = 1024 * 150;
  // 每次请求相对文件的初始偏移量
  private chunkStart = 0;
  // 文件总大小
  private total = 0;
  private url = "";
  private state: States = "none";
  // 是否完整请求完文件
  eof = false;
  private fetcher!: AbortController;
  // fetch配置项
  private fetchInit: RequestInit;
  // 回调函数（数据处理函数）
  private callback!: (bytes: MP4ArrayBuffer, total: number) => void;

  constructor(url: string, fetchInit: RequestInit = {}) {
    this.url = url;
    this.fetchInit = fetchInit;
  }

  start() {
    console.log(`Downloader, Starting file download`);

    if (this.state !== "loading") {
      this.state = "loading";
      this.setChunkStart(0);
      this.loadFile();
    }
  }

  resume() {
    console.log(`Downloader, Resuming file download`);

    if (this.state !== "loading") {
      this.state = "loading";
      this.loadFile();
    }
  }

  stop() {
    console.log("Downloader, Stopping file download");

    this.state = "stopped";
    if (this.fetcher !== null) {
      this.fetcher.abort();
      this.fetcher = null!;
    }
  }

  setUrl(_url: string): this {
    this.url = _url;
    return this;
  }

  setChunkSize(_chunkSize: number): this {
    this.chunkSize = _chunkSize;
    return this;
  }

  setChunkStart(_chunkStart: number): this {
    this.chunkStart = _chunkStart;
    this.eof = false;
    return this;
  }

  setCallback(cb: (bytes: MP4ArrayBuffer, total: number) => void) {
    this.callback = cb;
    return this;
  }

  private async loadChunk(
    success: (bytes: MP4ArrayBuffer, start: number) => void,
    error: (e: unknown) => void
  ) {
    const ctrl = new AbortController();
    let end = this.chunkStart + this.chunkSize - 1;
    end = this.total && end >= this.total - 1 ? this.total - 1 : end;

    // 未配置请求头
    if (!this.fetchInit.headers) {
      this.fetchInit.headers = {
        Range: `bytes=${this.chunkStart}-${end}`,
      };
    } else {
      const headers = Object.assign(this.fetchInit.headers, {
        Range: `bytes=${this.chunkStart}-${end}`,
      });
      this.fetchInit.headers = headers;
    }

    this.fetchInit.signal = ctrl.signal;
    try {
      const res = await fetch(this.url, this.fetchInit).then((res) => {
        if (res.ok) {
          let [, begin, end, total] = res.headers
            .get("Content-Range")
            ?.match(rRange)!;
          this.chunkStart = parseInt(end, 10);
          this.total = parseInt(total, 10);
          return {
            bytes: res.arrayBuffer(),
            start: parseInt(begin),
          } as unknown as ArrayBufferWrapper;
        }
      });
      const { bytes, start } = res as ArrayBufferWrapper;
      const buffers = await bytes;
      success(buffers, start);
    } catch (e) {
      error(e);
    }

    return ctrl;
  }

  async loadFile() {
    const onSuccess = (bytes: MP4ArrayBuffer, start: number) => {
      this.fetcher = null!;
      this.eof = this.chunkStart >= this.total - 1 ? true : false;
      if (this.eof) {
        this.state = "finished";
      }

      bytes.fileStart = start;
      // 通过回调将下载数据交由MSE管理

      this.callback(bytes, this.total);
      if (this.state === "loading") this.loadChunk(onSuccess, onError);
    };

    const onError = (e: unknown) => {
      console.error(e);
    };

    if (this.state !== "loading" || this.eof) return;
    this.fetcher = await this.loadChunk(onSuccess, onError);
  }
}
