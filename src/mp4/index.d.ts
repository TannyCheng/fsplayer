declare module "mp4box" {
  interface MP4MediaTrack {
    id: number;
    created: Date;
    modified: Date;
    movie_duration: number;
    layer: number;
    alternate_group: number;
    volume: number;
    track_width: number;
    track_height: number;
    timescale: number;
    duration: number;
    bitrate: number;
    codec: string;
    language: string;
    nb_samples: number;
  }

  interface MP4VideoData {
    width: number;
    height: number;
  }

  interface MP4VideoTrack extends MP4MediaTrack {
    video: MP4VideoData;
  }

  interface MP4AudioData {
    sample_rate: number;
    channel_count: number;
    sample_size: number;
  }

  interface MP4AudioTrack extends MP4MediaTrack {
    audio: MP4AudioData;
  }

  type MP4Track = MP4VideoTrack | MP4AudioTrack;

  export interface MP4MediaInfo {
    duration: number;
    timescale: number;
    isFragmented: boolean;
    isProgressive: boolean;
    hasIOD: boolean;
    brands: string[];
    created: Date;
    modified: Date;
    tracks: MP4Track[];
  }

  export type MP4ArrayBuffer = ArrayBuffer & { fileStart: number };

  export type MP4SourceBuffer = SourceBuffer & {
    ms?: MP4MediaSource;
    id?: number;
    segmentIndex?: number;
    pendingAppends?: any[];
    sampleNumber?: number;
    is_last?: boolean;
  };

  export type MP4MediaSource = MediaSource & {
    sb?: MP4SourceBuffer;
    pendingInits?: number;
  };

  interface segmentOptions {
    nbSamples: number;
    rapAlignement: boolean;
  }

  export interface MP4File {
    onMoovStart?: () => void;
    onReady?: (info: MP4MediaInfo) => void;
    onError?: (e: string) => void;
    onSegment?: (
      id: number,
      user: MP4SourceBuffer,
      buffer: MP4ArrayBuffer,
      sampleNumber: number,
      is_last: boolean
    ) => void;
    onItem?: (item: any) => void;
    appendBuffer(data: MP4ArrayBuffer, end?: boolean): number;
    setSegmentOptions(
      id: number,
      sb: SourceBuffer,
      options?: segmentOptions
    ): void;
    initializeSegmentation(): {
      id: number;
      user: MP4SourceBuffer;
      buffer?: ArrayBuffer;
    }[];
    releaseUsedSamples(id: number, samples: number): void;
    start(): void;
    stop(): void;
    flush(): void;
    seek(time: number, b: boolean): { offset: number; [props: string]: any };
  }

  export function createFile(): MP4File;
}
