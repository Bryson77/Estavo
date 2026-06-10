import { Router } from "express";
import { db } from "@workspace/db";
import { maintenanceReports, reportStatusHistory } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../lib/auth.js";
import { z } from "zod";

const router = Router();

router.get("/reports", requireAuth, async (req: AuthRequest, res) => {
  try {
    const reports = await db
      .select()
      .from(maintenanceReports)
      .where(and(eq(maintenanceReports.estateId, req.user!.estateId), eq(maintenanceReports.submittedBy, req.user!.userId)))
      .orderBy(desc(maintenanceReports.createdAt))
      .limit(50);

    const open = reports.filter(r => r.status === "open").length;
    const inProgress = reports.filter(r => r.status === "in_progress").length;
    const resolved = reports.filter(r => r.status === "resolved" || r.status === "closed").length;

    res.json({ reports, open, inProgress, resolved });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load reports" });
  }
});

router.get("/reports/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const report = await db.query.maintenanceReports.findFirst({
      where: and(eq(maintenanceReports.id, req.params.id), eq(maintenanceReports.estateId, req.user!.estateId)),
    });

    if (!report) {
      res.status(404).json({ error: "Report not found" });
      return;
    }

    const history = await db
      .select()
      .from(reportStatusHistory)
      .where(eq(reportStatusHistory.reportId, req.params.id))
      .orderBy(desc(reportStatusHistory.createdAt));

    res.json({ report, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load report" });
  }
});

const createReportSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(["maintenance", "security", "urgent", "general"]).default("maintenance"),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  photoUrl: z.string().optional(),
});

router.post("/reports", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createReportSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request", details: parsed.error.issues });
    return;
  }

  const { title, description, category, priority, photoUrl } = parsed.data;
  const { userId, estateId, unitNumber } = req.user!;

  try {
    const shortId = Math.random().toString(36).substring(2, 10).toUpperCase();
    const ticketNumber = `TKT-${shortId}`;

    const [report] = await db.insert(maintenanceReports).values({
      estateId,
      submittedBy: userId,
      unitNumber: unitNumber ?? undefined,
      title,
      description,
      category,
      priority,
      photoUrl,
      ticketNumber,
      status: "open",
    }).returning();

    await db.insert(reportStatusHistory).values({
      reportId: report.id,
      status: "open",
      changedBy: userId,
      note: "Report submitted",
      isInternal: false,
    });

    res.status(201).json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create report" });
  }
});

export default router;
