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
    socket.on("room:create", async (roomId) => {
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
        socket.join(roomId);

        socket.data.roomId = roomId;
        let room = rooms.get(socket.data.roomId);

        if (!room) {
          callback({ error: "Room doesn't exist" });
        } else {
          room.socket = socket;

          room.addPeer(
            new Peer(socket.id, {
              peerInfo: { ...peerInfo, id: socket.id },
              roomId,
            })
          );
          const peer = await room.getPeer(socket.id);
          socket.to(roomId).emit("peerJoined", peer);

          callback({ response: peer?.getPeerInfo() });
          logger.info("peer joined Room", roomId);
        }
      }
    );

    socket.on("getRouterRtpCapabilities", async (callback) => {
      const room = rooms.get(socket.data?.roomId);
      logger.info("Get RouterRtpCapabilities");

      try {
        const getRouterRtpCapabilities = await room?.getRouterRtpCapabilities();
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
    socket.on("createWebRtcTransport", async (callback: any) => {
      const room = rooms.get(socket.data?.roomId);
      if (room) {
        const transport = await room?.createWebRtcTransport();
        console.log({ transport: transport?.id });

        callback({
          id: transport?.id,
          iceParameters: transport?.iceParameters,
          iceCandidates: transport?.iceCandidates,
          dtlsParameters: transport?.dtlsParameters,
        });
      }
    });

    socket.on(
      "connectWebRtcTransport",
      async ({ transportId, dtlsParameters }) => {
        const room = rooms.get(socket.data?.roomId);
        room?.connectWebRtcTransport(transportId, dtlsParameters);
      }
    );

    socket.on(
      "createProducer",
      async ({ transportId, kind, rtpParameters, appData }, callback) => {
        const room = rooms.get(socket.data?.roomId);

        // Optimization: Create a server-side Consumer for each Peer.
        const producer = await room?.createPeerProducer(transportId, {
          kind,
          rtpParameters,
          appData,
        });

        callback({ id: producer?.id });
      }
    );

    socket.on(
      "createConsumer",
      async (
        { producerId, rtpCapabilities, consumerTransportId },
        callback
      ) => {
        const room = rooms.get(socket.data?.roomId);

        const consumer = await room?.createPeerConsumer({
          producerId,
          rtpCapabilities,
          consumerTransportId,
        });

        // from the consumer extract the following params
        // to send back to the Client
        const params = {
          producerId,
          id: consumer?.id,
          kind: consumer?.kind,
          rtpParameters: consumer?.rtpParameters,
          serverConsumerId: consumer?.id,
        };

        callback({ ...params });
      }
    );

    socket.on("getProducers", async () => {
      // if (!rooms.has(socket.data?.roomId)) return;
      const room = rooms.get(socket.data?.roomId);

      logger.debug("Get producers");

      // send all the current producer to newly joined member
      const producers = await room?.getPeerProducers();

      socket.emit("newProducers", producers);
    });

    socket.on("resumeConsumer", ({ consumerId }) => {
      const room = rooms.get(socket.data?.roomId);
      room?.resumeConsumer(consumerId);
    });

    socket.on("disconnect", () => {
      console.log("user disconnected");
    });
  });
}
