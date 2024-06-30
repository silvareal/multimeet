import { RoomSocket } from "./room.socket";

export default function sockets(io: any) {
  // room io namespace
  RoomSocket(io);
}
