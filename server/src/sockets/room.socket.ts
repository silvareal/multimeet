import { Server, Socket } from "socket.io";

import Room from "../utils/Room";
import { Peer } from "../utils/Peer";
import logger from "../helpers/logger.helper";
import { startMediasoup } from "../utils/startMediaSoup";
import { MediasoupWorker, PeerInfo } from "../types/room.type";
import { DefaultEventsMap } from "socket.io/dist/typed-events";

export async function RoomSocket(
  io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
) {
  const rooms = new Map<string, Room>();

  // Index of next mediasoup Worker to use.
  let nextMediasoupWorkerIdx = 0;

  // mediasoup Workers.
  let mediasoupWorkers: MediasoupWorker[] = [];

  try {
    mediasoupWorkers = await startMediasoup();
  } catch (err) {
    console.log({ err });
    logger.error("mediasoup failed to start", err);
    throw err;
  }

  // Get next mediasoup Worker.
  function getMediasoupWorker() {
    const worker = mediasoupWorkers[nextMediasoupWorkerIdx];

    if (++nextMediasoupWorkerIdx === mediasoupWorkers.length)
      nextMediasoupWorkerIdx = 0;

    return worker;
  }

  const RoomNamespace = io.of("/rooms");

  RoomNamespace.on("connection", (socket: Socket) => {
    socket.on("room:create", async ({ roomId }) => {
      let roomExist = rooms.has(roomId);
      if (roomExist) {
        logger.info("Room already created", roomId);
      } else {
        const roomWorker = await getMediasoupWorker();
        rooms.set(roomId, new Room(roomId, roomWorker, socket));
        logger.info("creating a new Room", roomId);
      }
    });

    socket.on(
      "room:join",
      async (roomInfo: { roomId: string; peerInfo: PeerInfo }, callback) => {
        const { roomId, peerInfo } = roomInfo;

        socket.data.roomId = roomId;
        let room = rooms.get(roomId);

        if (!room) {
          callback({ error: "Room doesn't exist" });
        } else {
          room.addPeer(
            socket.data.roomId,
            new Peer(socket.id, {
              peerInfo: { ...peerInfo, id: socket.id },
              roomId,
            })
          );
          callback({ response: roomId });
          logger.info("peer joined Room", roomId);
        }
      }
    );

    socket.on("getRouterRtpCapabilities", async (callback) => {
      const room = rooms.get(socket.data?.roomId);
      logger.info("Get RouterRtpCapabilities");

      try {
        const getRouterRtpCapabilities = room?.getRouterRtpCapabilities();
        logger.info("Get RouterRtpCapabilities callback", {
          callback: getRouterRtpCapabilities,
        });

        callback(getRouterRtpCapabilities);
      } catch (err: any) {
        logger.error("Get RouterRtpCapabilities error", err);
        callback({
          error: err.message,
        });
      }
    });

    // Client emits a request to create server side Transport
    // We need to differentiate between the producer and consumer transports
    socket.on(
      "createWebRtcTransport",
      async ({ sender = false }, callback: any) => {
        const room = rooms.get(socket.data?.roomId);
        if (room) {
          const transport = await room?.createWebRtcTransport(sender);

          callback({
            id: transport?.id,
            iceParameters: transport?.iceParameters,
            iceCandidates: transport?.iceCandidates,
            dtlsParameters: transport?.dtlsParameters,
          });
        }
      }
    );

    socket.on(
      "connectSendWebRtcTransport",
      async ({ transportId, dtlsParameters }) => {
        const room = rooms.get(socket.data?.roomId);
        room?.connectSendWebRtcTransport(transportId, dtlsParameters);
      }
    );

    socket.on(
      "createProducer",
      async ({ transportId, kind, rtpParameters, appData }, callback) => {
        const room = rooms.get(socket.data?.roomId);

        const producer = await room?.createPeerProducer(transportId, {
          kind,
          rtpParameters,
          appData,
        });

        callback({ id: producer?.id });
      }
    );

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}
