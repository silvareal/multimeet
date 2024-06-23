import { Icon } from "@iconify-icon/react/dist/iconify.js";
import MeetingVideoContainer from "../../features/meeting/MeetingVideoContainer";

export default function MeetingGetStarted() {
  return (
    <div className="container max-w-6xl mx-auto h-[100vh] flex items-center">
      <div className="flex md:flex-row flex-col gap-2 h-full w-full max-h-[450px] mx-4">
        <div className="w-full md:w-[60%] h-full flex items-center flex-col justify-center relative">
          <MeetingVideoContainer
            className="w-full h-[450px] "
            videoStream="https://alicunde.github.io/Videoconference-Dish-CSS-JS/videos/demo.mp4"
          />
          <div className="flex justify-between gap-5 mt-2 absolute bottom-3">
            <button className="icon-button">
              <Icon icon="typcn:microphone" />
            </button>
            <button className="icon-button">
              <Icon icon="fa6-solid:video" />
            </button>
          </div>
        </div>
        <div className="w-full md:w-[40%] flex flex-col gap-4 items-center justify-center h-full py-5">
          <input className="text-input" placeholder="name" />
          <button className="button">
            <Icon
              icon="icon-park-solid:video-conference"
              style={{ color: "black" }}
            />{" "}
            Start Meeting
          </button>
        </div>
      </div>
    </div>
  );
}
