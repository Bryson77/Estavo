import { Router } from "express";
import { db } from "@workspace/db";
import { emergencyAlerts, users } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

router.post("/emergency", requireAuth, async (req: AuthRequest, res) => {
  const { userId, estateId, unitNumber, firstName, lastName } = req.user!;

  try {
    const user = await db.query.users.findFirst({ where: eq(users.id, userId) });

    if (user?.emergencySuspendedUntil && new Date(user.emergencySuspendedUntil) > new Date()) {
      const until = new Date(user.emergencySuspendedUntil).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });
      res.status(403).json({ error: `Emergency button suspended until ${until}` });
      return;
    }

    const shortId = Math.random().toString(36).substring(2, 6).toUpperCase();
    const emergencyRef = `#E${shortId}`;

    const [alert] = await db.insert(emergencyAlerts).values({
      estateId,
      triggeredBy: userId,
      triggerType: "resident",
      unitNumber: unitNumber ?? undefined,
      emergencyRef,
      status: "active",
    }).returning();

    console.log(`[EMERGENCY] ${emergencyRef} triggered by ${firstName} ${lastName}, Unit ${unitNumber}, Estate ${estateId}`);

    res.status(201).json({
      alert,
      emergencyRef,
      message: "Security has been alerted. Stay safe.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to trigger emergency alert" });
  }
});

router.get("/emergency/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const alerts = await db
      .select()
      .from(emergencyAlerts)
      .where(and(eq(emergencyAlerts.estateId, req.user!.estateId), eq(emergencyAlerts.triggeredBy, req.user!.userId)))
      .orderBy(desc(emergencyAlerts.createdAt))
      .limit(10);

    res.json({ alerts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load emergency history" });
  }
});

export default router;
