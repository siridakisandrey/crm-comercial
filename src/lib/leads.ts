import { createClient } from "@supabase/supabase-js";
import { queryOptions } from "@tanstack/react-query";

import type { Etapa, Lead } from "./leads-format";

const env = import.meta.env as Record<string, string | undefined>;
const url = env["VITE_SUPABASE_URL"];
const key = env["VITE_SUPABASE_PUBLISHABLE_KEY"] ?? env["VITE_SUPABASE_ANON_KEY"];

export const isSupabaseConfigured = Boolean(url && key);

const supabase = isSupabaseConfigured
  ? createClient(url!, key!, { auth: { persistSession: false, autoRefreshToken: false } })
  : null;

function client() {
  if (!supabase) throw new Error("Supabase não está conectado a este projeto.");
  return supabase;
}

const COLUMNS = "id, Nome, Empresa, Valor, Etapa";

export const leadsQueryOptions = () =>
  queryOptions({
    queryKey: ["leads"],
    queryFn: async (): Promise<Lead[]> => {
      const { data, error } = await client()
        .from("leads")
        .select(COLUMNS)
        .order("id", { ascending: true });
      if (error) throw new Error(error.message);
      return (data ?? []) as Lead[];
    },
  });

export async function createLead(input: Omit<Lead, "id">): Promise<Lead> {
  const { data, error } = await client().from("leads").insert(input).select(COLUMNS).single();
  if (error) throw new Error(error.message);
  return data as Lead;
}

export async function updateLeadEtapa(id: number, etapa: Etapa): Promise<Lead> {
  const { data, error } = await client()
    .from("leads")
    .update({ Etapa: etapa })
    .eq("id", id)
    .select(COLUMNS)
    .single();
  if (error) throw new Error(error.message);
  return data as Lead;
}

export async function deleteLead(id: number): Promise<void> {
  const { error } = await client().from("leads").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
