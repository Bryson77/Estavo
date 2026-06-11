import { Router } from "express";
import { requireAuth } from "../lib/auth.js";

// TODO: Reports routes are not yet implemented for the Supabase schema.
// The `maintenance_requests` table exists in the live Supabase project and is
// the likely target for this feature — wire up in a follow-up session once
// the schema and RLS policies have been confirmed.

const router = Router();

router.get("/reports", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet", reports: [], open: 0, inProgress: 0, resolved: 0 });
});

router.get("/reports/:id", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet" });
});

router.post("/reports", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet" });
});

export default router;
