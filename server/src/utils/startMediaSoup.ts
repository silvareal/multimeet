import * as mediasoup from "mediasoup";

import { config } from "../config/medisoup.config";
import { Worker } from "mediasoup/node/lib/Worker";
import { Router } from "mediasoup/node/lib/Router";
import logger from "../helpers/logger.helper";
import { MediasoupWorker } from "../types/room.type";

export async function startMediasoup() {
  const workers: Array<MediasoupWorker> = [];

  for (let i = 0; i < config.mediasoup.numWorkers; i++) {
    let worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.worker.logLevel,
      logTags: config.mediasoup.worker.logTags,
      rtcMinPort: config.mediasoup.worker.rtcMinPort,
      rtcMaxPort: config.mediasoup.worker.rtcMaxPort,
    });

    worker.on("died", () => {
      logger.error("mediasoup worker died (this should never happen)");
      process.exit(1);
    });

    const mediaCodecs = config.mediasoup.router.mediaCodecs;
    const router = await worker.createRouter({ mediaCodecs });
    workers.push({ worker, router });

    // Log worker resource usage every X seconds.
    // setInterval(async () => {
    //   const usage = await worker.getResourceUsage();

    //   logger.info(
    //     "mediasoup Worker resource usage [pid:%d]: %o",
    //     worker.pid,
    //     usage
    //   );

    //   const dump = await worker.dump();

    //   logger.info("mediasoup Worker dump [pid:%d]: %o", worker.pid, dump);
    // }, 120000);
  }

  return workers;
}
