import * as yup from "yup";
import { useFormik } from "formik";
import { useParams } from "react-router-dom";
import { Icon } from "@iconify-icon/react/dist/iconify.js";

import useMeeting from "../../hooks/useMeeting";
import MeetingVideoContainer from "../../features/meeting/MeetingVideoContainer";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { getGravatarUrl } from "../../utils/string.utils";

export default function MeetingLobby() {
  const { id } = useParams<{ id: string }>() as { id: string };

  const [stream, setStream] = useState<MediaStream>();
  const { join, getLocalStream } = useMeeting(id);

  const formik = useFormik({
    initialValues: {
      peerName: "",
      peerVideo: true,
      peerAudio: true,
      avatar: getGravatarUrl(),
      userAgent: navigator.userAgent,
    },
    validationSchema: yup.object({
      peerName: yup.string().required(),
      peerVideo: yup.boolean().required(),
      peerAudio: yup.boolean().required(),
    }),

    onSubmit: async (values) => {
      try {
        join({
          userAgent: values.userAgent,
          channelPassword: "",
          peerName: values?.peerName,
          peerGender: "",
          avatar: values.avatar,
          peerVideo: values.peerVideo,
          peerAudio: values.peerAudio,
          peerRaisedHand: false,
          peerScreenRecord: false,
          peerScreenShare: false,
        });
      } catch (error) {
        toast.error("Something went wrong");
      }
    },
  });

  const toggleCamera = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks
    if (stream !== undefined) {
      stream.getVideoTracks()[0].enabled = !stream.getVideoTracks()[0].enabled;

      formik.setFieldValue("peerVideo", !!stream.getVideoTracks()[0].enabled);
    }
  };

  const toggleAudio = () => {
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getAudioTracks
    if (stream !== undefined) {
      stream.getAudioTracks()[0].enabled = !stream.getAudioTracks()[0].enabled;

      formik.setFieldValue("peerAudio", !!stream.getAudioTracks()[0].enabled);
    }
  };

  const mainActions = useMemo(
    () => [
      {
        title: `${formik.values.peerAudio ? "Off Mic" : "On Mic"}`,
        onClick: toggleAudio,
        icon: `${
          formik.values.peerAudio
            ? "carbon:microphone"
            : "carbon:microphone-off"
        }`,
      },
      {
        title: `${formik.values.peerVideo ? "Off Camera" : "On Camera"}`,
        onClick: toggleCamera,
        icon: `${
          formik.values.peerVideo ? "bi:camera-video" : "bi:camera-video-off"
        }`,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stream, formik.values.peerAudio, formik.values.peerVideo]
  );

  useEffect(() => {
    getLocalStream((stream) => {
      setStream(stream);
    });
  }, []);

  return (
    <div className="container max-w-6xl mx-auto h-[100vh] flex items-center">
      <div className="flex md:flex-row flex-col gap-2 h-full w-full max-h-[450px] mx-4">
        <div className="w-full md:w-[60%] h-full flex items-center flex-col justify-center relative">
          <MeetingVideoContainer
            className="w-full h-[450px]"
            name={formik.values.peerName}
            audioTrack={stream?.getAudioTracks()?.[0] || null}
            videoTrack={stream?.getVideoTracks()?.[0] || null}
            avatar={formik.values.avatar}
            mic={formik.values.peerAudio}
            isMe={true}
            camera={formik.values.peerVideo}
          />
          <div className="flex justify-between gap-5 mt-2 absolute bottom-3">
            {mainActions?.map((action, index) => (
              <button
                disabled={!stream}
                className={"icon-button"}
                key={index}
                onClick={action.onClick}
              >
                <Icon icon={action?.icon} />
              </button>
            ))}
          </div>
        </div>

        <form
          onSubmit={formik.handleSubmit}
          className="w-full md:w-[40%] flex flex-col gap-4 items-center justify-center h-full py-5"
        >
          <input
            required
            type="text"
            id="peerName"
            name="peerName"
            value={formik.values.peerName}
            onChange={formik.handleChange}
            className="text-input"
            placeholder="name"
          />
          <button disabled={!stream} type="submit" className="button">
            <Icon
              icon="icon-park-solid:video-conference"
              style={{ color: "black" }}
            />{" "}
            Start Meeting
          </button>
        </form>
      </div>
    </div>
  );
}
