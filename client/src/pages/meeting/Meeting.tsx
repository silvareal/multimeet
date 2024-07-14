import { useContext, useEffect, useMemo, useState } from "react";
import "./Meeting.css";
import clsx from "clsx";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

import MeetingLobby from "./MeetingLobby.tsx";
import MeetingDetails from "../../features/meeting/MeetingDetails";
import { RoomStateContext } from "providers/RoomProvider.tsx";
import MeetingDetailsVideoGrid from "../../features/meeting/MeetingVideoGrid";
import useMeeting from "hooks/useMeeting.tsx";
import { useNavigate, useParams } from "react-router-dom";
import useClipboard from "hooks/useClipboard.tsx";

export default function Meeting() {
  const { id } = useParams<{ id: string }>() as { id: string };
  const navigate = useNavigate();

  const roomStateContext = useContext(RoomStateContext);
  const [transformPerspective, setTransformPerspective] = useState(false);
  const { muteWebcam, unmuteWebcam, unmuteMic, muteMic, close } =
    useMeeting(id);
  const meetingLinkClipboard = useClipboard();

  const handleToggleWebCam = () => {
    roomStateContext.roomState.authPeer?.peerVideo
      ? muteWebcam()
      : unmuteWebcam();
  };

  const handleToggleMic = () => {
    roomStateContext.roomState.authPeer?.peerAudio ? muteMic() : unmuteMic();
  };

  const handleEnd = () => {
    close();
    navigate("/");
  };

  const handleCopyMeetingLink = () => [
    meetingLinkClipboard.writeText(`${window.location.origin}/${id}`),
  ];

  const mainActions = useMemo(
    () => [
      {
        title: `${
          roomStateContext.roomState.authPeer?.peerAudio ? "Off Mic" : "On Mic"
        }`,
        onClick: handleToggleMic,
        icon: `${
          roomStateContext.roomState.authPeer?.peerAudio
            ? "carbon:microphone"
            : "carbon:microphone-off"
        }`,
      },
      {
        title: `${
          roomStateContext.roomState.authPeer?.peerVideo
            ? "Off Camera"
            : "On Camera"
        }`,
        onClick: handleToggleWebCam,
        icon: `${
          roomStateContext.roomState.authPeer?.peerVideo
            ? "bi:camera-video"
            : "bi:camera-video-off"
        }`,
      },
      {
        title: `End Call`,
        onClick: handleEnd,
        icon: "solar:end-call-rounded-bold",
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roomStateContext.roomState]
  );

  useEffect(() => {
    return () => {
      close();
    };
  }, []);

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
                  <div
                    className="w-full h-full flex justify-center items-center"
                    style={{ height: "calc(100vh - 70px)" }}
                  >
                    <MeetingDetailsVideoGrid
                      transformPerspective={transformPerspective}
                    />
                  </div>
                  <div className="flex w-full justify-between gap-2 mt-4">
                    <div>
                      <button
                        className="icon-button"
                        onClick={handleCopyMeetingLink}
                      >
                        <Icon icon="solar:copy-bold" />
                      </button>
                    </div>
                    <div className="flex justify-between gap-3">
                      {mainActions.map((action) => (
                        <button
                          onClick={action.onClick}
                          className="icon-button"
                        >
                          <Icon icon={action.icon} />
                        </button>
                      ))}
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
