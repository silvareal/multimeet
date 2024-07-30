import { Icon } from "@iconify-icon/react/dist/iconify.js";
import { RoomStateContext } from "providers/RoomProvider";
import { useContext } from "react";

export default function MeetingParticipantsTab() {
  const roomStateContext = useContext(RoomStateContext);

  return (
    <div className="mt-5 flex flex-col gap-5">
      {roomStateContext.roomState.peers.map((peer) => (
        <div className="flex justify-between items-center gap-2">
          <div className="inline-flex gap-2">
            <img
              className="w-[25px] h-[25px] object-cover rounded-full"
              src={peer.avatar}
            />
            <h5>{peer.peerName}</h5>
          </div>

          <div className="flex items-center gap-2">
            <Icon
              icon={peer.peerVideo ? "bi:camera-video" : "bi:camera-video-off"}
            />

            <Icon
              icon={
                peer?.peerAudio ? "carbon:microphone" : "carbon:microphone-off"
              }
            />
          </div>
        </div>
      ))}
    </div>
  );
}
