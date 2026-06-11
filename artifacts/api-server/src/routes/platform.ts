import { Router } from "express";
import { z } from "zod";
import { supabaseApp, supabasePlatform } from "../lib/supabase.js";
import { requirePlatformAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

// ============================================================
// GET /platform/stats
// ============================================================
router.get("/stats", requirePlatformAuth, async (_req, res) => {
  try {
    const [estatesRes, subscriptionsRes] = await Promise.all([
      supabasePlatform.from("estates").select("id, unit_count, is_active"),
      supabasePlatform
        .from("subscriptions")
        .select("status, monthly_amount, discount_percent"),
    ]);

    const estates = (estatesRes.data ?? []) as Array<{
      unit_count: number | null;
      is_active: boolean | null;
    }>;
    const subscriptions = (subscriptionsRes.data ?? []) as Array<{
      status: string | null;
      monthly_amount: number | null;
      discount_percent: number | null;
    }>;

    const totalEstates = estates.length;
    const activeEstates = estates.filter((e) => e.is_active).length;
    const pilotEstates = subscriptions.filter(
      (s) => (s.discount_percent ?? 0) > 0
    ).length;
    const suspendedEstates = subscriptions.filter(
      (s) => s.status === "suspended"
    ).length;
    const totalUnits = estates.reduce(
      (sum, e) => sum + (e.unit_count ?? 0),
      0
    );
    const mrrZar = subscriptions
      .filter((s) => s.status === "active" || s.status === "pilot")
      .reduce((sum, s) => {
        const amount = Number(s.monthly_amount ?? 0);
        const discount = Number(s.discount_percent ?? 0);
        return sum + amount * (1 - discount / 100);
      }, 0);

    res.json({
      totalEstates,
      activeEstates,
      pilotEstates,
      suspendedEstates,
      totalUnits,
      mrrZar: Math.round(mrrZar * 100) / 100,
    });
  } catch (err: any) {
    console.error("[GET /platform/stats]", err);
    res.status(500).json({ error: "Failed to load stats" });
  }
});

// ============================================================
// GET /platform/estates
// ============================================================
router.get("/estates", requirePlatformAuth, async (_req, res) => {
  try {
    const { data: estates, error } = await supabasePlatform
      .from("estates")
      .select(
        "id, app_estate_id, name, address, unit_count, subscription_tier, is_active, is_pilot, manager_email, notes, created_at, updated_at, subscriptions(id, tier, status, monthly_amount, discount_percent, next_billing_date)"
      )
      .order("created_at", { ascending: false });

    if (error) {
      res.status(500).json({ error: "Failed to load estates" });
      return;
    }

    const mapped = (estates ?? []).map((e: any) => {
      const sub = Array.isArray(e.subscriptions)
        ? e.subscriptions[0]
        : e.subscriptions ?? null;
      return {
        id: e.id,
        appEstateId: e.app_estate_id,
        name: e.name,
        address: e.address ?? null,
        unitCount: e.unit_count ?? 0,
        subscriptionTier: sub?.tier ?? e.subscription_tier ?? "starter",
        subscriptionStatus: sub?.status ?? "active",
        isActive: e.is_active ?? true,
        isPilot: e.is_pilot ?? false,
        pilotDiscountPct: Number(sub?.discount_percent ?? 0),
        monthlyAmountZar: sub?.monthly_amount
          ? Number(sub.monthly_amount)
          : null,
        managerEmail: e.manager_email ?? null,
        notes: e.notes ?? null,
        createdAt: e.created_at,
      };
    });

    res.json({ estates: mapped });
  } catch (err: any) {
    console.error("[GET /platform/estates]", err);
    res.status(500).json({ error: "Failed to load estates" });
  }
});

// ============================================================
// POST /platform/estates  — provision a new estate
// ============================================================
const provisionSchema = z.object({
  name: z.string().min(1),
  address: z.string().optional(),
  unitCount: z.number().int().positive(),
  subscriptionTier: z
    .enum(["starter", "growth", "estate", "enterprise"])
    .default("starter"),
  subscriptionStatus: z
    .enum(["active", "suspended", "cancelled", "pilot"])
    .default("active"),
  managerEmail: z.string().email().optional(),
  isPilot: z.boolean().default(false),
  pilotDiscountPct: z.number().min(0).max(100).default(0),
  monthlyAmountZar: z.number().optional(),
  notes: z.string().optional(),
});

router.post("/estates", requirePlatformAuth, async (req: AuthRequest, res) => {
  const parsed = provisionSchema.safeParse(req.body);
  if (!parsed.success) {
    res
      .status(400)
      .json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const d = parsed.data;
  const isActive =
    d.subscriptionStatus !== "suspended" &&
    d.subscriptionStatus !== "cancelled";

  try {
    // 1. Create estate record in the app DB
    const { data: appEstate, error: appError } = await supabaseApp
      .from("estates")
      .insert({
        name: d.name,
        address: d.address ?? null,
        unit_count: d.unitCount,
        subscription_tier: d.subscriptionTier,
        is_active: isActive,
      })
      .select("id")
      .single();

    if (appError || !appEstate) {
      console.error("[POST /platform/estates] app db error:", appError);
      res.status(500).json({ error: "Failed to create estate in app DB" });
      return;
    }

    // 2. Create estate record in the platform DB
    const { data: platEstate, error: platErr } = await supabasePlatform
      .from("estates")
      .insert({
        app_estate_id: appEstate.id,
        name: d.name,
        address: d.address ?? null,
        unit_count: d.unitCount,
        subscription_tier: d.subscriptionTier,
        is_active: isActive,
        is_pilot: d.isPilot,
        manager_email: d.managerEmail ?? null,
        notes: d.notes ?? null,
      })
      .select("id, created_at")
      .single();

    if (platErr || !platEstate) {
      // Roll back app estate on platform failure
      await supabaseApp.from("estates").delete().eq("id", appEstate.id);
      console.error("[POST /platform/estates] platform db error:", platErr);
      res.status(500).json({ error: "Failed to create estate in platform DB" });
      return;
    }

    // 3. Create subscription record
    const { data: sub } = await supabasePlatform
      .from("subscriptions")
      .insert({
        estate_id: platEstate.id,
        tier: d.subscriptionTier,
        monthly_amount: d.monthlyAmountZar ?? 0,
        status: d.subscriptionStatus,
        discount_percent: d.pilotDiscountPct,
        billing_cycle: "monthly",
      })
      .select("monthly_amount")
      .single();

    res.status(201).json({
      estate: {
        id: platEstate.id,
        appEstateId: appEstate.id,
        name: d.name,
        address: d.address ?? null,
        unitCount: d.unitCount,
        subscriptionTier: d.subscriptionTier,
        subscriptionStatus: d.subscriptionStatus,
        isActive,
        isPilot: d.isPilot,
        monthlyAmountZar: sub?.monthly_amount
          ? Number(sub.monthly_amount)
          : null,
        createdAt: platEstate.created_at,
      },
    });
  } catch (err: any) {
    console.error("[POST /platform/estates]", err);
    res.status(500).json({ error: "Failed to provision estate" });
  }
});

// ============================================================
// PATCH /platform/estates/:id
// ============================================================
const updateEstateSchema = provisionSchema.partial();

router.patch(
  "/estates/:id",
  requirePlatformAuth,
  async (req: AuthRequest, res) => {
    const { id } = req.params;
    
    const parsed = updateEstateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
      return;
    }
    
    const d = parsed.data;

    try {
      // Build estate update payload safely from validated data
      const estateUpdate: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };
      if (d.name) estateUpdate.name = d.name;
      if (d.address !== undefined) estateUpdate.address = d.address;
      if (d.managerEmail !== undefined) estateUpdate.manager_email = d.managerEmail;
      if (d.notes !== undefined) estateUpdate.notes = d.notes;
      if (d.subscriptionTier) estateUpdate.subscription_tier = d.subscriptionTier;

      const { data: estate, error } = await supabasePlatform
        .from("estates")
        .update(estateUpdate)
        .eq("id", id)
        .select("id, app_estate_id")
        .single();

      if (error || !estate) {
        res.status(404).json({ error: "Estate not found" });
        return;
      }

      // Update subscription if billing fields provided
      const hasSubUpdate =
        d.subscriptionTier ||
        d.monthlyAmountZar !== undefined ||
        d.subscriptionStatus ||
        d.pilotDiscountPct !== undefined;

      if (hasSubUpdate) {
        const subUpdate: Record<string, any> = {};
        if (d.subscriptionTier) subUpdate.tier = d.subscriptionTier;
        if (d.monthlyAmountZar !== undefined)
          subUpdate.monthly_amount = d.monthlyAmountZar;
        if (d.subscriptionStatus) subUpdate.status = d.subscriptionStatus;
        if (d.pilotDiscountPct !== undefined)
          subUpdate.discount_percent = d.pilotDiscountPct;

        await supabasePlatform
          .from("subscriptions")
          .update(subUpdate)
          .eq("estate_id", id);

        // Mirror active status back to app DB
        if (d.subscriptionStatus) {
          const isActive =
            d.subscriptionStatus !== "suspended" &&
            d.subscriptionStatus !== "cancelled";
          await supabaseApp
            .from("estates")
            .update({ is_active: isActive })
            .eq("id", estate.app_estate_id);
        }
      }

      res.json({ success: true, id });
    } catch (err: any) {
      console.error("[PATCH /platform/estates/:id]", err);
      res.status(500).json({ error: "Update failed" });
    }
  }
);

// ============================================================
// POST /platform/estates/:id/suspend
// ============================================================
router.post(
  "/estates/:id/suspend",
  requirePlatformAuth,
  async (_req, res) => {
    const { id } = _req.params;

    try {
      // Suspend in platform DB — get app_estate_id for cross-DB update
      const { data: platEstate } = await supabasePlatform
        .from("estates")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select("app_estate_id")
        .single();

      await supabasePlatform
        .from("subscriptions")
        .update({ status: "suspended" })
        .eq("estate_id", id);

      // Mirror to app DB
      if (platEstate?.app_estate_id) {
        await supabaseApp
          .from("estates")
          .update({ is_active: false })
          .eq("id", platEstate.app_estate_id);
      }

      res.json({ success: true });
    } catch (err: any) {
      console.error("[POST /platform/estates/:id/suspend]", err);
      res.status(500).json({ error: "Suspend failed" });
    }
  }
);

export default router;
