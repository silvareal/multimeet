const os = require("os");

import {
  RtpCodecCapability,
  TransportListenInfo,
  WorkerLogTag,
} from "mediasoup/node/lib/types";

export const config = {
  // http server ip, port, and peer timeout constant
  httpIp: "0.0.0.0",
  httpPort: 3000,
  httpPeerStale: 360000,

  mediasoup: {
    // Number of mediasoup workers to launch.
    numWorkers: Object.keys(os.cpus()).length,

    // mediasoup WorkerSettings.
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#WorkerSettings
    worker: {
      //   dtlsCertificateFile: process.env.WORKER_CERT_FULLCHAIN,
      //   dtlsPrivateKeyFile: process.env.WORKER_CERT_PRIVKEY,
      rtcMinPort: 40000,
      rtcMaxPort: 49999,
      logLevel: "debug",
      logTags: [
        "info",
        "ice",
        "dtls",
        "rtp",
        "srtp",
        "rtcp",
        "rtx",
        "bwe",
        "score",
        "simulcast",
        "svc",
        "sctp",
      ] as WorkerLogTag[],
    },
    router: {
      // mediaCodecs: [
      //   {
      //     kind: "audio",
      //     mimeType: "audio/opus",
      //     clockRate: 48000,
      //     channels: 2,
      //   },
      //   {
      //     kind: "video",
      //     mimeType: "video/H264",
      //     clockRate: 90000,
      //     parameters: {
      //       "packetization-mode": 1,
      //       "profile-level-id": "42e01f",
      //       "level-asymmetry-allowed": 1,
      //     },
      //   },
      // ] as RtpCodecCapability[],
      mediaCodecs: [
        {
          kind: "audio",
          mimeType: "audio/opus",
          clockRate: 48000,
          channels: 2,
        },
        {
          kind: "video",
          mimeType: "video/VP8",
          clockRate: 90000,
          parameters: {
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/VP9",
          clockRate: 90000,
          parameters: {
            "profile-id": 2,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "4d0032",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
        {
          kind: "video",
          mimeType: "video/h264",
          clockRate: 90000,
          parameters: {
            "packetization-mode": 1,
            "profile-level-id": "42e01f",
            "level-asymmetry-allowed": 1,
            "x-google-start-bitrate": 1000,
          },
        },
      ] as RtpCodecCapability[],
    },

    // mediasoup WebRtcServer options for WebRTC endpoints (mediasoup-client,
    // libmediasoupclient).
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcServerOptions
    // NOTE: mediasoup-demo/server/lib/Room.js will increase this port for
    // each mediasoup Worker since each Worker is a separate process.
    webRtcServerOptions: {
      listenInfos: [
        {
          protocol: "udp",
          ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
          announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP,
          port: 44444,
        },
        {
          protocol: "tcp",
          ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
          announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP,
          port: 44444,
        },
      ] as TransportListenInfo[],
    },

    // The rtp listenIps setting is crucial.
    // You need to configure it appropriately for your network.
    // Without this, the demo will only work on localhost
    // See https://mediasoup.org/documentation/v3/mediasoup/api/#WebRtcTransportOptions
    webRtcTransport: {
      listenInfos: [
        {
          protocol: "udp",
          ip: "127.0.0.1", // replace with relevant IP address
          //   port: 20000,
        },
        {
          protocol: "tcp",
          ip: "127.0.0.1", // replace with relevant IP address
          //   port: 20000,
          //   ip: process.env.MEDIASOUP_LISTEN_IP || "0.0.0.0",
          //   announcedAddress: process.env.MEDIASOUP_ANNOUNCED_IP,
          //   portRange: {
          //     min: process.env.MEDIASOUP_MIN_PORT || 40000,
          //     max: process.env.MEDIASOUP_MAX_PORT || 49999,
          //   },
        },
      ] as TransportListenInfo[],
      initialAvailableOutgoingBitrate: 800000,
    },
  },
} as const;
