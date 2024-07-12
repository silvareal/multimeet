import clsx from "clsx";
import { useEffect, useRef } from "react";

type MeetingVideoContainerProps = {
  name?: string;
  audioTrack: MediaStreamTrack | null;
  videoTrack: MediaStreamTrack | null;
  className?: string;
  mute?: boolean;
  avatar: string;
  mic: boolean;
  camera: boolean;
};
export default function MeetingVideoContainer(
  props: MeetingVideoContainerProps
) {
  const {
    audioTrack,
    videoTrack,
    avatar,
    mute,
    camera,
    mic,
    name,
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
      <div>
        <div></div>
        <div></div>
      </div>
      <audio ref={refAudio} autoPlay muted={mute} controls={false} />

      {/* <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRXxfn1j1vKFy8yJeBGl2AS6Dcah-lKgHofg&s" /> */}
      <video
        className={clsx(!camera && "z-[-1] aspect-video w-full")}
        muted={mute}
        autoPlay
        playsInline
        ref={refVideo}
      />
    </div>
  );
}
