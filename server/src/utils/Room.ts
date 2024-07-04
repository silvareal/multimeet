import { Worker } from "mediasoup/node/lib/Worker";
import { Socket } from "socket.io";
import {
  AppData,
  DtlsParameters,
  ProducerOptions,
  Router,
  RtpCapabilities,
  WebRtcTransport,
} from "mediasoup/node/lib/types";

import { config } from "../config/medisoup.config";
import { Peer } from "./Peer";
import logger from "../helpers/logger.helper";
import { PeerInfo } from "../types/room.type";

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
  async createWebRtcTransport(): Promise<WebRtcTransport<AppData>> {
    try {
      // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
      // Creates a new WebRTC transport.
      const transport = await this.router.createWebRtcTransport({
        // webRtcServer : webRtcServer //TODO: setup webrtc server
        ...config.mediasoup.webRtcTransport,
        enableUdp: true,
        enableTcp: false,
      });

      transport.on("dtlsstatechange", (dtlsState) => {
        if (dtlsState === "closed") {
          transport.close();
        }
      });

      transport.on("icestatechange", (iceState) => {
        if (iceState === "disconnected" || iceState === "closed") {
          logger.warn(
            'WebRtcTransport "icestatechange" event [iceState:%s], closing peer',
            iceState
          );

          // peer.close();
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

      const peer = await this.getPeer(this.socket.id);
      await peer?.addTransport(transport);

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

  async createPeerProducer(
    transportId: string,
    parameters: ProducerOptions<AppData>
  ) {
    const peer = await this.getPeer(this.socket.id);
    const transport = peer?.getTransport(transportId);

    // https://mediasoup.org/documentation/v3/mediasoup/api/#transport-produce
    // Instructs the router to receive audio or video RTP (or SRTP depending on
    // the transport class). This is the way to inject media into mediasoup.
    const producer = await transport?.produce({ ...parameters });

    if (!producer) {
      logger.error("Failed to create producer");
      return;
    }
    peer?.addProducer(producer);

    // console.log({ socketId: this.socket.id, peer: peer?.getPeerInfo() });

    // Inform all client except you about the new producer
    this.socket.to(this.roomId).emit("newProducers", [
      {
        producerId: producer?.id,
        peerInfo: peer?.getPeerInfo(),
        type: producer?.appData?.mediaType,
      },
    ]);
    return producer;
  }

  // Creates a mediasoup Consumer for the given mediasoup Producer.
  async createPeerConsumer({
    producerId,
    rtpCapabilities,
    consumerTransportId,
  }: {
    producerId: string;
    rtpCapabilities: RtpCapabilities;
    consumerTransportId: string;
  }) {
    // https://mediasoup.org/documentation/v3/mediasoup/api/#router-canConsume
    // Whether the given RTP capabilities are valid to consume the given producer.
    if (!this.router.canConsume({ producerId, rtpCapabilities })) {
      logger.error("Failed to consume");
      return;
    }
    const peer = await this.getPeer(this.socket.id);
    const peerConsumerTransport = peer?.getTransport(consumerTransportId);
    const consumer = await peerConsumerTransport?.consume({
      producerId,
      rtpCapabilities, // Enable NACK for OPUS.
      enableRtx: true,
      paused: true,
    });

    if (!consumer) return;

    peer?.addConsumer(consumer);

    return consumer;
  }

  async resumeConsumer(consumerId: string) {
    const peer = await this.getPeer(this.socket.id);
    const consumer = peer?.getConsumer(consumerId);
    consumer?.resume();
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

  async getPeerProducers() {
    let producers: { producerId: string; peerInfo: PeerInfo; type: unknown }[] =
      [];
    this.peers.forEach((peer) => {
      peer.producers.forEach((producer) => {
        producers.push({
          producerId: producer.id,
          peerInfo: peer.getPeerInfo(),
          type: producer.appData.mediaType,
        });
      });
    });
    return producers;
  }
}
