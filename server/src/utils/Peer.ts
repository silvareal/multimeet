import { Transport } from "mediasoup/node/lib/Transport";
import { Peer as PeerType } from "../types/room.type";
import {
  DtlsParameters,
  WebRtcTransport,
} from "mediasoup/node/lib/WebRtcTransport";
import { AppData, ProducerOptions } from "mediasoup/node/lib/types";

export class Peer {
  id;
  avatar;
  peerName;
  peerVideo;
  peerAudio;
  peerGender;
  consumers;
  producers;
  transports;
  channelPassword;
  peerRaised_hand;
  peerScreenRecord;
  peerScreenShare;

  constructor(socketId: string, data: PeerType) {
    this.id = socketId;

    this.transports = new Map<
      string,
      {
        sender: boolean;
        transport: WebRtcTransport<AppData>;
      }
    >();
    this.consumers = new Map();
    this.producers = new Map();

    this.avatar = data.peerInfo.avatar;
    this.peerName = data.peerInfo.peerName;
    this.peerVideo = data.peerInfo.peerVideo;
    this.peerAudio = data.peerInfo.peerAudio;
    this.peerGender = data.peerInfo.peerGender;
    this.channelPassword = data.peerInfo.channelPassword;
    this.peerRaised_hand = data.peerInfo.peerRaised_hand;
    this.peerScreenRecord = data.peerInfo.peerScreenRecord;
    this.peerScreenShare = data.peerInfo.peerScreenShare;
  }

  getTransport(transportId: string) {
    return this.transports.get(transportId);
  }

  delTransport(transportId: string) {
    this.transports.delete(transportId);
  }

  addTransport(transport: {
    sender: boolean;
    transport: WebRtcTransport<AppData>;
  }) {
    return this.transports.set(transport.transport.id, transport);
  }

  async getPeer() {}

  async getPeerName() {}
}
