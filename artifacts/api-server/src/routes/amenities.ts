import { Router } from "express";
import { requireAuth } from "../lib/auth.js";

// TODO: Amenities routes are not yet implemented for the Supabase schema.
// The amenities and amenity_bookings tables do not yet exist in the live
// Supabase project. These will be designed and implemented in a follow-up session.

const router = Router();

router.get("/amenities", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet", amenities: [] });
});

router.get("/amenities/my-bookings", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet", bookings: [] });
});

router.post("/amenities/book", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet" });
});

router.delete("/amenities/bookings/:id", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet" });
});

export default router;
