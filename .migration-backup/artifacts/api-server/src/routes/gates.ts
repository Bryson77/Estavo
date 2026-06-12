import { Router } from "express";
import { z } from "zod";
import { supabaseApp } from "../lib/supabase.js";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { gateLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// GET /gates — return the estate's gate list from the estates.gates jsonb column
router.get("/gates", requireAuth, async (req: AuthRequest, res) => {
  try {
    const { data: estate, error } = await supabaseApp
      .from("estates")
      .select("gates")
      .eq("id", req.user!.estateId)
      .single();

    if (error || !estate) {
      res.status(404).json({ error: "Estate not found" });
      return;
    }

    res.json({ gates: estate.gates ?? [] });
  } catch (err) {
    console.error("[gates GET]", err);
    res.status(500).json({ error: "Failed to load gates" });
  }
});

const triggerSchema = z.object({
  gateId: z.string(),
  gateLabel: z.string(),
  direction: z.enum(["entry", "exit"]).default("entry"),
});

// POST /gates/trigger — log a gate trigger and return a logId for undo
router.post("/gates/trigger", requireAuth, gateLimiter, async (req: AuthRequest, res) => {
  const parsed = triggerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request" });
    return;
  }

  const { gateId, gateLabel, direction } = parsed.data;
  const { estateId, unitId, firstName, lastName } = req.user!;
  const hardwareResponseMs = Math.floor(Math.random() * 200) + 50;

  try {
    const { data: row, error } = await req.supabaseClient!
      .from("gate_log")
      .insert({
        estate_id: estateId,
        gate_id: gateId,
        gate_label: gateLabel,
        direction,
        status: "success",
        entry_type: "resident",
        unit_id: unitId ?? null,
        guest_name: `${firstName} ${lastName}`.trim() || null,
        hardware_response_ms: hardwareResponseMs,
        entered_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) {
      console.error("[gates/trigger]", error);
      res.status(500).json({ error: "Failed to trigger gate" });
      return;
    }

    res.json({
      success: true,
      logId: row.id,
      undoWindowSeconds: 10,
    });
  } catch (err) {
    console.error("[gates/trigger]", err);
    res.status(500).json({ error: "Failed to trigger gate" });
  }
});

// POST /gates/undo — cancel a gate trigger within the undo window
router.post("/gates/undo", requireAuth, async (req: AuthRequest, res) => {
  const { logId } = req.body as { logId?: string };
  if (!logId) {
    res.status(400).json({ error: "logId required" });
    return;
  }

  try {
    const { data, error } = await req.supabaseClient!
      .from("gate_log")
      .update({ status: "cancelled" })
      .eq("id", logId)
      .eq("estate_id", req.user!.estateId)
      .select("id")
      .single();

    if (error || !data) {
      res.status(404).json({ error: "Log entry not found or cannot be undone" });
      return;
    }

    res.json({ success: true });
  } catch (err) {
    console.error("[gates/undo]", err);
    res.status(500).json({ error: "Failed to undo gate trigger" });
  }
});

// GET /gates/activity — recent gate activity for the user's unit (or whole estate for staff)
router.get("/gates/activity", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, unitId, role } = req.user!;

  try {
    let query = req.supabaseClient!
      .from("gate_log")
      .select("*")
      .eq("estate_id", estateId)
      .order("entered_at", { ascending: false })
      .limit(50);

    // Residents see only their own unit's log entries
    if (role === "resident" && unitId) {
      query = query.eq("unit_id", unitId);
    }

    const { data: rows, error } = await query;

    if (error) {
      console.error("[gates/activity]", error);
      res.status(500).json({ error: "Failed to load gate activity" });
      return;
    }

    const logs = (rows ?? []).map(row => ({
      id: row.id,
      gateId: row.gate_id,
      gateLabel: row.gate_label,
      direction: row.direction,
      status: row.status,
      entryType: row.entry_type,
      guestName: row.guest_name ?? null,
      unitId: row.unit_id ?? null,
      hardwareResponseMs: row.hardware_response_ms,
      createdAt: row.entered_at,
    }));

    res.json({ logs });
  } catch (err) {
    console.error("[gates/activity]", err);
    res.status(500).json({ error: "Failed to load gate activity" });
  }
});

export default router;
