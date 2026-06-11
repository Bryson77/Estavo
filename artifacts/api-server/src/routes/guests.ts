import { Router } from "express";
import { z } from "zod";
import { supabaseApp } from "../lib/supabase.js";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

// Transform a guest_otps row into the camelCase shape the frontend expects.
function transformCode(row: any) {
  const parts = (row.guest_name ?? "").split(" ");
  const guestFirstName = parts[0] ?? "";
  const guestLastName = parts.slice(1).join(" ");
  const isActive =
    !row.revoked_at &&
    !row.deactivated_at &&
    (!row.valid_until || new Date(row.valid_until) > new Date()) &&
    (row.uses_remaining ?? 0) > 0;

  return {
    id: row.id,
    estateId: row.estate_id,
    unitId: row.unit_id,
    residentId: row.resident_id,
    guestFirstName,
    guestLastName,
    guestPhone: row.guest_phone ?? "",
    isParcel: row.is_parcel ?? false,
    pinCode: row.otp_code,
    qrPayload: `ehq:${row.estate_id}:${row.otp_code}:${row.id}`,
    validFrom: row.valid_from,
    validUntil: row.valid_until,
    usesTotal: row.uses_total,
    usesRemaining: row.uses_remaining,
    isActive,
    createdAt: row.created_at,
    revokedAt: row.revoked_at ?? null,
  };
}

// GET /guests — list all guest OTPs for the resident's unit
router.get("/guests", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, unitId } = req.user!;

  if (!unitId) {
    res.status(422).json({ error: "No unit assigned to your account. Contact your estate manager." });
    return;
  }

  try {
    const { data: estate } = await supabaseApp
      .from("estates")
      .select("guest_code_config")
      .eq("id", estateId)
      .single();

    const config = (estate?.guest_code_config as any) ?? {};
    const maxActive: number = config.max_active_codes_per_unit ?? 5;

    const { data: rows, error } = await req.supabaseClient!
      .from("guest_otps")
      .select("*")
      .eq("estate_id", estateId)
      .eq("unit_id", unitId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("[guests GET]", error);
      res.status(500).json({ error: "Failed to load guest codes" });
      return;
    }

    const codes = (rows ?? []).map(transformCode);
    const activeCodes = codes.filter(c => c.isActive).length;
    const insideNow = codes.filter(
      c => c.isActive && !c.isParcel && c.usesRemaining < c.usesTotal
    ).length;

    res.json({ codes, activeCodes, maxActive, insideNow });
  } catch (err) {
    console.error("[guests GET]", err);
    res.status(500).json({ error: "Failed to load guest codes" });
  }
});

const createGuestSchema = z.object({
  guestFirstName: z.string().min(1),
  guestLastName: z.string().min(1),
  guestPhone: z.string().optional(),
  isParcel: z.boolean().default(false),
  durationHours: z.number().positive(),
  usesTotal: z.number().int().positive().optional(),
});

// POST /guests — create a new guest OTP
router.post("/guests", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createGuestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const { guestFirstName, guestLastName, guestPhone, isParcel, durationHours, usesTotal } = parsed.data;
  const { estateId, unitId, userId } = req.user!;

  if (!unitId) {
    res.status(422).json({ error: "No unit assigned to your account. Contact your estate manager." });
    return;
  }

  try {
    const { data: estate } = await supabaseApp
      .from("estates")
      .select("guest_code_config")
      .eq("id", estateId)
      .single();

    const config = (estate?.guest_code_config as any) ?? {};
    const maxActive: number = config.max_active_codes_per_unit ?? 5;
    const defaultUsesTotal: number = config.default_uses_total ?? 2;
    const parcelUsesTotal: number = config.parcel_uses_total ?? 1;

    // Enforce active-code cap
    const { count } = await req.supabaseClient!
      .from("guest_otps")
      .select("id", { count: "exact", head: true })
      .eq("estate_id", estateId)
      .eq("unit_id", unitId)
      .is("revoked_at", null)
      .is("deactivated_at", null)
      .gt("valid_until", new Date().toISOString());

    if ((count ?? 0) >= maxActive) {
      res.status(409).json({ error: `You have reached the maximum of ${maxActive} active guest codes.` });
      return;
    }

    const total = usesTotal ?? (isParcel ? parcelUsesTotal : defaultUsesTotal);
    const validUntil = new Date(Date.now() + durationHours * 60 * 60 * 1000);

    // Generate a unique 6-digit OTP code (retry if collision)
    let otpCode = "";
    for (let i = 0; i < 5; i++) {
      const candidate = Math.floor(100000 + Math.random() * 900000).toString();
      const { count: existing } = await supabaseApp
        .from("guest_otps")
        .select("id", { count: "exact", head: true })
        .eq("estate_id", estateId)
        .eq("otp_code", candidate)
        .is("revoked_at", null)
        .gt("valid_until", new Date().toISOString());
      if ((existing ?? 0) === 0) { otpCode = candidate; break; }
    }
    if (!otpCode) {
      res.status(500).json({ error: "Could not generate a unique code. Please try again." });
      return;
    }

    const { data: row, error } = await req.supabaseClient!
      .from("guest_otps")
      .insert({
        estate_id: estateId,
        unit_id: unitId,
        resident_id: userId,
        otp_code: otpCode,
        guest_name: `${guestFirstName} ${guestLastName}`.trim(),
        guest_phone: guestPhone ?? "",
        is_parcel: isParcel,
        valid_from: new Date().toISOString(),
        valid_until: validUntil.toISOString(),
        uses_total: total,
        uses_remaining: total,
      })
      .select()
      .single();

    if (error) {
      console.error("[guests POST]", error);
      res.status(500).json({ error: "Failed to create guest code" });
      return;
    }

    res.status(201).json({ code: transformCode(row) });
  } catch (err) {
    console.error("[guests POST]", err);
    res.status(500).json({ error: "Failed to create guest code" });
  }
});

// DELETE /guests/:id — revoke a guest OTP
router.delete("/guests/:id", requireAuth, async (req: AuthRequest, res) => {
  const { unitId, userId } = req.user!;

  if (!unitId) {
    res.status(422).json({ error: "No unit assigned to your account." });
    return;
  }

  try {
    const { data, error } = await req.supabaseClient!
      .from("guest_otps")
      .update({
        revoked_at: new Date().toISOString(),
        deactivated_by: userId,
        deactivated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .eq("unit_id", unitId)
      .select()
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Guest code not found or already revoked" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[guests DELETE]", err);
    res.status(500).json({ error: "Failed to revoke guest code" });
  }
});

export default router;
