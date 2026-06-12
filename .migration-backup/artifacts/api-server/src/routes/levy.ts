import { Router } from "express";
import { requireAuth, type AuthRequest } from "../lib/auth.js";

const router = Router();

// GET /levy/account
router.get("/levy/account", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, unitId } = req.user!;
  if (!unitId) {
    res.status(403).json({ error: "No unit assigned to your account." });
    return;
  }

  try {
    const { data: row, error } = await req.supabaseClient!
      .from("levy_accounts")
      .select("balance, last_updated")
      .eq("estate_id", estateId)
      .eq("unit_id", unitId)
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: "Failed to load levy account." });
      return;
    }

    if (!row) {
      res.json({ balance: 0, lastUpdated: new Date() });
      return;
    }

    res.json({ balance: row.balance, lastUpdated: row.last_updated });
  } catch {
    res.status(500).json({ error: "Failed to load levy account." });
  }
});

// GET /levy/transactions
router.get("/levy/transactions", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, unitId } = req.user!;
  if (!unitId) {
    res.status(403).json({ error: "No unit assigned to your account." });
    return;
  }

  try {
    const { data: rows, error } = await req.supabaseClient!
      .from("levy_transactions")
      .select("id, transaction_type, amount, description, created_at")
      .eq("estate_id", estateId)
      .eq("unit_id", unitId)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      res.status(500).json({ error: "Failed to load transactions." });
      return;
    }

    const transactions = (rows ?? []).map((row) => ({
      id: row.id,
      type: row.transaction_type,
      amount: row.amount,
      description: row.description,
      createdAt: row.created_at,
    }));

    res.json({ transactions });
  } catch {
    res.status(500).json({ error: "Failed to load transactions." });
  }
});

// POST /levy/seed - Used strictly to mock data for the user's unit
router.post("/levy/seed", requireAuth, async (req: AuthRequest, res) => {
  const { estateId, unitId, userId } = req.user!;
  if (!unitId) {
    res.status(403).json({ error: "No unit assigned to your account." });
    return;
  }

  try {
    // 1. Create or update the levy account
    await req.supabaseClient!
      .from("levy_accounts")
      .upsert(
        {
          estate_id: estateId,
          unit_id: unitId,
          balance: 2450.00, // Arrears/amount owed
          last_updated: new Date().toISOString()
        },
        { onConflict: "estate_id,unit_id" }
      );

    // 2. Clear old transactions for this unit to avoid clutter
    await req.supabaseClient!
      .from("levy_transactions")
      .delete()
      .eq("unit_id", unitId);

    // 3. Insert fresh transactions
    const now = new Date();
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const mockTransactions = [
      {
        estate_id: estateId,
        unit_id: unitId,
        transaction_type: "charge",
        amount: 2450.00,
        description: "Monthly Levy - " + now.toLocaleString('default', { month: 'short', year: 'numeric' }),
        created_by: userId,
        created_at: now.toISOString(),
      },
      {
        estate_id: estateId,
        unit_id: unitId,
        transaction_type: "payment",
        amount: -2450.00,
        description: "EFT Payment Received",
        created_by: userId,
        created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        estate_id: estateId,
        unit_id: unitId,
        transaction_type: "charge",
        amount: 2450.00,
        description: "Monthly Levy - " + oneMonthAgo.toLocaleString('default', { month: 'short', year: 'numeric' }),
        created_by: userId,
        created_at: oneMonthAgo.toISOString(),
      },
      {
        estate_id: estateId,
        unit_id: unitId,
        transaction_type: "penalty",
        amount: 200.00,
        description: "Late Payment Penalty",
        created_by: userId,
        created_at: new Date(oneMonthAgo.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        estate_id: estateId,
        unit_id: unitId,
        transaction_type: "payment",
        amount: -2650.00,
        description: "EFT Payment Received",
        created_by: userId,
        created_at: new Date(oneMonthAgo.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        estate_id: estateId,
        unit_id: unitId,
        transaction_type: "charge",
        amount: 2450.00,
        description: "Monthly Levy - " + twoMonthsAgo.toLocaleString('default', { month: 'short', year: 'numeric' }),
        created_by: userId,
        created_at: twoMonthsAgo.toISOString(),
      }
    ];

    const { error } = await req.supabaseClient!
      .from("levy_transactions")
      .insert(mockTransactions);

    if (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to seed transactions." });
      return;
    }

    res.json({ success: true, message: "Levy account and transactions seeded successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to seed data." });
  }
});

export default router;
