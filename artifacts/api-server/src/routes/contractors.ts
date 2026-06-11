import { Router } from "express";
import { requireAuth } from "../lib/auth.js";

// TODO: Contractors route is not yet implemented for the Supabase schema.
// The contractors table does not yet exist in the live Supabase project.
// This will be designed and implemented in a follow-up session.

const router = Router();

router.get("/contractors", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet", contractors: [] });
});

export default router;
