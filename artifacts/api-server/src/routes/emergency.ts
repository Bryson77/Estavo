import { Router } from "express";
import { requireAuth } from "../lib/auth.js";

// TODO: Emergency routes are not yet implemented for the Supabase schema.
// The `incidents` table exists in the live Supabase project and is the
// likely target for this feature — wire up in a follow-up session once
// the schema and RLS policies have been confirmed.

const router = Router();

router.post("/emergency", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet" });
});

router.get("/emergency/history", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet", alerts: [] });
});

export default router;
