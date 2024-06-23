import { useLayoutEffect, useRef, useState } from "react";
import "./MeetingVideoGrid.css";
import { Icon } from "@iconify-icon/react/dist/iconify.js";
import clsx from "clsx";
import MeetingVideoContainer from "./MeetingVideoContainer";

export default function MeetingVideoGrid({
  videosStreams,
  transformPerspective,
}: any) {
  const containerRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(videosStreams.length / itemsPerPage);

  const resizeVideos = () => {
    const container = containerRef.current as any;
    const videos = container.getElementsByClassName("video-container");

    // Get the width and height of the parent
    const containerWidth = container.clientWidth;
    const containerHeight = container.clientHeight;

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
      videos[i].style.width = `${videoWidth}px`;
      videos[i].style.height = `${videoHeight}px`;

      videos[i].style.setProperty("--video-width", `${videoWidth / 2}px`, "");
      videos[i].style.setProperty("--video-height", `${videoWidth / 2}px`, "");
    }
  };

  useLayoutEffect(() => {
    resizeVideos();
    window.addEventListener("resize", resizeVideos);

    return () => {
      window.removeEventListener("resize", resizeVideos);
    };
  }, [videosStreams, transformPerspective, currentPage]);

  useLayoutEffect(() => {
    const resizeObserver = new ResizeObserver(resizeVideos);
    const container = containerRef.current as any;
    resizeObserver.observe(container);

    return () => {
      resizeObserver.unobserve(container);
    };
  }, []);

  const currentVideosStreams = videosStreams.slice(
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
      {currentVideosStreams.map((videoStream: any) => (
        <MeetingVideoContainer
          data-fullName="Sylvernus Akubo"
          videoStream={videoStream}
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
