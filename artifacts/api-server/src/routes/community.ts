import { Router } from "express";
import { db } from "@workspace/db";
import { communityPosts, communityEvents, eventRsvps, managementBroadcasts } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

router.get("/community/posts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const posts = await db
      .select()
      .from(communityPosts)
      .where(and(eq(communityPosts.estateId, req.user!.estateId), eq(communityPosts.status, "active")))
      .orderBy(desc(communityPosts.createdAt))
      .limit(50);

    const sanitized = posts.map(p => ({
      ...p,
      authorId: p.isAnonymous ? null : p.authorId,
    }));

    res.json({ posts: sanitized });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load posts" });
  }
});

const createPostSchema = z.object({
  content: z.string().min(1).max(1000),
  postType: z.enum(["general", "noise_complaint", "lost_found", "announcement"]).default("general"),
  isAnonymous: z.boolean().default(true),
  photoUrl: z.string().optional(),
});

router.post("/community/posts", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  try {
    const [post] = await db.insert(communityPosts).values({
      estateId: req.user!.estateId,
      authorId: req.user!.userId,
      content: parsed.data.content,
      postType: parsed.data.postType,
      isAnonymous: parsed.data.isAnonymous,
      photoUrl: parsed.data.photoUrl,
      status: "active",
    }).returning();

    res.status(201).json({ post });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create post" });
  }
});

router.get("/community/events", requireAuth, async (req: AuthRequest, res) => {
  try {
    const events = await db
      .select()
      .from(communityEvents)
      .where(and(eq(communityEvents.estateId, req.user!.estateId), eq(communityEvents.status, "active")))
      .orderBy(communityEvents.startsAt)
      .limit(30);

    const userRsvps = await db
      .select()
      .from(eventRsvps)
      .where(eq(eventRsvps.userId, req.user!.userId));

    const rsvpMap: Record<string, string> = {};
    userRsvps.forEach(r => { rsvpMap[r.eventId] = r.response; });

    const attendeeCounts = await db
      .select({ eventId: eventRsvps.eventId, count: sql<number>`count(*)` })
      .from(eventRsvps)
      .where(eq(eventRsvps.response, "yes"))
      .groupBy(eventRsvps.eventId);

    const countMap: Record<string, number> = {};
    attendeeCounts.forEach(c => { countMap[c.eventId] = Number(c.count); });

    const eventsWithData = events.map(e => ({
      ...e,
      userRsvp: rsvpMap[e.id] ?? null,
      attendeeCount: countMap[e.id] ?? 0,
    }));

    res.json({ events: eventsWithData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load events" });
  }
});

const rsvpSchema = z.object({
  response: z.enum(["yes", "no", "maybe"]),
  guestCount: z.number().default(0),
});

router.post("/community/events/:id/rsvp", requireAuth, async (req: AuthRequest, res) => {
  const parsed = rsvpSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  try {
    const existing = await db.query.eventRsvps.findFirst({
      where: and(eq(eventRsvps.eventId, req.params.id), eq(eventRsvps.userId, req.user!.userId)),
    });

    if (existing) {
      await db.update(eventRsvps)
        .set({ response: parsed.data.response, guestCount: parsed.data.guestCount })
        .where(eq(eventRsvps.id, existing.id));
    } else {
      await db.insert(eventRsvps).values({
        eventId: req.params.id,
        userId: req.user!.userId,
        response: parsed.data.response,
        guestCount: parsed.data.guestCount,
      });
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to RSVP" });
  }
});

router.get("/community/broadcasts", requireAuth, async (req: AuthRequest, res) => {
  try {
    const broadcasts = await db
      .select()
      .from(managementBroadcasts)
      .where(eq(managementBroadcasts.estateId, req.user!.estateId))
      .orderBy(desc(managementBroadcasts.createdAt))
      .limit(30);

    const unread = broadcasts.filter(b => !b.isRead).length;

    res.json({ broadcasts, unread });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load broadcasts" });
  }
});

router.patch("/community/broadcasts/:id/read", requireAuth, async (req: AuthRequest, res) => {
  try {
    await db.update(managementBroadcasts)
      .set({ isRead: true })
      .where(and(eq(managementBroadcasts.id, req.params.id), eq(managementBroadcasts.estateId, req.user!.estateId)));
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

export default router;
