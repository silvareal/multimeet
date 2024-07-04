import { Transport } from "mediasoup/node/lib/Transport";
import { Peer as PeerType } from "../types/room.type";
import {
  DtlsParameters,
  WebRtcTransport,
} from "mediasoup/node/lib/WebRtcTransport";
import {
  AppData,
  Consumer,
  Producer,
  ProducerOptions,
} from "mediasoup/node/lib/types";

export class Peer {
  id;
  avatar;
  peerName;
  userAgent;
  peerVideo;
  peerAudio;
  peerGender;
  consumers;
  producers;
  transports;
  channelPassword;
  peerRaisedHand;
  peerScreenRecord;
  peerScreenShare;

  constructor(socketId: string, data: PeerType) {
    this.id = socketId;

    this.transports = new Map<string, WebRtcTransport<AppData>>();
    this.consumers = new Map<string, Consumer<AppData>>();
    this.producers = new Map<string, Producer<AppData>>();

    this.avatar = data.peerInfo.avatar;
    this.userAgent = data.peerInfo.userAgent;
    this.peerName = data.peerInfo.peerName;
    this.peerVideo = data.peerInfo.peerVideo;
    this.peerAudio = data.peerInfo.peerAudio;
    this.peerGender = data.peerInfo.peerGender;
    this.channelPassword = data.peerInfo.channelPassword;
    this.peerRaisedHand = data.peerInfo.peerRaisedHand;
    this.peerScreenRecord = data.peerInfo.peerScreenRecord;
    this.peerScreenShare = data.peerInfo.peerScreenShare;
  }

  getTransport(transportId: string) {
    return this.transports.get(transportId);
  }

  delTransport(transportId: string) {
    this.transports.delete(transportId);
  }

  addTransport(transport: WebRtcTransport<AppData>) {
    return this.transports.set(transport.id, transport);
  }

  getConsumer(id: string) {
    return this.consumers.get(id);
  }

  delConsumer(id: string) {
    this.consumers.delete(id);
  }

  addConsumer(consumer: Consumer) {
    return this.consumers.set(consumer.id, consumer);
  }

  getProducer(id: string) {
    return this.producers.get(id);
  }

  delProducer(id: string) {
    this.producers.delete(id);
  }

  addProducer(producer: Producer<AppData>) {
    return this.producers.set(producer.id, producer);
  }

  getPeerInfo() {
    return {
      id: this.id,
      avatar: this.avatar,
      userAgent: this.userAgent,
      peerName: this.peerName,
      peerVideo: this.peerVideo,
      peerAudio: this.peerAudio,
      peerGender: this.peerGender,
      channelPassword: this.channelPassword,
      peerRaisedHand: this.peerRaisedHand,
      peerScreenRecord: this.peerScreenRecord,
      peerScreenShare: this.peerScreenShare,
    };
  }

  async getPeerName() {}
}
