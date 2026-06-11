import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

// GET /community/posts
router.get("/community/posts", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, userId } = req.user!;
  try {
    const { data: rows, error } = await req.supabaseClient!
      .from("community_posts")
      .select("*, community_post_reactions(reaction_type, user_id), community_post_comments(id)")
      .eq("estate_id", estateId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) { res.status(500).json({ error: "Failed to load posts" }); return; }

    const posts = (rows ?? []).map(row => {
      const reactions = (row.community_post_reactions ?? []) as Array<{ reaction_type: string; user_id: string }>;
      const likeCount = reactions.filter(r => r.reaction_type === "like").length;
      const userLiked = reactions.some(r => r.reaction_type === "like" && r.user_id === userId);
      return {
        id: row.id,
        content: row.content,
        isAnonymous: row.is_anonymous,
        postType: row.post_type,
        authorName: row.is_anonymous ? "Anonymous" : row.author_name,
        likeCount,
        userLiked,
        commentCount: (row.community_post_comments ?? []).length,
        createdAt: row.created_at,
      };
    });

    res.json({ posts });
  } catch {
    res.status(500).json({ error: "Failed to load posts" });
  }
});

const createPostSchema = z.object({
  content: z.string().min(1).max(1000),
  postType: z.string().default("general"),
  isAnonymous: z.boolean().default(false),
});

// POST /community/posts
router.post("/community/posts", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createPostSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request" }); return; }

  const { estateId, userId, firstName, lastName } = req.user!;
  try {
    const { data: row, error } = await req.supabaseClient!
      .from("community_posts")
      .insert({
        estate_id: estateId,
        author_id: userId,
        author_name: `${firstName} ${lastName}`.trim(),
        content: parsed.data.content,
        post_type: parsed.data.postType,
        is_anonymous: parsed.data.isAnonymous,
        is_deleted: false,
      })
      .select()
      .single();

    if (error) { res.status(500).json({ error: "Failed to create post" }); return; }
    res.status(201).json({ post: { id: row.id, content: row.content, isAnonymous: row.is_anonymous, postType: row.post_type, createdAt: row.created_at } });
  } catch {
    res.status(500).json({ error: "Failed to create post" });
  }
});

// POST /community/posts/:id/react
router.post("/community/posts/:id/react", requireAuth, async (req: AuthRequest, res) => {
  const { userId } = req.user!;
  const { reaction } = req.body as { reaction?: string };
  if (!reaction) { res.status(400).json({ error: "reaction required" }); return; }

  try {
    const existing = await req.supabaseClient!
      .from("community_post_reactions")
      .select("id")
      .eq("post_id", req.params.id)
      .eq("user_id", userId)
      .eq("reaction_type", reaction)
      .maybeSingle();

    if (existing.data) {
      await req.supabaseClient!.from("community_post_reactions").delete().eq("id", existing.data.id);
      res.json({ toggled: false });
    } else {
      await req.supabaseClient!.from("community_post_reactions").insert({ post_id: req.params.id, user_id: userId, reaction_type: reaction });
      res.json({ toggled: true });
    }
  } catch {
    res.status(500).json({ error: "Failed to react" });
  }
});

// GET /community/events
router.get("/community/events", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, userId } = req.user!;
  try {
    const { data: rows, error } = await req.supabaseClient!
      .from("community_events")
      .select("*, event_rsvps(response, user_id)")
      .eq("estate_id", estateId)
      .eq("status", "published")
      .order("starts_at", { ascending: true });

    if (error) { res.status(500).json({ error: "Failed to load events" }); return; }

    const events = (rows ?? []).map(row => {
      const rsvps = (row.event_rsvps ?? []) as Array<{ response: string; user_id: string }>;
      const attendeeCount = rsvps.filter(r => r.response === "yes").length;
      const userRsvp = rsvps.find(r => r.user_id === userId)?.response ?? null;
      return {
        id: row.id,
        title: row.title,
        description: row.description,
        location: row.location,
        startsAt: row.starts_at,
        endsAt: row.ends_at,
        attendeeCount,
        userRsvp,
        status: row.status,
      };
    });

    res.json({ events });
  } catch {
    res.status(500).json({ error: "Failed to load events" });
  }
});

// POST /community/events/:id/rsvp
router.post("/community/events/:id/rsvp", requireAuth, async (req: AuthRequest, res) => {
  const { userId } = req.user!;
  const { response } = req.body as { response?: string };
  if (!response || !["yes", "no", "maybe"].includes(response)) {
    res.status(400).json({ error: "response must be yes|no|maybe" }); return;
  }
  try {
    await req.supabaseClient!
      .from("event_rsvps")
      .upsert({ event_id: req.params.id, user_id: userId, response }, { onConflict: "event_id,user_id" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to RSVP" });
  }
});

// GET /community/broadcasts
router.get("/community/broadcasts", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, userId } = req.user!;
  try {
    const { data: rows, error } = await req.supabaseClient!
      .from("notices")
      .select("*, broadcast_reads(user_id)")
      .eq("estate_id", estateId)
      .order("published_at", { ascending: false })
      .limit(30);

    if (error) { res.status(500).json({ error: "Failed to load broadcasts" }); return; }

    const broadcasts = (rows ?? []).map(row => {
      const reads = (row.broadcast_reads ?? []) as Array<{ user_id: string }>;
      const isRead = reads.some(r => r.user_id === userId);
      return {
        id: row.id,
        subject: row.title,
        content: row.body,
        messageType: row.category ?? "general",
        isRead,
        createdAt: row.published_at ?? row.created_at,
      };
    });

    const unread = broadcasts.filter(b => !b.isRead).length;
    res.json({ broadcasts, unread });
  } catch {
    res.status(500).json({ error: "Failed to load broadcasts" });
  }
});

// PATCH /community/broadcasts/:id/read
router.patch("/community/broadcasts/:id/read", requireAuth, async (req: AuthRequest, res) => {
  const { userId } = req.user!;
  try {
    await req.supabaseClient!
      .from("broadcast_reads")
      .upsert({ notice_id: req.params.id, user_id: userId }, { onConflict: "notice_id,user_id" });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to mark as read" });
  }
});

export default router;
