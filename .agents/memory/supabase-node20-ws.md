---
name: Supabase Node 20 WebSocket
description: Fix for Supabase JS v2 crashing on startup in Node 20 due to missing native WebSocket
---

Node 20 does not have native WebSocket support. `@supabase/realtime-js` throws on `createClient` import unless a WebSocket constructor is provided.

**Fix:**
```typescript
import ws from "ws";
const realtimeOpts = { transport: ws } as any;
export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  realtime: realtimeOpts,
});
```

**Why:** `@supabase/realtime-js` calls `WebSocketFactory.getWebSocketConstructor()` at client creation time. In Node 20, this throws before the app server even starts.

**How to apply:** Every `createClient` call in `artifacts/api-server/src/lib/supabase.ts` must include `realtime: realtimeOpts`. The `ws` package must be in the api-server's dependencies.
