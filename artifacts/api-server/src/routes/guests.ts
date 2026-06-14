import { Router, Request, Response } from "express";
import { supabase } from "../lib/supabase";

const router = Router();

// Helper to get authenticated user from request token
async function getUserFromRequest(req: Request) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return null;
  }
  return data.user;
}

// Get all active guest codes
router.get("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { data: codes, error } = await supabase
      .from("guest_codes")
      .select("*")
      .eq("created_by", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ error: "Failed to fetch guest codes" });
    }

    // Mock stats based on the fetched data
    const activeCodes = codes?.filter((c) => c.status === "active").length || 0;
    const insideNow = 0; // Placeholder

    return res.json({
      codes: codes || [],
      activeCodes,
      maxActive: 5,
      insideNow,
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Create a new guest code
router.post("/", async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const { guestFirstName, durationHours, usesTotal } = req.body;

    if (!guestFirstName) {
      return res.status(400).json({ error: "Guest name is required" });
    }

    // Generate a 6-digit code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiry (optional, durationHours isn't fully implemented in DB yet)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + (durationHours || 24));

    const { data: code, error } = await supabase
      .from("guest_codes")
      .insert({
        code: generatedCode,
        visitor_name: guestFirstName,
        status: "active",
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to create guest code" });
    }

    return res.json({ code });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

// Revoke a guest code
router.delete("/:id", async (req: Request, res: Response): Promise<any> => {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const codeId = req.params.id;

    // We can either delete it or mark it as 'revoked'
    // Doing a hard delete here for simplicity, or we can update status
    const { error } = await supabase
      .from("guest_codes")
      .delete()
      .eq("id", codeId)
      .eq("created_by", user.id); // Ensure they only delete their own codes

    if (error) {
      console.error("Supabase delete error:", error);
      return res.status(500).json({ error: "Failed to revoke guest code" });
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
