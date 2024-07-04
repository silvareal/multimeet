import { useContext, useState } from "react";
import "./Meeting.css";
import clsx from "clsx";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

import MeetingLobby from "./MeetingLobby.tsx";
import MeetingDetails from "../../features/meeting/MeetingDetails";
import { RoomStateContext } from "providers/RoomProvider.tsx";
import MeetingDetailsVideoGrid from "../../features/meeting/MeetingVideoGrid";

export default function Meeting() {
  const [videosStreams] = useState([]);
  const roomStateContext = useContext(RoomStateContext);
  const [transformPerspective, setTransformPerspective] = useState(false);

  return (
    <div>
      {!roomStateContext.roomState.authPeer ? (
        <MeetingLobby />
      ) : (
        <div className="meeting-container">
          <div className="w-full">
            <div
              className={clsx(
                "perspective-container",
                transformPerspective && "perspective-container--modalview"
              )}
            >
              <div className="perspective-item">
                <div className="flex flex-col h-full">
                  <div className="w-full h-full flex justify-center items-center">
                    <MeetingDetailsVideoGrid
                      videosStreams={videosStreams}
                      transformPerspective={transformPerspective}
                    />
                  </div>
                  <div className="flex w-full justify-between gap-2 mt-4">
                    <div>
                      <button className="icon-button">
                        <Icon icon="solar:copy-bold" />
                      </button>
                    </div>
                    <div className="flex justify-between gap-3">
                      <button className="icon-button">
                        <Icon icon="typcn:microphone" />
                      </button>
                      <button className="icon-button">
                        <Icon icon="fa6-solid:video" />
                      </button>
                      <button className="icon-button">
                        <Icon icon="solar:end-call-rounded-bold" />
                      </button>
                    </div>
                    <div>
                      <button
                        onClick={() => setTransformPerspective((prev) => !prev)}
                        className="icon-button"
                      >
                        <Icon icon="solar:chat-dots-bold" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <MeetingDetails
            transformPerspective={transformPerspective}
            setTransformPerspective={setTransformPerspective}
          />
        </div>
      )}
    </div>
  );
}
