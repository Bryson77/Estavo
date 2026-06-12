"use server";

import { supabaseAppAdmin } from "@/lib/supabase-app";
import { revalidatePath } from "next/cache";

export async function provisionEstate(data: {
  name: string;
  address: string;
  province: string;
  unitCount: number;
  googleMapsUrl: string;
  securityContactNumber: string;
  estateType: string;
  website: string;
  gates: { name: string; gateType: string; hardwareIp: string }[];
  gateHoldDurationMs: number;
  gateUndoWindowMs: number;
  emergencyHoldDurationMs: number;
  approvalThresholdZar: number;
  votesRequired: number;
  maxActiveGuestCodes: number;
  communityBoardEnabled: boolean;
  anonymousPostingAllowed: boolean;
  amenitiesEnabled: boolean;
  managerName: string;
  managerEmail: string;
  staff: { name: string; email: string; role: string }[];
  subscriptionTier: string;
  isPilot: boolean;
  pilotDiscountPct: number;
  billingContact: string;
  billingEmail: string;
  notes: string;
}) {
  const baseMonthlyFee =
    data.subscriptionTier === "starter" ? 1200 :
    data.subscriptionTier === "growth"  ? 2500 :
    data.subscriptionTier === "estate"  ? 4500 : 0;

  const finalFee = data.isPilot
    ? baseMonthlyFee * (1 - data.pilotDiscountPct / 100)
    : baseMonthlyFee;

  const planNotes = [
    data.subscriptionTier,
    data.isPilot ? `pilot (${data.pilotDiscountPct}% discount)` : null,
    data.notes,
  ].filter(Boolean).join(" | ");

  // 1. Create estate record
  const { data: estate, error: estateError } = await supabaseAppAdmin
    .from("estates")
    .insert({
      name: data.name,
      address: data.address,
      unit_count: data.unitCount,
      plan_notes: planNotes,
      monthly_fee_rands: finalFee,
      payment_status: data.isPilot ? "pilot" : "active",
      status: "active",
    })
    .select("id")
    .single();

  if (estateError) throw new Error(estateError.message);
  const estateId = estate.id;

  // 2. Create estate_config (ignore if table doesn't exist yet)
  await supabaseAppAdmin.from("estate_config").insert({
    estate_id: estateId,
    gate_hold_duration_ms: data.gateHoldDurationMs,
    gate_undo_window_ms: data.gateUndoWindowMs,
    emergency_hold_duration_ms: data.emergencyHoldDurationMs,
    approval_threshold_zar: data.approvalThresholdZar,
    votes_required: data.votesRequired,
    max_active_guest_codes: data.maxActiveGuestCodes,
    community_board_enabled: data.communityBoardEnabled,
    anonymous_posting_allowed: data.anonymousPostingAllowed,
    amenities_enabled: data.amenitiesEnabled,
  }).then(() => {}).catch(() => {});

  // 3. Create gates (ignore if table doesn't exist yet)
  if (data.gates.length > 0) {
    await supabaseAppAdmin.from("gates").insert(
      data.gates.map(g => ({
        estate_id: estateId,
        name: g.name,
        gate_type: g.gateType,
        hardware_ip: g.hardwareIp || null,
        device_key: crypto.randomUUID(),
        status: "offline",
      }))
    ).then(() => {}).catch(() => {});
  }

  // 4. Create manager profile in users table
  if (data.managerEmail) {
    await supabaseAppAdmin.from("users").insert({
      estate_id: estateId,
      email: data.managerEmail,
      role: "manager",
    }).then(() => {}).catch(() => {});
  }

  // 5. Create staff profiles
  if (data.staff.length > 0) {
    await supabaseAppAdmin.from("users").insert(
      data.staff.filter(s => s.email).map(s => ({
        estate_id: estateId,
        email: s.email,
        role: s.role,
      }))
    ).then(() => {}).catch(() => {});
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/estates");
  revalidatePath("/dashboard/billing");

  return { success: true, id: estateId };
}
