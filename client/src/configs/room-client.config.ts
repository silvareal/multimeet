import * as mediaSoupClient from "mediasoup-client";
import { Producer } from "mediasoup-client/lib/Producer";

import toast from "./toast.config";
import { roomSocket } from "../constants/socket.constant";
import { StreamContextType } from "providers/StreamProvider";
import { RoomStateContextType } from "providers/RoomProvider";
import { MediaType, PeerInfo, RoomStateType } from "../types/room.type";

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

  async join(peerInfo: PeerInfo) {
    this.socket.emit(
      "room:join",
      { roomId: this.roomId, peerInfo },
      ({ error, response }: any) => {
        if (error) {
          this.toast.error(error, { position: "top-center" });
        } else {
          this.toast("connecting...");
          this.toast.dismiss();
          this.toast.info("Connected", { position: "top-left" });
          this.context.dispatch({
            type: RoomStateType.SET_AUTH_PEER,
            payload: {
              ...response,
            },
          });
          this.process();
          this.initializeSocket();
        }
      }
    );
  }

  private async process() {
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
            autoClose: false,
          });
        } else if (
          err.name === "OverconstrainedError" ||
          err.name === "ConstraintNotSatisfiedError"
        ) {
          //constraints can not be satisfied by avb. devices
          this.toast.error("constraints can not be satisfied by avb. devices", {
            position: "top-center",
            autoClose: false,
          });
        } else if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          //permission denied in browser
          this.toast.error("permission denied in browser", {
            position: "top-center",
            autoClose: false,
          });
        } else if (err.name === "TypeError" || err.name === "TypeError") {
          //empty constraints object
          this.toast.error("empty constraints object", {
            position: "top-center",
            autoClose: false,
          });
        } else {
          //other errors
          this.toast.error(err.name, {
            position: "top-center",
            autoClose: false,
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
        this.producerTransport = this.mediasoupDevice?.createSendTransport({
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
                    transportId: this.producerTransport.id,
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

          await this.produceMedia(MediaType.AUDIO);
          await this.produceMedia(MediaType.VIDEO);

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
      async (
        parameters: mediaSoupClient.types.TransportOptions<mediaSoupClient.types.AppData>
      ) => {
        // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-createRecvTransport
        // Creates a new WebRTC transport to receive media. The transport must be previously created in the mediasoup router via
        console.log({ parameters });
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
      }
    );
  }

  // Producer
  private async produceMedia(type: MediaType) {
    try {
      let producer!: Producer;
      let track;

      // canSendMic: this._mediasoupDevice.canProduce("audio"),
      // canSendWebcam: this._mediasoupDevice.canProduce("video"),
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
            appData: { mediaType: type },
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
            appData: { mediaType: type },
          });
          producer = this.webcamProducer;
          break;

        default:
          break;
      }

      this.context.dispatch({
        type: RoomStateType.ADD_PRODUCER,
        payload: { type, producer },
      });

      producer?.on("transportclose", () => {
        // this._webcamProducer = null;
      });

      producer?.on("trackended", () => {
        // store.dispatch(
        //   requestActions.notify({
        //     type: "error",
        //     text: "Webcam disconnected!",
        //   })
        // );
        // this.disableWebcam().catch(() => {});
      });
    } catch (error) {
      console.log("media error", error);
    }
  }

  // Consumer
  async consumerMedia(data: {
    producerId: string;
    peerInfo: PeerInfo;
    type: string;
  }) {
    const { producerId, peerInfo, type } = data;

    console.log({
      producerId,
      consumerTransportId: this.consumerTransport.id,
    });

    this.socket.emit(
      "createConsumer",
      {
        producerId,
        rtpCapabilities: this.mediasoupDevice.rtpCapabilities,
        consumerTransportId: this.consumerTransport.id,
      },
      async (params: any) => {
        const consumer = await this.consumerTransport.consume({
          id: params.id,
          producerId: params.producerId,
          kind: params.kind,
          rtpParameters: params.rtpParameters,
          appData: { peerId: peerInfo.id, type: type },
        });

        this.context.dispatch({
          type: RoomStateType.ADD_PEER,
          payload: peerInfo,
        });

        this.context.dispatch({
          type: RoomStateType.ADD_CONSUMER,
          payload: consumer,
        });

        this.toast("new consumer");

        this.socket.emit("resumeConsumer", { consumerId: params?.id });
      }
    );
  }

  private initializeSocket() {
    this.socket.on(
      "newProducers",
      async (
        producers: {
          producerId: string;
          peerInfo: PeerInfo;
          type: string;
        }[]
      ) => {
        console.log("newProducers");
        if (producers.length > 0) {
          for (const producer of producers) {
            await this.consumerMedia(producer);
          }
        }
      }
    );

    this.socket.on("peerJoined", async (peer: PeerInfo) => {
      // @ts-ignore
      this.toast.userJoined({ ...peer }, { autoClose: false });
    });
  }
}
