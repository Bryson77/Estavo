import { Router } from "express";
import { db } from "@workspace/db";
import { amenities, amenityBookings } from "@workspace/db";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

router.get("/amenities", requireAuth, async (req: AuthRequest, res) => {
  try {
    const items = await db
      .select()
      .from(amenities)
      .where(and(eq(amenities.estateId, req.user!.estateId), eq(amenities.isActive, true)))
      .orderBy(amenities.name);

    res.json({ amenities: items });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load amenities" });
  }
});

router.get("/amenities/my-bookings", requireAuth, async (req: AuthRequest, res) => {
  try {
    const bookings = await db
      .select()
      .from(amenityBookings)
      .where(and(eq(amenityBookings.residentId, req.user!.userId), eq(amenityBookings.status, "confirmed")))
      .orderBy(amenityBookings.slotStart)
      .limit(20);

    res.json({ bookings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

const bookSchema = z.object({
  amenityId: z.string().uuid(),
  slotStart: z.string().datetime(),
  slotEnd: z.string().datetime(),
});

router.post("/amenities/book", requireAuth, async (req: AuthRequest, res) => {
  const parsed = bookSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { amenityId, slotStart, slotEnd } = parsed.data;

  try {
    const amenity = await db.query.amenities.findFirst({
      where: and(eq(amenities.id, amenityId), eq(amenities.estateId, req.user!.estateId)),
    });

    if (!amenity) {
      res.status(404).json({ error: "Amenity not found" });
      return;
    }

    const conflicts = await db
      .select()
      .from(amenityBookings)
      .where(and(
        eq(amenityBookings.amenityId, amenityId),
        eq(amenityBookings.status, "confirmed"),
        lte(amenityBookings.slotStart, new Date(slotEnd)),
        gte(amenityBookings.slotEnd, new Date(slotStart)),
      ));

    if (conflicts.length >= (amenity.maxConcurrent ?? 1)) {
      res.status(409).json({ error: "This time slot is already fully booked" });
      return;
    }

    const [booking] = await db.insert(amenityBookings).values({
      amenityId,
      estateId: req.user!.estateId,
      residentId: req.user!.userId,
      slotStart: new Date(slotStart),
      slotEnd: new Date(slotEnd),
      status: "confirmed",
    }).returning();

    res.status(201).json({ booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to book amenity" });
  }
});

router.delete("/amenities/bookings/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [updated] = await db.update(amenityBookings)
      .set({ status: "cancelled", cancelledBy: req.user!.userId })
      .where(and(eq(amenityBookings.id, req.params.id), eq(amenityBookings.residentId, req.user!.userId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Booking not found" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;
