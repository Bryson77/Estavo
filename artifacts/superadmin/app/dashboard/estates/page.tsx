import { supabaseAppAdmin } from "@/lib/supabase-app";
import EstatesClient from "./EstatesClient";

export default async function EstatesPage() {
  const { data, error } = await supabaseAppAdmin
    .from("estates")
    .select(`
      id,
      name,
      address,
      unit_count,
      monthly_fee_rands,
      payment_status,
      status,
      plan_notes,
      created_at,
      users (
        email,
        role
      )
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching estates:", error);
  }

  // Transform to match the expected Estate interface
  const estates = (data || []).map((e: any) => {
    // Find the manager's email if available
    const manager = e.users?.find((u: any) => u.role === "manager");

    return {
      id: e.id,
      appEstateId: e.id,
      name: e.name,
      address: e.address || "",
      unitCount: e.unit_count || 0,
      subscriptionTier: e.plan_notes?.toLowerCase().includes("enterprise") ? "enterprise" : 
                        e.plan_notes?.toLowerCase().includes("growth") ? "growth" : 
                        e.plan_notes?.toLowerCase().includes("estate") ? "estate" : "starter",
      subscriptionStatus: e.payment_status || "active",
      isActive: e.status === "active",
      isPilot: e.plan_notes?.toLowerCase().includes("pilot") || false,
      pilotDiscountPct: e.plan_notes?.toLowerCase().includes("pilot") ? 50 : 0,
      managerEmail: manager?.email || null,
      monthlyAmountZar: e.monthly_fee_rands || 0,
      createdAt: e.created_at,
    };
  });

  return <EstatesClient initialEstates={estates} />;
}
