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
  producers: Producer[] | [];
  consumers: Consumer[] | [];
  peers: PeerInfo[] | [];
};

export enum RoomStateType {
  SET_AUTH_PEER = "SET_AUTH_PEER",
  ADD_PEER = "ADD_PEER",
  UPDATE_PEER = "UPDATE_PEER",
  REMOVE_PEER = "REMOVE_PEER",
  ADD_PRODUCER = "ADD_PRODUCER",
  REMOVE_PRODUCER = "REMOVE_PRODUCER",
  RESUME_PRODUCER = "RESUME_PRODUCER",
  PAUSE_PRODUCER = "PAUSE_PRODUCER",
  ADD_CONSUMER = "ADD_CONSUMER",
  REMOVE_CONSUMER = "REMOVE_CONSUMER",
  LEAVE_ROOM = "LEAVE_ROOM",
}

export type RoomStateAction =
  | {
      type: RoomStateType.SET_AUTH_PEER;
      payload: PeerInfo;
    }
  | {
      type: RoomStateType.ADD_PRODUCER;
      payload: Producer;
    }
  | {
      type: RoomStateType.REMOVE_PRODUCER;
      payload: { producerId: string };
    }
  | {
      type: RoomStateType.PAUSE_PRODUCER;
      payload: { producerId: string };
    }
  | {
      type: RoomStateType.RESUME_PRODUCER;
      payload: { producerId: string };
    }
  | {
      type: RoomStateType.ADD_CONSUMER;
      payload: Consumer;
    }
  | {
      type: RoomStateType.ADD_PEER;
      payload: PeerInfo;
    }
  | {
      type: RoomStateType.UPDATE_PEER;
      payload: { type: PeerActionTypeEnum; action: any; peerId: string };
    }
  | {
      type: RoomStateType.LEAVE_ROOM;
    }
  | { type: RoomStateType.REMOVE_PEER; payload: { peerId: string } }
  | { type: RoomStateType.REMOVE_CONSUMER; payload: { consumerId: string } };

export enum PeerActionTypeEnum {
  video = "video",
  audio = "audio",
  screenShare = "screenShare",
  raiseHand = "raiseHand",
  rec = "rec",
}
