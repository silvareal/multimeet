import { video } from "./video.socket";

export default function listen(io: any) {
  // video meet io namespace
  video(io);
}
