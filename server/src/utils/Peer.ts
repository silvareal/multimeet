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
import logger from "../helpers/logger.helper";

export class Peer {
  id;
  avatar;
  peerInfo;
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

    this.peerInfo = data.peerInfo;
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

  getConsumerTransport() {
    const transport = Array.from(this.transports.values()).find(
      (transport) => transport.appData.consuming
    );
    if (!transport) throw new Error("Failed to get transport");
    return transport;
  }

  getProducerTransport() {
    const transport = Array.from(this.transports.values()).find(
      (transport) => transport.appData.producing
    );
    if (!transport) throw new Error("Failed to get transport");

    return transport;
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

  removeConsumer(consumerId: string) {
    const consumer = this.getConsumer(consumerId);
    if (!consumer) return;

    try {
      consumer.close();
    } catch (error: any) {
      logger.warn("Close Consumer", error.message);
    }

    this.delConsumer(consumerId);

    logger.debug("Consumer closed and deleted", {
      peerName: this.peerName,
      appData: consumer.appData,
      consumerId: consumer.id,
      consumerClosed: consumer.closed,
    });
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

  closeProducer(producerId: string) {
    const producer = this.getProducer(producerId);
    if (!producer) return;

    try {
      producer.close();
    } catch (error: any) {
      logger.warn("Close Producer", error.message);
    }

    this.delProducer(producerId);

    logger.debug("Producer closed and deleted", {
      peerName: this.peerName,
      appData: producer.appData,
      producerId: producer.id,
      producerClosed: producer.closed,
    });
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

  close() {
    // Iterate and close all mediasoup Transport associated to this Peer, so all
    // its Producers and Consumers will also be closed.
    this.transports.forEach((transport, transport_id) => {
      transport.close();
      this.delTransport(transport_id);
      logger.debug("Closed and deleted peer transport", {
        transport_id: transport_id,
        transport_closed: transport.closed,
      });
    });

    logger.debug("CLOSE PEER - CHECK TRANSPORTS | PRODUCERS | CONSUMERS", {
      peer_id: this.id,
      peer_name: this.peerName,
    });
  }
}
