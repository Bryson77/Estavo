import { Router } from "express";
import { db } from "@workspace/db";
import { contractors } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

router.get("/contractors", requireAuth, async (req: AuthRequest, res) => {
  try {
    const items = await db
      .select()
      .from(contractors)
      .where(and(eq(contractors.estateId, req.user!.estateId), eq(contractors.isActive, true)))
      .orderBy(contractors.name);

    const withRatings = items.map(c => ({
      ...c,
      rating: c.ratingCount && c.ratingCount > 0 ? Number((c.ratingSum! / c.ratingCount).toFixed(1)) : null,
    }));

    res.json({ contractors: withRatings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load contractors" });
  }
});

export default router;
