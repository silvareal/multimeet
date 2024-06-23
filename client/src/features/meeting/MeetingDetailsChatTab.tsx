import React from "react";
import "./MeetingDetailsChatTab.css";
import clsx from "clsx";
import { format } from "date-fns";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

export default function MeetingDetailsChatTab() {
  return (
    <div className="overflow-scroll flex flex-col">
      <div className="h-full overflow-scroll relative flex flex-col mt-1 scroll-smooth">
        {messages.map((message) => (
          <div
            className={clsx(
              "message-preview",
              message.me
                ? "message-preview--sender"
                : "message-preview--receiver",
              "my-1"
            )}
          >
            <div className="message-preview__detail">
              <div
                className={clsx(
                  "message-preview__detail-name",
                  message.me
                    ? "message-preview__detail-name--sender"
                    : "message-preview__detail-name--receiver"
                )}
              >
                <p className="capitalize font-light">
                  {message.me ? "You" : message.name}
                </p>
                <p className="text-[#63676a] text-xs">
                  {format(new Date().toISOString(), "p")}
                </p>
              </div>

              <div
                className={clsx(
                  "message-preview__detail-text",
                  message.me
                    ? "message-preview__detail-text--sender"
                    : "message-preview__detail-text--receiver"
                )}
              >
                <p className="break-words " style={{ wordBreak: "break-word" }}>
                  {message.message}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="h-[50px] w-full">
        <div className="w-full h-[2px] bg-[#1b1a1d] my-1"></div>
        <div className="flex justify-between">
          <input
            className="bg-transparent w-full outline-none text-sm"
            placeholder="Type message here"
          />
          <button className="icon-button ">
            <Icon icon="iconamoon:send-fill" />
          </button>
        </div>
      </div>
    </div>
  );
}

const messages = [
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
  { me: false, name: "Akubo", message: "tesing things" },
  { me: true, name: "sylvernus", message: "tesing things" },
];
