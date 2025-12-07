import * as dotenv from "dotenv";

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

  get tavilyApiKey() {
    return this.get("TAVILY_API_KEY");
  }

  get googleApiKey() {
    return this.get("GOOGLE_API_KEY");
  }

  get openRouterApiKey() {
    return this.get("OPEN_ROUTER_API_KEY");
  }
}

export default new Config();
