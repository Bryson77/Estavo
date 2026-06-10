---
name: Expo on Replit setup
description: Steps to properly register and present the Expo artifact as a mobile frame, avoiding the "shows as website" pitfall
---

## The problem
If the Expo artifact was created manually (not via `createArtifact()`), `listArtifacts()` returns empty and `presentArtifact()` fails.  Also, having a custom workflow (e.g. "Start application") with `outputType: "webview"` on the same port causes Replit to show the app as a full-screen website rather than a mobile frame.

## Fix sequence
1. Write the exact current `artifact.toml` content to a sibling `.replit-artifact/artifact.edit.toml`.
2. Call `verifyAndReplaceArtifactToml()` — this re-registers the artifact with the platform.
3. Remove any manually created conflicting workflow (`removeWorkflow({ name: "..." })`).
4. Restart `artifacts/resident: expo` (the artifact's own workflow now has sole ownership of port 22823).
5. Call `presentArtifact({ artifactId: "artifacts/resident" })`.

**Why:** The Replit artifact system tracks registrations separately from file presence. Re-running `verifyAndReplaceArtifactToml` triggers re-registration. A conflicting webview workflow on the same port will always win the port race and prevent the artifact workflow from starting.

## CORS for API calls from Expo web
Expo web runs at `expo.worf.replit.dev`, the API at `worf.replit.dev` — different origins.  
Use `cors({ origin: true, credentials: true, methods: [...], allowedHeaders: [...] })` in Express (not `cors()` with no options, which also works but `origin: true` is explicit).

## Dev login credentials
- Email: `thandi@estatehq.app`
- OTP bypass: `123456` (when `NODE_ENV=development`)

## Remaining known warnings (from deps, not our code)
- `props.pointerEvents is deprecated` — from expo-router internals, cannot be fixed in app code.
