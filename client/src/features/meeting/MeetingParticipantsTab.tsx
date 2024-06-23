import { Icon } from "@iconify-icon/react/dist/iconify.js";
import React from "react";

export default function MeetingParticipantsTab() {
  const participants = [
    {
      name: "Sylvernus Akubo (You)",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRXxfn1j1vKFy8yJeBGl2AS6Dcah-lKgHofg&s",
    },
    {
      name: "Sylvernus Akubo",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRXxfn1j1vKFy8yJeBGl2AS6Dcah-lKgHofg&s",
    },
    {
      name: "Sylvernus Akubo",
      img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQRXxfn1j1vKFy8yJeBGl2AS6Dcah-lKgHofg&s",
    },
  ];
  return (
    <div className="mt-5 flex flex-col gap-5">
      {participants.map((participant) => (
        <div className="flex justify-between items-center gap-2">
          <div className="inline-flex gap-2">
            <img
              className="w-[25px] h-[25px] object-cover rounded-full"
              src={participant.img}
            />
            <h5>{participant.name}</h5>
          </div>

          <Icon icon="ion:mic-circle" />
        </div>
      ))}
    </div>
  );
}
