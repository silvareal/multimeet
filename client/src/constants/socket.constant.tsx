import { io } from "socket.io-client";
import { BASE_URL } from "./env.constant";

export const roomSocket = io(`${BASE_URL}/rooms`, { forceNew: false });
