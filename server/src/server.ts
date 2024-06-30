/*
http://patorjk.com/software/taag/#p=display&f=ANSI%20Regular&t=multimeet
                  _ _   _                     _   
                 | | | (_)                   | |  
  _ __ ___  _   _| | |_ _ _ __ ___   ___  ___| |_ 
 | '_ ` _ \| | | | | __| | '_ ` _ \ / _ \/ _ \ __|
 | | | | | | |_| | | |_| | | | | | |  __/  __/ |_ 
 |_| |_| |_|\__,_|_|\__|_|_| |_| |_|\___|\___|\__|
                                                                                  
/**
 * Multimeet- Server component
 *
 * @link    GitHub: https://github.com/silvareal/multimeet
 * @link    Live demo: multimeet.live
 * @license For open source use: AGPLv3
 * @license For commercial or closed source, akubosylvernus@gmail.com
 * @author  Sylvernus Akubo- akubosylvernus@gmail.com
 * @version 1.0.1
 *
 */

import http from "http";
import { Server } from "socket.io";
import * as dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import

import app from "./app";
import sockets from "./sockets";

dotenv.config();

const PORT = process.env.SERVER_PORT || 9000;

const server = http.createServer(app);
const socketServer = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

async function startServer() {
  server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
  sockets(socketServer);
}

startServer();
