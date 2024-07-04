import { Consumer, Producer } from "mediasoup-client/lib/types";

export interface PeerInfo {
  id?: string;
  userAgent: string;
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

export const VIDEO_CONSTRAINS = {
  qvga: { width: { ideal: 320 }, height: { ideal: 240 } },
  vga: { width: { ideal: 640 }, height: { ideal: 480 } },
  hd: { width: { ideal: 1280 }, height: { ideal: 720 } },
};

export enum MediaType {
  AUDIO = "audio",
  VIDEO = "video",
  SCREEN = "screen",
}

export type RoomState = {
  authPeer: PeerInfo | null;
  producers: { type: MediaType; producer: Producer }[] | [];
  consumers: Consumer[] | [];
  peers: PeerInfo[] | [];
};

export enum RoomStateType {
  SET_AUTH_PEER = "SET_AUTH_PEER",
  ADD_PEER = "ADD_PEER",
  ADD_PRODUCER = "ADD_PRODUCER",
  ADD_CONSUMER = "ADD_CONSUMER",
}

export type RoomStateAction =
  | {
      type: RoomStateType.SET_AUTH_PEER;
      payload: PeerInfo;
    }
  | {
      type: RoomStateType.ADD_PRODUCER;
      payload: { type: MediaType; producer: Producer };
    }
  | {
      type: RoomStateType.ADD_CONSUMER;
      payload: Consumer;
    }
  | {
      type: RoomStateType.ADD_PEER;
      payload: PeerInfo;
    };
