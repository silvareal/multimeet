import clsx from "clsx";

export default function MeetingVideoContainer(props: any) {
  const { videoStream, className, ...rest } = props;
  return (
    <div {...rest} className={clsx(className, "video-container w-full")}>
      <div>
        <div></div>
        <div></div>
      </div>
      <video autoPlay loop src={videoStream} />
    </div>
  );
}
