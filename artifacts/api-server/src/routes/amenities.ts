import { Router } from "express";
import { z } from "zod";
import { supabaseApp } from "../lib/supabase.js";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

// GET /amenities
router.get("/amenities", requireAuth, async (req: AuthRequest, res) => {
  const { estateId } = req.user!;
  try {
    const { data: rows, error } = await supabaseApp
      .from("amenities")
      .select("*")
      .eq("estate_id", estateId)
      .eq("is_active", true)
      .order("name");

    if (error) { res.status(500).json({ error: "Failed to load amenities" }); return; }

    const amenities = (rows ?? []).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description,
      availableDays: row.available_days,
      availableFrom: row.available_from,
      availableUntil: row.available_until,
      slotDurationMins: row.slot_duration_mins ?? 60,
      maxBookingsPerSlot: row.max_bookings_per_slot ?? 1,
    }));

    res.json({ amenities });
  } catch {
    res.status(500).json({ error: "Failed to load amenities" });
  }
});

// GET /amenities/my-bookings
router.get("/amenities/my-bookings", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, userId } = req.user!;
  try {
    const { data: rows, error } = await supabaseApp
      .from("amenity_bookings")
      .select("*, amenities(name)")
      .eq("estate_id", estateId)
      .eq("user_id", userId)
      .gte("slot_start", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order("slot_start", { ascending: true });

    if (error) { res.status(500).json({ error: "Failed to load bookings" }); return; }

    const bookings = (rows ?? []).map(row => ({
      id: row.id,
      amenityId: row.amenity_id,
      amenityName: (row.amenities as any)?.name ?? "",
      slotStart: row.slot_start,
      slotEnd: row.slot_end,
      status: row.status,
    }));

    res.json({ bookings });
  } catch {
    res.status(500).json({ error: "Failed to load bookings" });
  }
});

const bookSchema = z.object({
  amenityId: z.string().uuid(),
  slotStart: z.string().datetime(),
  slotEnd: z.string().datetime(),
});

// POST /amenities/book
router.post("/amenities/book", requireAuth, async (req: AuthRequest, res) => {
  const parsed = bookSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid booking request" }); return; }

  const { estateId, userId, unitId } = req.user!;
  try {
    const { count } = await supabaseApp
      .from("amenity_bookings")
      .select("id", { count: "exact", head: true })
      .eq("amenity_id", parsed.data.amenityId)
      .eq("slot_start", parsed.data.slotStart)
      .neq("status", "cancelled");

    const { data: amenity } = await supabaseApp
      .from("amenities")
      .select("max_bookings_per_slot")
      .eq("id", parsed.data.amenityId)
      .single();

    const maxSlot = amenity?.max_bookings_per_slot ?? 1;
    if ((count ?? 0) >= maxSlot) {
      res.status(409).json({ error: "This time slot is fully booked." }); return;
    }

    const { data: row, error } = await req.supabaseClient!
      .from("amenity_bookings")
      .insert({
        estate_id: estateId,
        amenity_id: parsed.data.amenityId,
        user_id: userId,
        unit_id: unitId ?? null,
        slot_start: parsed.data.slotStart,
        slot_end: parsed.data.slotEnd,
        status: "confirmed",
      })
      .select()
      .single();

    if (error) { res.status(500).json({ error: "Failed to create booking" }); return; }
    res.status(201).json({ booking: { id: row.id, slotStart: row.slot_start, slotEnd: row.slot_end, status: row.status } });
  } catch {
    res.status(500).json({ error: "Failed to book amenity" });
  }
});

// DELETE /amenities/bookings/:id
router.delete("/amenities/bookings/:id", requireAuth, async (req: AuthRequest, res) => {
  const { userId } = req.user!;
  try {
    const { error } = await req.supabaseClient!
      .from("amenity_bookings")
      .update({ status: "cancelled" })
      .eq("id", req.params.id)
      .eq("user_id", userId);

    if (error) { res.status(404).json({ error: "Booking not found" }); return; }
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});

export default router;
