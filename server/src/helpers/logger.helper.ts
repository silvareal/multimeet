import winston, { format } from "winston";
const { combine, timestamp, prettyPrint } = format;

const logger = winston.createLogger({
  level: "info",
  format: combine(prettyPrint()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        // format.splat(),
        winston.format.simple()
      ),
    }),
  ],
});

//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
// if (process.env.NODE_ENV !== "production") {
//   logger.add(
//     new winston.transports.Console({
//       format: winston.format.simple(),
//     })
//   );
// }

export default logger;
