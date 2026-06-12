import { Router } from "express";
import { z } from "zod";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { emergencyLimiter } from "../middlewares/rateLimiter.js";

const router = Router();

// POST /emergency — resident triggers a security alert
router.post("/emergency", requireAuth, emergencyLimiter, async (req: AuthRequest, res) => {
  const { estateId, unitId, userId, firstName, lastName } = req.user!;
  try {
    const ref = `EMG-${Date.now().toString(36).toUpperCase()}`;

    const { data: row, error } = await req.supabaseClient!
      .from("incidents")
      .insert({
        estate_id: estateId,
        unit_id: unitId ?? null,
        reported_by: userId,
        reporter_name: `${firstName} ${lastName}`.trim(),
        incident_type: "emergency_alert",
        description: "Resident triggered emergency alert via app.",
        emergency_ref: ref,
        status: "open",
      })
      .select("id")
      .single();

    if (error) {
      res.status(500).json({ error: "Failed to raise alert" }); return;
    }

    res.status(201).json({
      success: true,
      emergencyRef: ref,
      incidentId: row.id,
      message: "Security has been alerted. Help is on the way.",
    });
  } catch {
    res.status(500).json({ error: "Failed to raise alert" });
  }
});

// GET /emergency/history
router.get("/emergency/history", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, unitId, role } = req.user!;
  try {
    let query = req.supabaseClient!
      .from("incidents")
      .select("id, incident_type, description, emergency_ref, status, created_at")
      .eq("estate_id", estateId)
      .eq("incident_type", "emergency_alert")
      .order("created_at", { ascending: false })
      .limit(20);

    if (role === "resident" && unitId) {
      query = query.eq("unit_id", unitId);
    }

    const { data: rows, error } = await query;
    if (error) { res.status(500).json({ error: "Failed to load history" }); return; }

    res.json({
      alerts: (rows ?? []).map(r => ({
        id: r.id,
        ref: r.emergency_ref,
        status: r.status,
        createdAt: r.created_at,
      })),
    });
  } catch {
    res.status(500).json({ error: "Failed to load history" });
  }
});

export default router;
