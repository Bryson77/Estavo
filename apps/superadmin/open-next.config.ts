import type { OpenNextConfig } from "opennextjs-cloudflare";
import defaultCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";

const config = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      incrementalCache: () => defaultCache,
      tagCache: "dummy",
      queue: "dummy",
    },
  },
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
    },
  },
} satisfies OpenNextConfig;

export default config;
