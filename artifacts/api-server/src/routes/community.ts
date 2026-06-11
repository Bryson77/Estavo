import { Router } from "express";
import { requireAuth } from "../lib/auth.js";

// TODO: Community routes are not yet implemented for the Supabase schema.
// The community_posts, community_events, event_rsvps, and management_broadcasts
// tables do not yet exist in the live Supabase project.
// These will be designed and implemented in a follow-up session.
// Note: a `notices` table may be a candidate for management_broadcasts.

const router = Router();

router.get("/community/posts", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet", posts: [] });
});

router.post("/community/posts", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet" });
});

router.get("/community/events", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet", events: [] });
});

router.post("/community/events/:id/rsvp", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet" });
});

router.get("/community/broadcasts", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet", broadcasts: [], unread: 0 });
});

router.patch("/community/broadcasts/:id/read", requireAuth, (_req, res) => {
  res.status(501).json({ error: "Not implemented yet" });
});

export default router;
