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

  async post(path: string, payload: Record<string, unknown>): Promise<unknown> {
    const url = `${this.configuration.tracezillaBaseUrl}/api/v1/${this.configuration.tracezillaTeamSlug}/${path.replace(/^\//, "")}`;
    const response = await fetchJson(url, { method: "POST", headers: { Accept: "application/json", Authorization: `Bearer ${this.configuration.tracezillaApiKey}`, "Content-Type": "application/json" }, body: JSON.stringify(payload) }, this.configuration.timeoutMs, "tracezilla");
    return response.payload;
  }
}
