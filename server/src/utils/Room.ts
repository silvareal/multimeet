import { Worker } from "mediasoup/node/lib/Worker";
import { Socket } from "socket.io";
import {
  AppData,
  DtlsParameters,
  Producer,
  ProducerOptions,
  Router,
  RtpCapabilities,
  WebRtcTransport,
} from "mediasoup/node/lib/types";

import { config } from "../config/medisoup.config";
import { Peer } from "./Peer";
import logger from "../helpers/logger.helper";
import { PeerActionTypeEnum, PeerInfo } from "../types/room.type";

export default class Room {
  roomId;
  socket;
  peers;
  worker;
  router;
  webRtcTransport;
  routerSettings;
  activeSpeakerObserver: unknown;

  constructor(
    roomId: string,
    worker: { worker: Worker; router: Router },
    socket: Socket
  ) {
    this.socket = socket;
    this.roomId = roomId;
    this.peers = new Map<string, Peer>();
    this.router = worker.router;
    this.worker = worker.worker;
    this.activeSpeakerObserver = null;
    this.webRtcTransport = config.mediasoup.webRtcTransport;
    this.routerSettings = config.mediasoup.router;
  }

  // Creating sender/receiver transports ...
  async createWebRtcTransport(data: {
    producing: boolean;
    consuming: boolean;
  }): Promise<WebRtcTransport<AppData>> {
    try {
      // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
      // Creates a new WebRTC transport.
      const transport = await this.router.createWebRtcTransport({
        // webRtcServer : webRtcServer //TODO: setup webrtc server
        ...config.mediasoup.webRtcTransport,
        enableUdp: true,
        enableTcp: false,
        appData: { ...data },
      });
      const peer = await this.getPeer(this.socket.id);
      await peer?.addTransport(transport);

      transport.on("dtlsstatechange", (dtlsState) => {
        if (dtlsState === "failed" || dtlsState === "closed") {
          transport.close();
        }
      });

      transport.on("icestatechange", (iceState) => {
        if (iceState === "disconnected" || iceState === "closed") {
          logger.warn(
            'WebRtcTransport "icestatechange" event, closing peer',
            iceState
          );

          transport.close();
        }
      });

      transport.on("sctpstatechange", (sctpState) => {
        logger.debug(
          'WebRtcTransport "sctpstatechange" event [sctpState:%s]',
          sctpState
        );
      });

      transport.on("@close", () => {
        console.log("transport closed");
      });

      return transport;
    } catch (error) {
      logger.error("createWebRtcTransport", error);
      throw error;
    }
  }

  // Connect webrtc transport
  async connectWebRtcTransport(
    transportId: string,
    dtlsParameters: DtlsParameters
  ) {
    const peer = await this.getPeer(this.socket.id);
    const transport = peer?.getTransport(transportId);

    // https://mediasoup.org/documentation/v3/mediasoup/api/#webRtcTransport-connect
    // Provides the WebRTC transport with the endpoint parameters.
    await transport?.connect({ dtlsParameters });
  }

  async createProducer(parameters: ProducerOptions<AppData>) {
    const peer = await this.getPeer(this.socket.id);
    if (!peer) return;

    const transport = peer?.getProducerTransport();

    // https://mediasoup.org/documentation/v3/mediasoup/api/#transport-produce
    // Instructs the router to receive audio or video RTP (or SRTP depending on
    // the transport class). This is the way to inject media into mediasoup.
    const producer = await transport?.produce({ ...parameters });

    if (!producer) {
      logger.error("Failed to create producer");
      return;
    }

    peer?.addProducer(producer);

    // Inform all client except you about the new producer
    this.socket.to(this.roomId).emit("newProducers", [
      {
        producerId: producer?.id,
        peerInfo: peer.getPeerInfo(),
        type: producer.appData.mediaType,
        appData: { type: producer?.appData?.mediaType, peerId: peer?.id },
      },
    ]);

    producer.on("transportclose", () => {
      logger.debug("transportclose Producer event");
      peer.closeProducer(producer.id);
    });

    return producer;
  }

  async pauseProducer(producerId: string) {
    try {
      const peer = await this.getPeer(this.socket.id);
      const producer = peer?.getProducer(producerId);
      await producer?.pause();
    } catch (error) {
      logger.error("Failed to close producer");
    }
  }

  async resumeProducer(producerId: string) {
    try {
      const peer = await this.getPeer(this.socket.id);
      const producer = peer?.getProducer(producerId);
      await producer?.resume();
    } catch (error) {
      logger.error("Failed to close producer");
    }
  }

  // Creates a mediasoup Consumer for the given mediasoup Producer.
  async createConsumer({
    producerId,
    rtpCapabilities,
  }: {
    producerId: string;
    rtpCapabilities: RtpCapabilities;
  }) {
    // https://mediasoup.org/documentation/v3/mediasoup/api/#router-canConsume
    // Whether the given RTP capabilities are valid to consume the given producer.
    if (!this.router.canConsume({ producerId, rtpCapabilities })) {
      logger.error("Failed to consume");
      return;
    }

    const peer = await this.getPeer(this.socket.id);

    const peerConsumerTransport = peer?.getConsumerTransport();
    const peerProducers = peer?.getProducer(producerId);

    const consumer = await peerConsumerTransport?.consume({
      producerId,
      rtpCapabilities, // Enable NACK for OPUS.
      enableRtx: true,
      paused: true,
      appData: peerProducers?.appData,
    });

    // consumer?.getStats();
    // setInterval(() => {
    //   consumer?.getStats().then((data) => console.log({ stats: data }));
    // }, 10000);

    if (!consumer) return;

    peer?.addConsumer(consumer);

    consumer.on("transportclose", () => {
      logger.debug("transportclose Consumer event");
      peer?.removeConsumer(consumer.id);
    });

    consumer.on("producerclose", () => {
      logger.debug('Consumer closed due to "producerclose" event');
      peer?.removeConsumer(consumer.id);

      // Notify the client that consumer is closed
      this.socket.broadcast.emit("consumerClosed", {
        consumerId: consumer.id,
      });
    });

    return consumer;
  }

  async resumeConsumer(consumerId: string) {
    const peer = await this.getPeer(this.socket.id);
    const consumer = peer?.getConsumer(consumerId);

    await consumer?.resume();
  }

  async getRouterRtpCapabilities() {
    //https://mediasoup.org/documentation/v3/mediasoup/api/#router-rtpCapabilities
    return this.router.rtpCapabilities;
  }

  async getPeer(socketId: string) {
    return this.peers.get(socketId);
  }

  async addPeer(peer: Peer) {
    return this.peers.set(peer?.id, peer);
  }

  async delPeer(peerId: string) {
    return this.peers.delete(peerId);
  }

  async removePeer() {
    const peer = await this.getPeer(this.socket.id);
    if (!peer) return;
    peer?.close();
    this.delPeer(peer.id);

    //TODO: at interval get room with empty peer and close router
  }

  async getPeerProducers() {
    let producers: {
      producerId: string;
      peerInfo: PeerInfo;
      type: unknown;
      appData: unknown;
    }[] = [];
    this.peers.forEach((peer) => {
      if (peer.id !== this.socket.id) {
        peer.producers.forEach((producer) => {
          producers.push({
            producerId: producer.id,
            peerInfo: peer.getPeerInfo(),
            type: producer.appData.mediaType,
            appData: { type: producer?.appData?.mediaType, peerId: peer?.id },
          });
        });
      }
    });
    return producers;
  }

  async sendPeerAction(type: PeerActionTypeEnum, action: any) {
    try {
      const peer = await this.getPeer(this.socket.id);
      if (!peer) return;

      switch (type) {
        case PeerActionTypeEnum.video:
          peer.peerVideo = action;
          peer.peerInfo.peerVideo = action;
          break;
        case PeerActionTypeEnum.audio:
          peer.peerAudio = action;
          peer.peerInfo.peerAudio = action;
          break;
        case PeerActionTypeEnum.screenShare:
          peer.peerScreenShare = action;
          peer.peerInfo.peerScreenShare = action;
          break;
        case PeerActionTypeEnum.raiseHand:
          peer.peerRaisedHand = action;
          peer.peerInfo.peerRaisedHand = action;
          break;
        case PeerActionTypeEnum.rec:
          peer.peerScreenRecord = action;
          peer.peerInfo.peerScreenRecord = action;
          break;
      }

      this.socket.broadcast.emit("peerAction", {
        type,
        action,
        peer: peer.getPeerInfo(),
      });
    } catch (err) {
      logger.error("Peer Status", err);
    }
  }
}
