import * as dotenv from "dotenv";
import { Environment } from "./enums/env.enum";

class Config {
  constructor() {
    dotenv.config({
      path: `.env`,
    });
  }

  public get(key: string): string {
    if (!process.env[key]) {
      throw new Error(`Configuration error: ${key} is not set or is empty`);
    }
    return process.env[key];
  }

  public getNumber(key: string): number {
    return Number(this.get(key));
  }

  get environment() {
    return this.get("ENVIRONMENT") as Environment;
  }

  get tavilyApiKey() {
    return this.get("TAVILY_API_KEY");
  }

  get googleApiKey() {
    return this.get("GOOGLE_API_KEY");
  }

  get openRouterApiKey() {
    return this.get("OPEN_ROUTER_API_KEY");
  }

  get otlpEndpoint() {
    return this.get("OTEL_EXPORTER_OTLP_ENDPOINT");
  }

  get otelServiceName() {
    return this.get("OTEL_SERVICE_NAME");
  }

  get otelServiceVersion() {
    return this.get("OTEL_SERVICE_VERSION");
  }
}

export default new Config();
