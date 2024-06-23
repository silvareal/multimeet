import clsx from "clsx";
import useStepper from "../../hooks/useStepper";
import { Icon } from "@iconify-icon/react/dist/iconify.js";
import React from "react";
import MeetingDetailsChatTab from "./MeetingDetailsChatTab";
import MeetingParticipantsTab from "./MeetingParticipantsTab";

type MeetingDetailsProps = {
  setTransformPerspective: React.Dispatch<React.SetStateAction<boolean>>;
  transformPerspective: boolean;
};

export default function MeetingDetails(props: MeetingDetailsProps) {
  const { setTransformPerspective, transformPerspective } = props;
  const stepper = useStepper();

  const meetingDetailsTabs = [
    { name: "Chat", content: <MeetingDetailsChatTab /> },

    { name: "Participants", content: <MeetingParticipantsTab /> },
  ];

  return (
    <div
      className={clsx(
        "min-w-[350px] rounded-2xl bg-[#2b2d2e] h-full p-5 transition-all delay-700 text-[ #000000]",
        transformPerspective ? "overflow-hidden flex flex-col" : "hidden"
      )}
    >
      <div className="flex justify-between gap-2 text-white">
        <h3>Meeting Details</h3>

        <button
          onClick={() => setTransformPerspective((prev) => !prev)}
          className="outline-none rounded-full text-2xl"
        >
          <Icon icon="iconoir:cancel" />
        </button>
      </div>

      <div className="w-full  rounded-lg transition-all mt-5">
        <div className="relative right-0">
          <ul
            className="relative bg-[#1b1a1d] flex flex-wrap p-1 list-none rounded-lg bg-blue-gray-50/60"
            data-tabs="tabs"
            role="list"
          >
            {meetingDetailsTabs?.map(({ name }, i) => (
              <li className="z-30 flex-auto text-center">
                <a
                  className={clsx(
                    stepper.step === i && "bg-secondary-main ",
                    "text-secondary-light z-30 flex items-center justify-center w-full px-0 py-1 mb-0 transition-all ease-in-out border-0 rounded-lg cursor-pointer  bg-inherit"
                  )}
                  onClick={() => stepper.setStep(i)}
                  data-tab-target=""
                  role="tab"
                  aria-selected="true"
                >
                  <span
                    className={clsx(
                      stepper.step === i
                        ? "text-black"
                        : "text-secondary-light",
                      "ml-1"
                    )}
                  >
                    {name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {meetingDetailsTabs[stepper.step].content}
    </div>
  );
}
