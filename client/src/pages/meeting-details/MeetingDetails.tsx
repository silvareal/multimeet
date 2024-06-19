import React from "react";
import "./MeetingDetails.css";

export default function MeetingDetails() {
  return (
    <div className="perspective perspective--modalview">
      <div className="meeting-container">
        <div className="bg-red-500 w-[80%]">meeting box</div>
        <div className="bg-red-500 w-[20%]">chatbox</div>
      </div>
    </div>
  );
}
