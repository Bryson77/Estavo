import { Router } from "express";
import { db } from "@workspace/db";
import { gateLogs, estates } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

router.get("/gates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const estate = await db.query.estates.findFirst({
      where: eq(estates.id, req.user!.estateId),
    });

    if (!estate) {
      res.status(404).json({ error: "Estate not found" });
      return;
    }

    const gates = (estate.gates as any[]) ?? [];
    res.json({ gates });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load gates" });
  }
});

const triggerSchema = z.object({
  gateId: z.string(),
  gateLabel: z.string(),
  direction: z.enum(["entry", "exit"]).optional(),
});

router.post("/gates/trigger", requireAuth, async (req: AuthRequest, res) => {
  const parsed = triggerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { gateId, gateLabel, direction } = parsed.data;
  const { userId, estateId, role, unitNumber, firstName, lastName } = req.user!;

  try {
    const [log] = await db.insert(gateLogs).values({
      estateId,
      gateId,
      gateLabel,
      triggeredBy: userId,
      triggerType: role as any,
      unitNumber: unitNumber ?? undefined,
      actorName: `${firstName} ${lastName}`,
      direction: direction ?? "entry",
      status: "success",
      hardwareResponseMs: Math.floor(Math.random() * 200) + 50,
    }).returning();

    res.json({ success: true, logId: log.id, undoWindowSeconds: 5 });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to trigger gate" });
  }
});

router.post("/gates/undo", requireAuth, async (req: AuthRequest, res) => {
  const { logId } = req.body as { logId?: string };
  if (!logId) {
    res.status(400).json({ error: "logId required" });
    return;
  }

  try {
    await db.update(gateLogs)
      .set({ status: "cancelled" })
      .where(and(eq(gateLogs.id, logId), eq(gateLogs.estateId, req.user!.estateId)));

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to undo gate action" });
  }
});

router.get("/gates/activity", requireAuth, async (req: AuthRequest, res) => {
  try {
    const logs = await db
      .select()
      .from(gateLogs)
      .where(and(eq(gateLogs.estateId, req.user!.estateId), eq(gateLogs.triggeredBy, req.user!.userId)))
      .orderBy(desc(gateLogs.createdAt))
      .limit(50);

    res.json({ logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load gate activity" });
  }
});

export default router;
