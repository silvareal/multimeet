import clsx from "clsx";
import { useContext, useLayoutEffect, useRef, useState } from "react";
import { Consumer } from "mediasoup-client/lib/Consumer";
import { Producer } from "mediasoup-client/lib/Producer";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

import "./MeetingVideoGrid.css";
import MeetingVideoContainer from "./MeetingVideoContainer";
import { RoomStateContext } from "providers/RoomProvider";
import { MediaType, PeerInfo } from "types/room.type";

export default function MeetingVideoGrid({ transformPerspective }: any) {
  const containerRef = useRef<HTMLDivElement>(null);
  const roomStateContext = useContext(RoomStateContext);

  const otherPeers = roomStateContext.roomState.peers.map((peer) => ({
    peer,
    isMe: false,
    consumers: roomStateContext.roomState.consumers.filter(
      (consumer) => consumer.appData.peerId === peer.id
    ),
  }));
  console.log({ otherPeers });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mediaTracks: any = [
    {
      peer: roomStateContext.roomState.authPeer,
      isMe: true,
      producers: roomStateContext.roomState.producers || [],
    },
    ...otherPeers,
  ];

  console.log({ roomStateContext });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(mediaTracks.length / itemsPerPage);

  const resizeVideos = () => {
    const container = containerRef.current;
    const videos = container?.getElementsByClassName("video-container");
    if (videos) {
      // Get the width and height of the parent
      const containerWidth = container?.clientWidth || 0;
      const containerHeight = container?.clientHeight || 0;

      // Determine the number of rows and columns based on the number of videos
      const numVideos = videos.length;
      let rows = Math.ceil(Math.sqrt(numVideos));
      let cols = Math.ceil(numVideos / rows);

      // If the container is wider than it is tall, switch rows and columns
      if (containerWidth > containerHeight) {
        [rows, cols] = [cols, rows];
      }

      // Calculate the width and height of each video
      const videoWidth = (containerWidth - (cols - 1) * 10) / cols;
      const videoHeight = (containerHeight - (rows - 1) * 10) / rows;

      // Set the width and height of each video
      for (let i = 0; i < videos.length; i++) {
        const video = videos[i] as any;
        video.style.width = `${videoWidth}px`;
        video.style.height = `${videoHeight}px`;

        video.style.setProperty("--video-width", `${videoWidth / 2}px`, "");
        video.style.setProperty("--video-height", `${videoWidth / 2}px`, "");
      }
    }
  };

  useLayoutEffect(() => {
    resizeVideos();
    window.addEventListener("resize", resizeVideos);

    return () => {
      window.removeEventListener("resize", resizeVideos);
    };
  }, [mediaTracks, transformPerspective, currentPage]);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(resizeVideos);
    const container = containerRef.current as any;
    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  const currentVideosStreams: {
    peer: PeerInfo;
    isMe: false;
    consumers: Consumer[] | undefined;
    producers: Producer[] | undefined;
  }[] = mediaTracks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleNextPage = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage((prev) => prev - 1);
  };

  const isLastPage = totalPages === currentPage;
  const isFirstPage = currentPage === 1;

  return (
    <div
      ref={containerRef}
      className="h-full w-full flex justify-center items-center flex-wrap gap-2"
    >
      {currentVideosStreams.map((mediaTracks) => (
        <MeetingVideoContainer
          data-fullName={mediaTracks?.peer?.peerName}
          videoTrack={
            (mediaTracks?.isMe
              ? mediaTracks?.producers?.find(
                  (producer) => producer?.appData?.mediaType === MediaType.VIDEO
                )?.track
              : mediaTracks?.consumers?.find(
                  (consumer) => consumer.kind === MediaType.VIDEO
                )?.track) || null
          }
          audioTrack={
            (mediaTracks?.isMe
              ? mediaTracks?.producers?.find(
                  (producer) => producer?.appData?.mediaTyp === MediaType.AUDIO
                )?.track
              : mediaTracks?.consumers?.find(
                  (consumer) => consumer.kind === MediaType.AUDIO
                )?.track) || null
          }
          isMe={mediaTracks?.isMe}
          avatar={mediaTracks?.peer?.avatar || ""}
          mic={mediaTracks?.peer?.peerAudio}
          camera={mediaTracks?.peer?.peerVideo || false}
        />
      ))}

      {totalPages > 1 && (
        <div className="absolute w-full flex justify-between top h-20 px-5">
          <div>
            <button
              className={clsx("icon-button", isFirstPage && "!hidden")}
              onClick={handlePreviousPage}
            >
              <Icon icon="line-md:arrow-left" />
            </button>
          </div>

          <div>
            <button
              className={clsx("icon-button", isLastPage && "!hidden")}
              onClick={handleNextPage}
            >
              <Icon icon="line-md:arrow-right" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
