import { Router } from "mediasoup/node/lib/types";
import { Worker } from "mediasoup/node/lib/Worker";

export interface PeerInfo {
  id: string;
  userAgent: { [field: string]: string };
  channelPassword: string;
  peerName: string;
  peerGender: string;
  avatar: string;
  peerVideo: boolean;
  peerAudio: boolean;
  peerRaisedHand: boolean;
  peerScreenRecord: boolean;
  peerScreenShare: boolean;
}

export interface Peer {
  roomId: string;
  peerInfo: PeerInfo;
}

export type MediasoupWorker = {
  worker: Worker;
  router: Router;
};

export enum PeerActionTypeEnum {
  video = "video",
  audio = "audio",
  screenShare = "screenShare",
  raiseHand = "raiseHand",
  rec = "rec",
}
