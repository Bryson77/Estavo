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
      .from("guest_otps")
      .select("*")
      .eq("resident_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase query error:", error);
      return res.status(500).json({ error: "Failed to fetch guest codes" });
    }

    const mappedCodes = codes?.map(c => {
      const nameParts = c.guest_name ? c.guest_name.split(" ") : ["Guest"];
      const firstName = nameParts[0];
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
      const isActive = !c.revoked_at && new Date(c.valid_until) > new Date();

      return {
        id: c.id,
        guestFirstName: firstName,
        guestLastName: lastName,
        guestPhone: c.guest_phone || "",
        isParcel: c.is_parcel || false,
        pinCode: c.otp_code,
        qrPayload: `estavo://guest/${c.otp_code}`,
        validFrom: c.valid_from,
        validUntil: c.valid_until,
        usesRemaining: c.uses_remaining,
        usesTotal: c.uses_total,
        isActive: isActive,
        createdAt: c.created_at
      };
    }) || [];

    const activeCodes = mappedCodes.filter((c) => c.isActive).length || 0;
    const insideNow = 0; // Placeholder

    return res.json({
      codes: mappedCodes,
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

    // Fetch user's profile to get estate_id and unit_id
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("estate_id, unit_id")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      console.error("Error fetching profile:", profileError);
      return res.status(500).json({ error: "Failed to fetch user profile" });
    }

    const { guestFirstName, guestLastName, guestPhone, isParcel, durationHours, usesTotal } = req.body;

    if (!guestFirstName) {
      return res.status(400).json({ error: "Guest name is required" });
    }
    
    const fullName = guestLastName ? `${guestFirstName} ${guestLastName}` : guestFirstName;

    // Generate a 6-digit code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Calculate expiry
    const validFrom = new Date();
    const validUntil = new Date();
    validUntil.setHours(validUntil.getHours() + (durationHours || 24));

    const { data: rawCode, error } = await supabase
      .from("guest_otps")
      .insert({
        estate_id: profile.estate_id,
        unit_id: profile.unit_id,
        resident_id: user.id,
        otp_code: generatedCode,
        guest_name: fullName,
        guest_phone: guestPhone || null,
        is_parcel: isParcel || false,
        valid_from: validFrom.toISOString(),
        valid_until: validUntil.toISOString(),
        uses_total: usesTotal || 1,
        uses_remaining: usesTotal || 1
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return res.status(500).json({ error: "Failed to create guest code" });
    }

    const nameParts = rawCode.guest_name ? rawCode.guest_name.split(" ") : ["Guest"];
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "";
    const isActive = !rawCode.revoked_at && new Date(rawCode.valid_until) > new Date();

    const code = {
      id: rawCode.id,
      guestFirstName: firstName,
      guestLastName: lastName,
      guestPhone: rawCode.guest_phone || "",
      isParcel: rawCode.is_parcel || false,
      pinCode: rawCode.otp_code,
      qrPayload: `estavo://guest/${rawCode.otp_code}`,
      validFrom: rawCode.valid_from,
      validUntil: rawCode.valid_until,
      usesRemaining: rawCode.uses_remaining,
      usesTotal: rawCode.uses_total,
      isActive: isActive,
      createdAt: rawCode.created_at
    };

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

    // Mark as revoked instead of hard delete
    const { error } = await supabase
      .from("guest_otps")
      .update({
        revoked_at: new Date().toISOString(),
        deactivated_by: user.id,
        deactivated_at: new Date().toISOString()
      })
      .eq("id", codeId)
      .eq("resident_id", user.id); 

    if (error) {
      console.error("Supabase update error:", error);
      return res.status(500).json({ error: "Failed to revoke guest code" });
    }

    return res.json({ success: true });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
