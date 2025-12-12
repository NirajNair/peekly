import { pino } from "pino";
import config from "../config";
import { Environment } from "../enums/env.enum";

export const logger = pino({
  level: "info",
  transport:
    config.environment === Environment.Dev
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
            sync: true,
            singleLine: true,
          },
        }
      : {
          target: "pino-opentelemetry-transport",
          options: {
            url: `${config.otlpEndpoint}/v1/logs`,
            headers: {},
            resourceAttributes: {
              "service.name": config.otelServiceName,
              "service.version": config.otelServiceVersion,
            },
            sync: true,
          },
        },
  base: {
    service: config.otelServiceName,
    version: config.otelServiceVersion,
    environment: config.environment,
  },
});
