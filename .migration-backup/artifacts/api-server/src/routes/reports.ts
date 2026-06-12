import { Router } from "express";
import { z } from "zod";
import { supabaseApp } from "../lib/supabase.js"; // kept for ticket count only
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

function transformReport(row: any) {
  return {
    id: row.id,
    ticketNumber: row.ticket_number,
    title: row.title,
    description: row.description,
    category: row.category,
    priority: row.priority,
    status: row.status,
    photoUrl: row.photo_url ?? null,
    assignedTo: row.assigned_to ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /reports
router.get("/reports", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, unitId, role } = req.user!;
  try {
    let query = req.supabaseClient!
      .from("maintenance_requests")
      .select("*")
      .eq("estate_id", estateId)
      .order("created_at", { ascending: false })
      .limit(100);

    if (role === "resident" && unitId) {
      query = query.eq("unit_id", unitId);
    }

    const { data: rows, error } = await query;
    if (error) { res.status(500).json({ error: "Failed to load reports" }); return; }

    const reports = (rows ?? []).map(transformReport);
    const open = reports.filter(r => r.status === "open").length;
    const inProgress = reports.filter(r => r.status === "in_progress").length;
    const resolved = reports.filter(r => r.status === "resolved" || r.status === "closed").length;

    res.json({ reports, open, inProgress, resolved });
  } catch {
    res.status(500).json({ error: "Failed to load reports" });
  }
});

// GET /reports/:id
router.get("/reports/:id", requireAuth, async (req: AuthRequest, res) => {
  const { estateId } = req.user!;
  try {
    const { data: row, error } = await req.supabaseClient!
      .from("maintenance_requests")
      .select("*")
      .eq("id", req.params.id)
      .eq("estate_id", estateId)
      .single();
    if (error || !row) { res.status(404).json({ error: "Report not found" }); return; }
    res.json({ report: transformReport(row) });
  } catch {
    res.status(500).json({ error: "Failed to load report" });
  }
});

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(["maintenance", "security", "urgent", "general"]),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  photoUrl: z.string().url().optional(),
});

// POST /reports
router.post("/reports", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: "Invalid request", details: parsed.error.issues }); return; }

  const { estateId, unitId, userId } = req.user!;
  if (!unitId) { res.status(422).json({ error: "No unit assigned to your account." }); return; }

  try {
    const now = new Date();
    const prefix = `MNT-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
    const { count } = await supabaseApp
      .from("maintenance_requests")
      .select("id", { count: "exact", head: true })
      .eq("estate_id", estateId);
    const ticketNumber = `${prefix}-${String((count ?? 0) + 1).padStart(4, "0")}`;

    const { data: row, error } = await req.supabaseClient!
      .from("maintenance_requests")
      .insert({
        estate_id: estateId,
        unit_id: unitId,
        submitted_by: userId,
        ticket_number: ticketNumber,
        title: parsed.data.title,
        description: parsed.data.description,
        category: parsed.data.category,
        priority: parsed.data.priority,
        status: "open",
        photo_url: parsed.data.photoUrl ?? null,
      })
      .select()
      .single();

    if (error) { res.status(500).json({ error: "Failed to create report" }); return; }
    res.status(201).json({ report: transformReport(row) });
  } catch {
    res.status(500).json({ error: "Failed to create report" });
  }
});

export default router;
