import { PeerInfo } from "types/room.type";

export default function UserJoinedToastContent(props: PeerInfo) {
  return (
    <div className="flex gap-2 items-center">
      <img
        src={props?.avatar}
        className="w-10 h-10 rounded-full object-cover"
      />
      <p className="capitalize">{props?.peerName}</p>
    </div>
  );
}
