import { useContext, useEffect } from "react";

import { PeerInfo } from "../types/room.type";
import { RoomClient } from "../configs/room-client.config";
import { RoomClientContext } from "../providers/RoomClientProvider";
import { RoomStateContext } from "providers/RoomProvider";
import { StreamContext } from "providers/StreamProvider";

export default function useMeeting(roomId: string): {
  join: (peerInfo: PeerInfo) => Promise<void>;
  getLocalStream: (callback: (stream: MediaStream) => void) => void;
  muteWebcam: () => Promise<void>;
  unmuteWebcam: () => Promise<void>;
} {
  const roomClientContext = useContext(RoomClientContext);
  const roomStateContext = useContext(RoomStateContext);
  const streamContext = useContext(StreamContext);

  const room = new RoomClient(roomId, roomStateContext, streamContext);

  useEffect(() => {
    roomClientContext?.setRoomClient(room);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function join(peerInfo: PeerInfo) {
    return room.join(peerInfo);
  }

  async function muteWebcam() {
    return room.muteWebcam();
  }

  async function unmuteWebcam() {
    return room.unmuteWebcam();
  }

  async function getLocalStream(callback: (stream: MediaStream) => void) {
    return room.getLocalStream(callback);
  }

  return { join, getLocalStream, muteWebcam, unmuteWebcam };
}
