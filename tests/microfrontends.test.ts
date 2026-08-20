import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const configPath = fileURLToPath(new URL("../microfrontends.json", import.meta.url));

describe("microfrontends route boundary", () => {
  it("keeps Air landing as the default and backend paths explicitly allowlisted", () => {
    const config = JSON.parse(readFileSync(configPath, "utf8")) as {
      applications: Record<string, { routing?: Array<{ paths: string[] }> }>;
    };

    expect(config.applications["air-landing"]).toEqual({});
    expect(config.applications.air?.routing).toEqual([
      {
        paths: [
          "/healthz",
          "/webhooks/imessage",
          "/internal/drain-inbox",
          "/internal/provider-audit",
          "/internal/readiness",
          "/internal/release-fence",
          "/internal/inbox-fifo-migration",
        ],
      },
    ]);
  });
});
