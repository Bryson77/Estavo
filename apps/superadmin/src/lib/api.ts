import { useState, useEffect } from "react";
import { supabase } from "./supabase";

export interface Estate {
  id: string;
  name: string;
  province: string;
  units: number;
  health: number;
  manager: string;
  gate: string;
  mrr: string;
  status: string;
  adoption: number;
}

export interface MonthData {
  id: string;
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  tickets: number;
  resolution: number;
}

export interface ErrorData {
  id: string;
  time: string;
  severity: string;
  category: string;
  description: string;
  estate: string;
  status: string;
}

export function useEstates() {
  const [estates, setEstates] = useState<Estate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEstates() {
      try {
        const { data, error } = await supabase
          .from("estates")
          .select(`
            id,
            name,
            province,
            unit_count,
            status,
            health_score,
            adoption_percentage,
            profiles (name, role),
            billing (monthly_fee, status)
          `)
          .order("created_at", { ascending: true });

        if (error) throw error;

        const formattedEstates: Estate[] = data.map((e: any) => {
          const manager = e.profiles?.find((p: any) => p.role === 'estate_manager');
          const billingRec = e.billing?.[0];
          const monthlyFee = billingRec?.monthly_fee ? Number(billingRec.monthly_fee) : 0;
          
          return {
            id: e.id,
            name: e.name,
            province: e.province || 'Unknown',
            units: e.unit_count || 0,
            health: e.health_score || 0,
            manager: manager?.name || 'Unassigned',
            gate: 'Online', // hardcoded placeholder for UI
            mrr: `R ${monthlyFee.toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
            status: e.status || 'Active',
            adoption: e.adoption_percentage || 0
          };
        });

        setEstates(formattedEstates);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchEstates();
  }, []);

  return { estates, loading, error };
}

export function useMonths() {
  const [months, setMonths] = useState<MonthData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMonths() {
      try {
        const { data, error } = await supabase
          .from("monthly_financials")
          .select("*")
          .order("month_date", { ascending: true });

        if (error) throw error;

        const formattedMonths: MonthData[] = data.map((m: any) => ({
          id: m.id,
          month: m.month_name,
          revenue: Number(m.revenue),
          expenses: Number(m.expenses),
          profit: Number(m.profit),
          tickets: 120, // fallback mock for UI
          resolution: 95, // fallback mock for UI
        }));

        setMonths(formattedMonths);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchMonths();
  }, []);

  return { months, loading, error };
}

export function useErrors() {
  const [errors] = useState<ErrorData[]>([]);
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return { errors, loading, error };
}
