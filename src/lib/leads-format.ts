// Pure helpers for the "leads" table. Kept free of Supabase imports so they are easy to test.

export const ETAPAS = ["Novo", "Em Contato", "Fechado"] as const;
export type Etapa = (typeof ETAPAS)[number];

export type Lead = {
  id: number;
  Nome: string;
  Empresa: string;
  Valor: string;
  Etapa: string;
};

/** Turns a stored value like "12.000 R$" into 12000. Returns 0 when unreadable. */
export function parseValor(valor: string | null | undefined): number {
  if (!valor) return 0;
  const cleaned = valor.replace(/[^\d,]/g, "").replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

/** Formats a number in the same style the table already uses: "12.000 R$". */
export function formatValor(n: number): string {
  return `${Math.round(n).toLocaleString("pt-BR")} R$`;
}

export function isEtapa(value: string): value is Etapa {
  return (ETAPAS as readonly string[]).includes(value);
}
