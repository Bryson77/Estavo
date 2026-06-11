import { Router } from "express";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

const router = Router();

function getSupabasePlatform() {
  const url = process.env.SUPABASE_PLATFORM_URL!;
  const key = process.env.SUPABASE_PLATFORM_SERVICE_ROLE_KEY!;
  if (!url || !key) throw new Error("Platform Supabase not configured");
  return createClient(url, key, { auth: { persistSession: false } });
}

function getSupabaseApp() {
  const url = process.env.SUPABASE_APP_URL!;
  const key = process.env.SUPABASE_APP_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

// GET /platform/stats
router.get("/platform/stats", async (req, res) => {
  try {
    const appDb = getSupabaseApp();

    const [estatesResult, unitsResult] = await Promise.all([
      appDb.from("estates").select("id, unit_count, is_active"),
      appDb.from("estates").select("unit_count"),
    ]);

    const estates = estatesResult.data ?? [];
    const totalEstates = estates.length;
    const activeEstates = estates.filter((e: any) => e.is_active).length;

    let platformEstates: any[] = [];
    let pilotEstates = 0;
    let suspendedEstates = 0;
    let mrrZar = 0;

    try {
      const platDb = getSupabasePlatform();
      const { data: platData } = await platDb.from("platform_estates").select("*");
      platformEstates = platData ?? [];
      pilotEstates = platformEstates.filter((e: any) => e.is_pilot).length;
      suspendedEstates = platformEstates.filter((e: any) => e.subscription_status === "suspended").length;
      mrrZar = platformEstates.reduce((sum: number, e: any) => sum + (Number(e.monthly_amount_zar) ?? 0), 0);
    } catch {
      // Platform DB not configured yet — return app-level stats only
    }

    const totalUnits = estates.reduce((sum: number, e: any) => sum + (e.unit_count ?? 0), 0);

    res.json({
      totalEstates: totalEstates || platformEstates.length,
      activeEstates: activeEstates || platformEstates.filter((e: any) => e.subscription_status === "active").length,
      pilotEstates,
      suspendedEstates,
      totalUnits,
      mrrZar,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to load stats" });
  }
});

// GET /platform/estates
router.get("/platform/estates", async (_req, res) => {
  try {
    let estates: any[] = [];
    try {
      const platDb = getSupabasePlatform();
      const { data, error } = await platDb
        .from("platform_estates")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error) estates = data ?? [];
    } catch {
      // Fall back to app DB
      const appDb = getSupabaseApp();
      const { data } = await appDb.from("estates").select("*").order("created_at", { ascending: false });
      estates = (data ?? []).map((e: any) => ({
        id: e.id,
        name: e.name,
        address: e.address,
        unitCount: e.unit_count,
        subscriptionTier: e.subscription_tier ?? "starter",
        subscriptionStatus: e.is_active ? "active" : "suspended",
        isActive: e.is_active,
        isPilot: false,
        pilotDiscountPct: 0,
        createdAt: e.created_at,
      }));
    }

    res.json({
      estates: estates.map((e: any) => ({
        id: e.id,
        name: e.name,
        address: e.address ?? null,
        unitCount: e.unit_count ?? e.unitCount ?? 0,
        subscriptionTier: e.subscription_tier ?? e.subscriptionTier ?? "starter",
        subscriptionStatus: e.subscription_status ?? e.subscriptionStatus ?? "active",
        isActive: e.is_active ?? true,
        isPilot: e.is_pilot ?? false,
        pilotDiscountPct: e.pilot_discount_pct ?? 0,
        managerEmail: e.manager_email ?? null,
        monthlyAmountZar: e.monthly_amount_zar ? Number(e.monthly_amount_zar) : null,
        notes: e.notes ?? null,
        createdAt: e.created_at,
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to load estates" });
  }
});

const provisionSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  unitCount: z.number().int().positive(),
  subscriptionTier: z.enum(["starter", "growth", "estate", "enterprise"]).default("starter"),
  subscriptionStatus: z.enum(["active", "suspended", "cancelled", "pilot"]).default("active"),
  managerEmail: z.string().email().optional(),
  isPilot: z.boolean().default(false),
  pilotDiscountPct: z.number().min(0).max(100).default(0),
  monthlyAmountZar: z.number().optional(),
  notes: z.string().optional(),
});

// POST /platform/estates
router.post("/platform/estates", async (req, res) => {
  const parsed = provisionSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues }); return;
  }

  try {
    const appDb = getSupabaseApp();

    // 1. Create the estate in the app DB
    const { data: appEstate, error: appError } = await appDb
      .from("estates")
      .insert({
        name: parsed.data.name,
        address: parsed.data.address,
        unit_count: parsed.data.unitCount,
        subscription_tier: parsed.data.subscriptionTier,
        is_active: parsed.data.subscriptionStatus !== "suspended" && parsed.data.subscriptionStatus !== "cancelled",
      })
      .select()
      .single();

    if (appError || !appEstate) {
      res.status(500).json({ error: "Failed to create estate in app DB" }); return;
    }

    // 2. Create in platform DB (if configured)
    let platformRecord: any = null;
    try {
      const platDb = getSupabasePlatform();
      const { data } = await platDb
        .from("platform_estates")
        .insert({
          app_estate_id: appEstate.id,
          name: parsed.data.name,
          address: parsed.data.address,
          unit_count: parsed.data.unitCount,
          subscription_tier: parsed.data.subscriptionTier,
          subscription_status: parsed.data.subscriptionStatus,
          manager_email: parsed.data.managerEmail,
          is_pilot: parsed.data.isPilot,
          pilot_discount_pct: parsed.data.pilotDiscountPct,
          monthly_amount_zar: parsed.data.monthlyAmountZar,
          notes: parsed.data.notes,
        })
        .select()
        .single();
      platformRecord = data;
    } catch {
      // Platform DB not configured — no-op
    }

    res.status(201).json({
      estate: {
        id: platformRecord?.id ?? appEstate.id,
        name: parsed.data.name,
        unitCount: parsed.data.unitCount,
        subscriptionTier: parsed.data.subscriptionTier,
        subscriptionStatus: parsed.data.subscriptionStatus,
        createdAt: appEstate.created_at,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message ?? "Failed to provision estate" });
  }
});

// PATCH /platform/estates/:id
router.patch("/platform/estates/:id", async (req, res) => {
  try {
    const platDb = getSupabasePlatform();
    const { data, error } = await platDb
      .from("platform_estates")
      .update({
        name: req.body.name,
        subscription_tier: req.body.subscriptionTier,
        subscription_status: req.body.subscriptionStatus,
        monthly_amount_zar: req.body.monthlyAmountZar,
        notes: req.body.notes,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) { res.status(404).json({ error: "Estate not found" }); return; }
    res.json({ estate: data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /platform/estates/:id/suspend
router.post("/platform/estates/:id/suspend", async (req, res) => {
  try {
    const appDb = getSupabaseApp();

    try {
      const platDb = getSupabasePlatform();
      await platDb.from("platform_estates")
        .update({ subscription_status: "suspended", updated_at: new Date().toISOString() })
        .eq("id", req.params.id);
    } catch { /* Platform DB not configured */ }

    // Also suspend in app DB (look up by app_estate_id or direct id)
    await appDb.from("estates").update({ is_active: false }).eq("id", req.params.id);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
