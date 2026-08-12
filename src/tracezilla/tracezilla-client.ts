import type { Configuration } from "../configuration.js";
import { fetchJson } from "../shared/http.js";

export class TracezillaClient {
  constructor(private readonly configuration: Configuration) {}

  async get(path: string, query: Record<string, string | number>): Promise<unknown> {
    const url = new URL(`${this.configuration.tracezillaBaseUrl}/api/v1/${this.configuration.tracezillaTeamSlug}/${path.replace(/^\//, "")}`);
    for (const [key, value] of Object.entries(query)) url.searchParams.set(key, String(value));
    const { payload } = await fetchJson(
      url.toString(),
      { headers: { Accept: "application/json", Authorization: `Bearer ${this.configuration.tracezillaApiKey}` } },
      this.configuration.timeoutMs,
      "tracezilla",
    );
    return payload;
  }
}
