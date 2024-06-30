import { Worker } from "mediasoup/node/lib/Worker";
import { Server, Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import { config } from "../config/medisoup.config";
import {
  AppData,
  DtlsParameters,
  IceCandidate,
  IceParameters,
  ProducerOptions,
  Router,
  SctpParameters,
  Transport,
  WebRtcTransport,
} from "mediasoup/node/lib/types";
import { PeerInfo } from "../types/room.type";
import { Peer } from "./Peer";
import logger from "../helpers/logger.helper";

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
  async createWebRtcTransport(
    sender: boolean
  ): Promise<WebRtcTransport<AppData>> {
    let transport!: WebRtcTransport<AppData>;

    try {
      // https://mediasoup.org/documentation/v3/mediasoup/api/#router-createWebRtcTransport
      // Creates a new WebRTC transport.
      const transport = await this.router.createWebRtcTransport({
        // webRtcServer : webRtcServer //TODO: setup webrtc server
        ...config.mediasoup.webRtcTransport,
        enableUdp: true,
        enableTcp: false,
      });

      const peer = await this.getPeer(this.socket.id);
      await peer?.addTransport({ transport, sender });

      transport.on("dtlsstatechange", (dtlsState) => {
        if (dtlsState === "closed") {
          transport.close();
        }
      });

      transport.on("@close", () => {
        console.log("transport closed");
      });
    } catch (error) {
      logger.error("createWebRtcTransport", error);
      throw error;
    }

    return transport;
  }

  async connectSendWebRtcTransport(
    transportId: string,
    dtlsParameters: DtlsParameters
  ) {
    const peer = await this.getPeer(this.socket.id);
    const transport = peer?.getTransport(transportId);

    // https://mediasoup.org/documentation/v3/mediasoup/api/#webRtcTransport-connect
    // Provides the WebRTC transport with the endpoint parameters.
    await transport?.transport?.connect({ dtlsParameters });
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
    const producer = await transport?.transport?.produce({ ...parameters });
    return producer;
  }

  async getRouterRtpCapabilities() {
    //https://mediasoup.org/documentation/v3/mediasoup/api/#router-rtpCapabilities
    return this.router.rtpCapabilities;
  }

  async getPeer(socketId: string) {
    return this.peers.get(socketId);
  }

  async addPeer(peer: Peer, p0: Peer) {
    return this.peers.set(peer?.id, peer);
  }
}
