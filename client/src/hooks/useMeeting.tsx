import { useContext, useEffect } from "react";

import { StreamContext } from "../providers/StreamProvider";
import { RoomClient } from "../configs/room-client.config";
import { RoomContext } from "../providers/RoomProvider";
import { PeerInfo } from "../types/room.type";

export default function useMeeting(roomId: string): {
  join: (peerInfo: PeerInfo) => Promise<void>;
} {
  const streamContext = useContext(StreamContext);
  const roomContext = useContext(RoomContext);

  const room = new RoomClient(roomId, streamContext);

  useEffect(() => {
    roomContext.setRoomClient(room);
    room.getLocalStream();
  }, []);

  async function join(peerInfo: PeerInfo) {
    return room.join(peerInfo);
  }

  return { join };
}
