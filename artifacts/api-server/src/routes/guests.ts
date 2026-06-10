import { Router } from "express";
import { db } from "@workspace/db";
import { guestCodes, estates } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateQrPayload(estateId: string, pin: string): string {
  return `ehq:${estateId}:${pin}:${Date.now()}`;
}

router.get("/guests", requireAuth, async (req: AuthRequest, res) => {
  try {
    const codes = await db
      .select()
      .from(guestCodes)
      .where(and(eq(guestCodes.estateId, req.user!.estateId), eq(guestCodes.unitId, req.user!.userId)))
      .orderBy(desc(guestCodes.createdAt))
      .limit(100);

    const estate = await db.query.estates.findFirst({
      where: eq(estates.id, req.user!.estateId),
    });
    const config = (estate?.guestCodeConfig as any) ?? {};
    const maxActive = config.max_active_codes_per_unit ?? 10;

    const activeCodes = codes.filter(c =>
      c.isActive && c.validUntil && new Date(c.validUntil) > new Date()
    );

    const insideNow = activeCodes.filter(c => !c.isParcel && c.usesRemaining! < c.usesTotal!).length;

    res.json({
      codes,
      activeCodes: activeCodes.length,
      maxActive,
      insideNow,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load guest codes" });
  }
});

const createCodeSchema = z.object({
  guestFirstName: z.string().min(1),
  guestLastName: z.string().min(1),
  guestPhone: z.string().optional(),
  isParcel: z.boolean().default(false),
  durationHours: z.number().min(1).max(168),
  usesTotal: z.number().min(1).max(10).optional(),
});

router.post("/guests", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createCodeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const { guestFirstName, guestLastName, guestPhone, isParcel, durationHours, usesTotal } = parsed.data;
  const { userId, estateId } = req.user!;

  try {
    const estate = await db.query.estates.findFirst({ where: eq(estates.id, estateId) });
    const config = (estate?.guestCodeConfig as any) ?? {};
    const maxActive = config.max_active_codes_per_unit ?? 10;

    const activeCodes = await db
      .select()
      .from(guestCodes)
      .where(and(eq(guestCodes.estateId, estateId), eq(guestCodes.unitId, userId), eq(guestCodes.isActive, true)));

    const stillActive = activeCodes.filter(c => c.validUntil && new Date(c.validUntil) > new Date());
    if (stillActive.length >= maxActive) {
      res.status(400).json({ error: `Maximum of ${maxActive} active codes allowed.` });
      return;
    }

    const pin = generatePin();
    const qrPayload = generateQrPayload(estateId, pin);
    const validUntil = new Date(Date.now() + durationHours * 3600000);
    const total = usesTotal ?? (isParcel ? 1 : 3);

    const [code] = await db.insert(guestCodes).values({
      estateId,
      unitId: userId,
      guestFirstName,
      guestLastName,
      guestPhone: guestPhone ?? "",
      isParcel,
      pinCode: pin,
      qrPayload,
      validUntil,
      usesTotal: total,
      usesRemaining: total,
      isActive: true,
    }).returning();

    res.status(201).json({ code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create guest code" });
  }
});

router.delete("/guests/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [updated] = await db.update(guestCodes)
      .set({ isActive: false, deactivatedBy: req.user!.userId, deactivatedAt: new Date() })
      .where(and(eq(guestCodes.id, req.params.id), eq(guestCodes.unitId, req.user!.userId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Code not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to deactivate code" });
  }
});

export default router;
