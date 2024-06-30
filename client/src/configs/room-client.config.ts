import * as mediaSoupClient from "mediasoup-client";

import { roomSocket } from "../constants/socket.constant";
import { PeerInfo } from "../types/room.type";
import { toast } from "react-toastify";
import { StreamContextType } from "../providers/StreamProvider";

export class RoomClient {
  toast;
  socket;
  roomId;
  context;
  producers;
  consumers;
  producerTransport;
  consumerTransport;

  private mediasoupDevice: mediaSoupClient.types.Device | null;
  private routerRtpCapabilities: mediaSoupClient.types.RtpCapabilities | null;

  constructor(roomId: string, streamContext: StreamContextType) {
    this.socket = roomSocket;
    this.roomId = roomId;
    this.context = streamContext;
    this.producers = new Map();
    this.consumers = new Map();
    this.producerTransport = new Map();
    this.consumerTransport = new Map();
    this.toast = toast;
    this.mediasoupDevice = null;
    this.routerRtpCapabilities = null;
  }

  async join(peerInfo: PeerInfo) {
    this.socket.emit(
      "room:join",
      { roomId: this.roomId, peerInfo },
      ({ error }: any) => {
        if (error) {
          this.toast.error(error, { position: "top-center" });
        } else {
          this.toast("connecting...");
          this._join();
        }
      }
    );
  }

  async _join() {
    await this.socket.emit(
      "getRouterRtpCapabilities",
      async (rtpCapabilities: mediaSoupClient.types.RtpCapabilities) => {
        this.routerRtpCapabilities = rtpCapabilities;
        console.log({ rtpCapabilities, 2: this.routerRtpCapabilities });
        await this.loadDevice();

        // https://mediasoup.org/documentation/v3/tricks/#rtp-capabilities-filtering
        // Wrong received video orientation in Firefox and FFmpeg.
        this.routerRtpCapabilities.headerExtensions =
          this.routerRtpCapabilities?.headerExtensions?.filter(
            (ext) => ext.uri !== "urn:3gpp:video-orientation"
          );

        await this.createSendTransport();
      }
    );
  }

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

  getLocalStream() {
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
        this.context.setStream(stream);
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

  private async createSendTransport() {
    this.socket.emit(
      "createWebRtcTransport",
      { sender: true },
      (
        createWebRtcTransportPayload: mediaSoupClient.types.TransportOptions<mediaSoupClient.types.AppData>
      ) => {
        console.log({ createWebRtcTransportPayload });
        const producerTransport = this.mediasoupDevice?.createSendTransport({
          ...createWebRtcTransportPayload,
        });

        if (producerTransport) {
          // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-on-connect
          producerTransport.on(
            "connect",
            async ({ dtlsParameters }, callback, errback) => {
              try {
                // Signal local DTLS parameters to the server side transport
                // see server's socket.on('connectSendWebRtcTransport', ...)
                await this.socket.emit("connectSendWebRtcTransport", {
                  transportId: producerTransport.id,
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
          producerTransport.on(
            "produce",
            async (parameters, callback, errBack) => {
              try {
                // Signal parameters to the server side transport and retrieve the id of
                // the server side new producer
                await this.socket.emit(
                  "createProducer",
                  {
                    transportId: producerTransport.id,
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
        }
      }
    );
  }

  // private async createRecvTransport(device: mediaSoupClient.types.Device) {
  //   this.socket.emit(
  //     "createWebRtcTransport",
  //     { sender: false },
  //     (
  //       parameters: mediaSoupClient.types.TransportOptions<mediaSoupClient.types.AppData>
  //     ) => {
  //       // https://mediasoup.org/documentation/v3/mediasoup-client/api/#device-createRecvTransport
  //       //    Creates a new WebRTC transport to receive media. The transport must be previously created in the mediasoup router via
  //       const consumerTransport = device.createRecvTransport({
  //         ...parameters,
  //         dtlsParameters: {
  //           ...parameters.dtlsParameters,
  //           // Remote DTLS role. We know it's always 'auto' by default so, if
  //           // we want, we can force local WebRTC transport to be 'client' by
  //           // indicating 'server' here and vice-versa.
  //           role: "auto",
  //         },
  //       });

  //       // https://mediasoup.org/documentation/v3/mediasoup-client/api/#transport-on-connect
  //       consumerTransport.on(
  //         "connect",
  //         async ({ dtlsParameters }, callback, errback) => {
  //           try {
  //             // Signal local DTLS parameters to the server side transport
  //             // see server's socket.on('connectSendWebRtcTransport', ...)
  //             this.socket.emit("connectSendWebRtcTransport", {
  //               transportId: consumerTransport.id,
  //               dtlsParameters,
  //             });

  //             // Tell the transport that parameters were transmitted.
  //             callback();
  //           } catch (error: any) {
  //             errback(error);
  //           }
  //         }
  //       );
  //     }
  //   );
  // }
}
