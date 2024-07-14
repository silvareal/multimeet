import { Icon } from "@iconify-icon/react/dist/iconify.js";
import clsx from "clsx";
import VoicePitch from "common/VoicePitch";
import { useEffect, useRef } from "react";

type MeetingVideoContainerProps = {
  name?: string;
  audioTrack: MediaStreamTrack | null;
  videoTrack: MediaStreamTrack | null;
  className?: string;
  avatar: string;
  mic: boolean;
  camera: boolean;
  isMe?: boolean;
};

export default function MeetingVideoContainer(
  props: MeetingVideoContainerProps
) {
  const {
    audioTrack,
    videoTrack,
    avatar,
    camera,
    mic,
    name,
    isMe,
    className,
    ...rest
  } = props;
  const refVideo = useRef<HTMLVideoElement>(null);
  const refAudio = useRef<HTMLAudioElement>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoTrack) {
      if (!refVideo.current) return;
      const stream = new MediaStream([videoTrack]);

      refVideo.current.srcObject = stream;
    }

    if (audioTrack) {
      if (!refAudio.current) return;
      const stream = new MediaStream([audioTrack]);

      refAudio.current.srcObject = stream;
      refAudio.current?.play();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoTrack, audioTrack]);

  useEffect(() => {
    const container = containerRef.current;
    container?.style.setProperty("--video-avatar", `url(${avatar})`, "");
  }, []);

  return (
    <div
      {...rest}
      data-fullname={name}
      ref={containerRef}
      className={clsx(
        className && className,
        !camera && "video-off",
        "video-container w-full aspect-video"
      )}
    >
      <div className="absolute top-5 w-full z-10 px-5  flex justify-end gap-4">
        <VoicePitch audioTrack={audioTrack} />
        <div>
          <Icon
            className="bg-white text-black rounded-full p-1"
            icon={mic ? "carbon:microphone" : "carbon:microphone-off"}
          />
        </div>
      </div>

      <audio
        ref={refAudio}
        autoPlay
        muted={isMe ? true : mic}
        controls={false}
      />

      <video
        className={clsx(!camera && "z-[-1] aspect-video w-full")}
        muted={isMe ? true : mic}
        autoPlay
        playsInline
        ref={refVideo}
      />
    </div>
  );
}
