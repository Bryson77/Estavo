import { Router } from "express";
import { supabaseApp } from "../lib/supabase.js";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

// GET /contractors — estate-scoped contractor directory
router.get("/contractors", requireAuth, async (req: AuthRequest, res) => {
  const { estateId } = req.user!;
  try {
    const { data: rows, error } = await supabaseApp
      .from("contractors")
      .select("*")
      .eq("estate_id", estateId)
      .eq("is_active", true)
      .order("name");

    if (error) { res.status(500).json({ error: "Failed to load contractors" }); return; }

    const contractors = (rows ?? []).map(row => ({
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      tradeCategories: row.trade_categories ?? [],
      phone: row.phone ?? null,
      whatsapp: row.whatsapp ?? null,
      rating: row.rating ?? null,
      jobCount: row.job_count ?? 0,
      avgResponseMins: row.avg_response_mins ?? null,
      isVerified: row.is_verified ?? false,
    }));

    res.json({ contractors });
  } catch {
    res.status(500).json({ error: "Failed to load contractors" });
  }
});

export default router;
