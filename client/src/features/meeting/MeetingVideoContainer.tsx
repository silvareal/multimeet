import clsx from "clsx";
import { useEffect, useRef } from "react";

type MeetingVideoContainerProps = {
  name?: string;
  videoStream?: MediaStream;
  className?: string;
  mute?: boolean;
  avatar: string;
  mic: boolean;
  camera: boolean;
};
export default function MeetingVideoContainer(
  props: MeetingVideoContainerProps
) {
  const { videoStream, avatar, mute, camera, mic, name, className, ...rest } =
    props;
  const refVideo = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (videoStream) {
      if (!refVideo.current) return;
      refVideo.current.srcObject = videoStream;
      refVideo.current.autoplay = true;
    }
  }, [videoStream]);

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
        "video-container w-full"
      )}
    >
      <div>
        <div></div>
        <div></div>
      </div>
      {/* <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRXxfn1j1vKFy8yJeBGl2AS6Dcah-lKgHofg&s" /> */}
      <video
        className={clsx(!camera && "z-[-1]")}
        muted={mute}
        autoPlay
        playsInline
        ref={refVideo}
      />
    </div>
  );
}
