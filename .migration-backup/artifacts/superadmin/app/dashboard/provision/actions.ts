"use server";

import { supabaseAppAdmin } from "@/lib/supabase-app";
import { revalidatePath } from "next/cache";

export async function provisionEstate(data: {
  name: string;
  address: string;
  unitCount: number;
  subscriptionTier: string;
  managerEmail: string;
  isPilot: boolean;
  pilotDiscountPct: number;
  notes: string;
}) {
  const planNotes = [
    data.subscriptionTier,
    data.isPilot ? `pilot (${data.pilotDiscountPct}% discount)` : null,
    data.notes
  ].filter(Boolean).join(" | ");

  const baseMonthlyFee = data.subscriptionTier === 'starter' ? 1200 :
                         data.subscriptionTier === 'growth' ? 2500 :
                         data.subscriptionTier === 'estate' ? 4500 : 0;
                         
  const finalFee = data.isPilot ? baseMonthlyFee * (1 - data.pilotDiscountPct / 100) : baseMonthlyFee;

  const { data: estate, error } = await supabaseAppAdmin.from("estates").insert({
    name: data.name,
    address: data.address,
    unit_count: data.unitCount,
    plan_notes: planNotes,
    monthly_fee_rands: finalFee,
    payment_status: data.isPilot ? "pilot" : "active",
    status: "active",
  }).select("id").single();

  if (error) {
    throw new Error(error.message);
  }

  // To truly provision the manager, we would create a Supabase Auth user and add them to the users table
  // This is a placeholder for that logic since we don't have the auth.admin API fully fleshed out here.

  revalidatePath("/dashboard/estates");
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/billing");
  
  return { success: true, id: estate.id };
}
