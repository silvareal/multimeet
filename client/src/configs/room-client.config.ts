import * as mediaSoupClient from "mediasoup-client";
import { Producer } from "mediasoup-client/lib/Producer";

import toast from "./toast.config";
import { roomSocket } from "../constants/socket.constant";
import { StreamContextType } from "providers/StreamProvider";
import { RoomStateContextType } from "providers/RoomProvider";
import {
  MediaType,
  PeerActionTypeEnum,
  PeerInfo,
  RoomStateType,
} from "../types/room.type";

export class RoomClient {
  toast;
  socket;
  roomId;
  context;
  streamContext: StreamContextType;

  private producerTransport!: mediaSoupClient.types.Transport;
  private consumerTransport!: mediaSoupClient.types.Transport<mediaSoupClient.types.AppData>;
  private mediasoupDevice!: mediaSoupClient.types.Device;
  private routerRtpCapabilities!: mediaSoupClient.types.RtpCapabilities;

  private webcamProducer!: mediaSoupClient.types.Producer;
  private micProducer!: mediaSoupClient.types.Producer;
  // private screenProducer!: mediaSoupClient.types.Producer;

  constructor(
    roomId: string,
    roomStateContext: RoomStateContextType,
    streamContext: StreamContextType
  ) {
    this.toast = toast;
    this.roomId = roomId;
    this.socket = roomSocket;
    this.context = roomStateContext;
    this.streamContext = streamContext;
  }

  async close() {
    try {
      console.debug("close()");

      this.socket.disconnect();

      // Close mediasoup Transports.
      if (this.producerTransport) this.producerTransport.close();

      if (this.consumerTransport) this.consumerTransport.close();

      this.context.dispatch({ type: RoomStateType.LEAVE_ROOM });
    } catch (error) {}
  }

  async join(peerInfo: PeerInfo) {
    this.toast("connecting...");

    this.socket.emit(
      "room:join",
      { roomId: this.roomId, peerInfo },
      ({ error, response }: any) => {
        if (error) {
          this.toast.error(error, { position: "top-center" });
        } else {
          this.toast.dismiss();
          this.context.dispatch({
            type: RoomStateType.SET_AUTH_PEER,
            payload: {
              ...response,
            },
          });
          this.joinRoom();
          this.initializeSocket();
        }
      }
    );
  }

  private async joinRoom() {
    await this.socket.emit(
      "getRouterRtpCapabilities",
      async (rtpCapabilities: mediaSoupClient.types.RtpCapabilities) => {
        this.routerRtpCapabilities = rtpCapabilities;

        await this.loadDevice();

        // https://mediasoup.org/documentation/v3/tricks/#rtp-capabilities-filtering
        // Wrong received video orientation in Firefox and FFmpeg.
        this.routerRtpCapabilities.headerExtensions =
          this.routerRtpCapabilities?.headerExtensions?.filter(
            (ext) => ext.uri !== "urn:3gpp:video-orientation"
          );

        await this.createSendTransport();
        await this.createRecvTransport();
      }
    );
  }

  getLocalStream(callback: (stream: MediaStream) => void) {
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: {
          width: {
            min: 640,
            max: 1920,
          },
          height: {
            min: 400,
            max: 1080,
          },
        },
      })
      .then((stream) => {
        this.streamContext.setStream(stream);
        callback(stream);
      })
      .catch((err) => {
        /* handle the error */
        if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          // Required track is missing
          this.toast.error("Track Not Found", { position: "top-center" });
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          //webcam or mic are already in use
          this.toast.error("webcam or mic are already in use", {
            position: "top-center",
          });
        } else if (
          err.name === "OverconstrainedError" ||
          err.name === "ConstraintNotSatisfiedError"
        ) {
          //constraints can not be satisfied by avb. devices
          this.toast.error("constraints can not be satisfied by avb. devices", {
            position: "top-center",
          });
        } else if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          //permission denied in browser
          this.toast.error("permission denied in browser", {
            position: "top-center",
          });
        } else if (err.name === "TypeError" || err.name === "TypeError") {
          //empty constraints object
          this.toast.error("empty constraints object", {
            position: "top-center",
          });
        } else {
          //other errors
          this.toast(err.name, {
            position: "top-center",
          });
        }
      });
  }

  // Device loading
  private async loadDevice() {
    try {
      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#Device
      // A device represents an endpoint that connects to a mediasoup Router to send and/or receive media.
      this.mediasoupDevice = new mediaSoupClient.Device();

      // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-load
      // Loads the device with the RTP capabilities of the mediasoup router.
      // This is how the device knows about the allowed media codecs and other settings.
      await this.mediasoupDevice.load({
        routerRtpCapabilities: this.routerRtpCapabilities,
      });
    } catch (error: any) {
      console.log({ error });
      if (error.name === "UnsupportedError") {
        this.toast.error("Browser not supported", { position: "top-center" });
      } else {
        this.toast.error("Browser not supported", { position: "top-center" });
      }
    }
  }

  // Create transport for sending media:
  private async createSendTransport() {
    this.socket.emit(
      "createWebRtcTransport",
      { producing: true, consuming: false },
      async (
        transportInfo: mediaSoupClient.types.TransportOptions<mediaSoupClient.types.AppData>
      ) => {
        const {
          id,
          iceParameters,
          iceCandidates,
          dtlsParameters,
          sctpParameters,
        } = transportInfo;
        this.producerTransport =
          await this.mediasoupDevice?.createSendTransport({
            id,
            iceParameters,
            iceCandidates,
            dtlsParameters,
            sctpParameters,
          });

        if (this.producerTransport) {
          // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-on-connect
          this.producerTransport.on(
            "connect",
            async ({ dtlsParameters }, callback, errback) => {
              try {
                // Signal local DTLS parameters to the server side transport
                // see server's socket.on('connectWebRtcTransport', ...)
                await this.socket.emit("connectWebRtcTransport", {
                  transportId: this.producerTransport.id,
                  dtlsParameters,
                });

                // Tell the transport that parameters were transmitted.
                callback();
              } catch (error: any) {
                errback(error);
              }
            }
          );

          // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-on-produce
          // this event is raised when a first call to transport.produce() is made
          // see connectSendTransport() below
          this.producerTransport.on(
            "produce",
            (parameters, callback, errBack) => {
              try {
                // Signal parameters to the server side transport and retrieve the id of
                // the server side new producer
                this.socket.emit(
                  "createProducer",
                  {
                    kind: parameters.kind,
                    rtpParameters: parameters.rtpParameters,
                    appData: parameters.appData,
                  },
                  (id: string) => {
                    // Let's assume the server included the created producer id in the response
                    // data object.
                    callback({ id });
                  }
                );
              } catch (error: any) {
                errBack(error);
              }
            }
          );

          this.producerTransport.on("connectionstatechange", (state) => {
            switch (state) {
              case "connecting":
                console.log("Producer Transport connecting...");
                break;
              case "connected":
                console.log("Producer Transport connected", {
                  id: this.producerTransport.id,
                });
                break;
              case "disconnected":
                console.log("Producer Transport disconnected", {
                  id: this.producerTransport.id,
                });
                break;
              case "failed":
                console.warn("Producer Transport failed", {
                  id: this.producerTransport.id,
                });

                this.producerTransport.close();
                this.toast.error(
                  "Producer Transport failed Check Your Network Connectivity center"
                );

                break;
              default:
                console.log("Producer transport connection state changes", {
                  state: state,
                  id: this.producerTransport.id,
                });
                break;
            }
          });

          this.producerTransport.on("icegatheringstatechange", (state) => {
            console.log("Producer icegatheringstatechange", {
              state: state,
              id: this.producerTransport.id,
            });
          });

          await this.produce(MediaType.AUDIO);
          await this.produce(MediaType.VIDEO);

          // get all producers from the server side and create a consumer
          this.socket.emit("getProducers");
        }
      }
    );
  }

  // Create transport for receiving media
  private async createRecvTransport() {
    this.socket.emit(
      "createWebRtcTransport",
      { producing: false, consuming: true },
      (
        parameters: mediaSoupClient.types.TransportOptions<mediaSoupClient.types.AppData>
      ) => {
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-createRecvTransport
        // Creates a new WebRTC transport to receive media. The transport must be previously created in the mediasoup router via
        this.consumerTransport = this.mediasoupDevice.createRecvTransport({
          ...parameters,
          dtlsParameters: {
            ...parameters.dtlsParameters,
            // Remote DTLS role. We know it's always 'auto' by default so, if
            // we want, we can force local WebRTC transport to be 'client' by
            // indicating 'server' here and vice-versa.
            role: "auto",
          },
        });

        console.log({ consumerTransport: this.consumerTransport });

        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-on-connect
        this.consumerTransport.on(
          "connect",
          async ({ dtlsParameters }, callback, errback) => {
            try {
              // Signal local DTLS parameters to the server side transport
              // see server's socket.on('connectWebRtcTransport', ...)
              this.socket.emit("connectWebRtcTransport", {
                transportId: parameters.id,
                dtlsParameters,
              });

              // Tell the transport that parameters were transmitted.
              callback();
            } catch (error: any) {
              errback(error);
            }
          }
        );

        this.consumerTransport.on("connectionstatechange", (state) => {
          switch (state) {
            case "connecting":
              console.log("Consumer Transport connecting...");
              break;
            case "connected":
              console.log("Consumer Transport connected", {
                id: this.consumerTransport.id,
              });
              break;
            case "disconnected":
              console.log("Consumer Transport disconnected", {
                id: this.consumerTransport.id,
              });
              break;
            case "failed":
              console.warn("Consumer Transport failed", {
                id: this.consumerTransport.id,
              });

              this.consumerTransport.close();
              this.toast.error(
                "Consumer Transport failed Check Your Network Connectivity center"
              );
              break;
            default:
              console.log("Consumer transport connection state changes", {
                state: state,
                id: this.consumerTransport.id,
              });
              break;
          }
        });

        this.consumerTransport.on("icegatheringstatechange", (state) => {
          console.log("Consumer icegatheringstatechange", {
            state: state,
            id: this.consumerTransport.id,
          });
        });
      }
    );
  }

  // Producer
  private async produce(type: MediaType) {
    try {
      let producer!: Producer;
      let track;

      switch (type) {
        case MediaType.AUDIO:
          if (!this.mediasoupDevice.canProduce(MediaType.AUDIO)) {
            console.error("enableMic() | cannot produce audio");
            return;
          }
          track = this.streamContext.stream.getAudioTracks()[0].clone();

          this.micProducer = await this.producerTransport.produce({
            track,
            codecOptions: {
              opusStereo: true,
              opusDtx: true,
              opusFec: true,
              opusNack: true,
            },
            appData: {
              peerId: this.context.roomState.authPeer?.id,
              mediaType: type,
            },
          });
          producer = this.micProducer;

          break;

        case MediaType.VIDEO:
          if (!this.mediasoupDevice.canProduce(MediaType.VIDEO)) {
            console.error("enableMic() | cannot produce audio");
            return;
          }

          track = this.streamContext.stream.getVideoTracks()[0].clone();
          this.webcamProducer = await this.producerTransport.produce({
            track,
            encodings: [
              { maxBitrate: 100000 },
              { maxBitrate: 300000 },
              { maxBitrate: 900000 },
            ],
            codecOptions: {
              videoGoogleStartBitrate: 1000,
            },
            appData: {
              peerId: this.context.roomState.authPeer?.id,
              mediaType: type,
            },
          });
          producer = this.webcamProducer;
          break;

        default:
          break;
      }

      this.context.dispatch({
        type: RoomStateType.ADD_PRODUCER,
        payload: producer,
      });

      producer?.on("transportclose", () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (type === MediaType.AUDIO) this.micProducer = null;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        if (type === MediaType.VIDEO) this.webcamProducer = null;
      });

      producer?.on("trackended", () => {
        this.toast.error(
          `${type === MediaType.AUDIO ? "Mic" : "webcam"} Disconnected`
        );
        this.removeProduce(type);
      });
    } catch (error) {
      console.log("media error", error);
    }
  }

  private async removeProduce(type: MediaType) {
    try {
      let producer!: Producer;

      switch (type) {
        case MediaType.AUDIO:
          producer = this.micProducer;
          break;

        case MediaType.VIDEO:
          producer = this.webcamProducer;
          break;
        default:
          break;
      }

      if (producer) {
        producer.close();

        this.context.dispatch({
          type: RoomStateType.REMOVE_PRODUCER,
          payload: { producerId: producer?.id },
        });

        this.socket.emit("closeProducer", { producerId: producer.id });
      }
    } catch (error) {
      console.log("media error", error);
    }
  }

  async muteWebcam() {
    try {
      const producer = this.context.roomState.producers.find(
        (producer) => producer.appData.mediaType === MediaType.VIDEO
      );

      if (!producer) throw new Error("Failed to get video producer");

      this.context.dispatch({
        type: RoomStateType.PAUSE_PRODUCER,
        payload: { producerId: producer?.id },
      });

      this.socket.emit("pauseProducer", {
        producerId: producer.id,
      });

      producer.pause();

      this.socket.emit("sendPeerAction", {
        type: PeerActionTypeEnum.video,
        action: !this.context.roomState.authPeer?.peerVideo,
      });
    } catch (error) {
      console.error("Failed to mute", error);
    }
  }

  async unmuteWebcam() {
    try {
      const producer = this.context.roomState.producers.find(
        (producer) => producer.appData.mediaType === MediaType.VIDEO
      );

      if (!producer) throw new Error("Failed to get video producer");

      this.context.dispatch({
        type: RoomStateType.RESUME_PRODUCER,
        payload: { producerId: producer?.id },
      });

      console.log({ socket: this.socket?.id || "" });

      this.socket.emit("resumeProducer", {
        producerId: producer.id,
      });

      producer.resume();

      this.socket.emit("sendPeerAction", {
        type: PeerActionTypeEnum.video,
        action: !this.context.roomState.authPeer?.peerVideo,
      });
    } catch (error) {
      console.error("Failed to unmute", error);
    }
  }

  async muteMic() {
    try {
      const producer = this.context.roomState.producers.find(
        (producer) => producer.appData.mediaType === MediaType.AUDIO
      );

      if (!producer) throw new Error("Failed to get Mic producer");

      this.context.dispatch({
        type: RoomStateType.PAUSE_PRODUCER,
        payload: { producerId: producer?.id },
      });

      this.socket.emit("pauseProducer", {
        producerId: producer.id,
      });

      producer.pause();

      this.socket.emit("sendPeerAction", {
        type: PeerActionTypeEnum.audio,
        action: !this.context.roomState.authPeer?.peerAudio,
      });
    } catch (error) {
      console.error("Failed to mute audio", error);
    }
  }

  async unmuteMic() {
    try {
      const producer = this.context.roomState.producers.find(
        (producer) => producer.appData.mediaType === MediaType.AUDIO
      );

      if (!producer) throw new Error("Failed to get Audio producer");

      this.context.dispatch({
        type: RoomStateType.RESUME_PRODUCER,
        payload: { producerId: producer?.id },
      });

      this.socket.emit("resumeProducer", {
        producerId: producer.id,
      });

      producer.resume();

      this.socket.emit("sendPeerAction", {
        type: PeerActionTypeEnum.audio,
        action: !this.context.roomState.authPeer?.peerVideo,
      });
    } catch (error) {
      console.error("Failed to unmute", error);
    }
  }

  // Consumer
  private async consume(data: {
    producerId: string;
    peerInfo: PeerInfo;
    type: string;
    appData: any;
  }) {
    const { producerId, peerInfo } = data;

    this.socket.emit(
      "createConsumer",
      {
        producerId,
        rtpCapabilities: this.mediasoupDevice.rtpCapabilities,
      },
      async (params: any) => {
        const consumer = await this.consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
          appData: data.appData,
        });

        this.context.dispatch({
          type: RoomStateType.ADD_PEER,
          payload: peerInfo,
        });

        this.context.dispatch({
          type: RoomStateType.ADD_CONSUMER,
          payload: consumer,
        });

        this.socket.emit("resumeConsumer", { consumerId: params?.id });
      }
    );
  }

  private async removeConsumer(consumerId: string) {
    await this.context.dispatch({
      type: RoomStateType.REMOVE_CONSUMER,
      payload: { consumerId },
    });
  }

  private initializeSocket() {
    this.socket.on(
      "newProducers",
      async (
        producers: {
          producerId: string;
          peerInfo: PeerInfo;
          type: string;
          appData: any;
        }[]
      ) => {
        if (producers.length > 0) {
          for (const producer of producers) {
            await this.consume(producer);
          }
        }
      }
    );

    this.socket.on(
      "peerAction",
      async (data: {
        type: PeerActionTypeEnum;
        action: unknown;
        peer: PeerInfo;
      }) => {
        this.context.dispatch({
          type: RoomStateType.UPDATE_PEER,
          payload: {
            type: data.type,
            action: data.action,
            peerId: data?.peer?.id || "",
          },
        });

        switch (data.type) {
          case PeerActionTypeEnum.video:
            break;
          case PeerActionTypeEnum.audio:
            break;
          case PeerActionTypeEnum.screenShare:
            break;
          case PeerActionTypeEnum.raiseHand:
            break;
          case PeerActionTypeEnum.rec:
            break;
        }
      }
    );

    this.socket.on("consumerClosed", async ({ consumerId }) => {
      await this.removeConsumer(consumerId);
    });

    this.socket.on("peerJoined", async (peer: PeerInfo) => {
      // @ts-ignore
      this.toast.userJoined({ ...peer });
    });

    this.socket.on("peerRemoved", async (peer: PeerInfo) => {
      // @ts-ignore
      this.toast.userLeft({ ...peer });
    });
  }
}
