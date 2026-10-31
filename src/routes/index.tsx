import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Plug, AlertTriangle } from "lucide-react";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createLead, isSupabaseConfigured, leadsQueryOptions, updateLeadEtapa } from "@/lib/leads";
import { ETAPAS, formatValor, isEtapa, parseValor, type Etapa, type Lead } from "@/lib/leads-format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Pipeline Comercial — CRM de Leads" },
      {
        name: "description",
        content: "Acompanhe seus leads, adicione novos contatos e mova cada negócio entre Novo, Em Contato e Fechado.",
      },
      { property: "og:title", content: "Pipeline Comercial — CRM de Leads" },
      {
        property: "og:description",
        content: "Lista de leads com valor do projeto e etapa comercial, conectada ao Supabase.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: async ({ context }) => {
    if (isSupabaseConfigured) await context.queryClient.prefetchQuery(leadsQueryOptions());
  },
  component: Index,
});

const STAGE_STYLE: Record<Etapa, { dot: string; chip: string }> = {
  Novo: { dot: "bg-stage-novo", chip: "bg-stage-novo-soft text-stage-novo" },
  "Em Contato": { dot: "bg-stage-contato", chip: "bg-stage-contato-soft text-stage-contato" },
  Fechado: { dot: "bg-stage-fechado", chip: "bg-stage-fechado-soft text-stage-fechado" },
};

function Index() {
  return (
    <main className="mx-auto min-h-screen max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <header className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
            CRM Comercial
          </p>
          <h1 className="mt-2 text-4xl font-semibold sm:text-5xl">Pipeline de leads</h1>
        </div>
        {isSupabaseConfigured && <NewLeadDialog />}
      </header>

      {isSupabaseConfigured ? <LeadsBoard /> : <ConnectNotice />}
    </main>
  );
}

function ConnectNotice() {
  return (
    <div className="surface-card flex flex-col items-start gap-3 p-8">
      <Plug className="size-6 text-primary" />
      <h2 className="text-xl font-semibold">Conecte seu Supabase</h2>
      <p className="max-w-prose text-sm text-muted-foreground">
        Abra Settings → General → External Supabase e clique em Connect. Assim que o projeto for
        conectado, os leads da tabela <span className="font-mono">leads</span> aparecem aqui.
      </p>
    </div>
  );
}

function LeadsBoard() {
  const { data: leads, isPending, error } = useQuery(leadsQueryOptions());

  if (error) {
    return (
      <div className="surface-card flex gap-3 p-6">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" />
        <div>
          <h2 className="font-semibold">Não foi possível ler os leads</h2>
          <p className="mt-1 font-mono text-xs text-muted-foreground">{error.message}</p>
        </div>
      </div>
    );
  }

  if (isPending) {
    return <div className="surface-card h-64 animate-pulse" />;
  }

  return (
    <div className="flex flex-col gap-8">
      <StageSummary leads={leads} />
      <LeadsTable leads={leads} />
    </div>
  );
}

function StageSummary({ leads }: { leads: Lead[] }) {
  return (
    <section className="grid gap-4 sm:grid-cols-3">
      {ETAPAS.map((etapa) => {
        const items = leads.filter((l) => l.Etapa === etapa);
        const total = items.reduce((sum, l) => sum + parseValor(l.Valor), 0);
        return (
          <div key={etapa} className="surface-card p-5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className={cn("size-2 rounded-full", STAGE_STYLE[etapa].dot)} />
              {etapa}
              <span className="ml-auto font-mono text-xs">{items.length}</span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{formatValor(total)}</p>
          </div>
        );
      })}
    </section>
  );
}

function LeadsTable({ leads }: { leads: Lead[] }) {
  if (leads.length === 0) {
    return (
      <div className="surface-card p-10 text-center text-sm text-muted-foreground">
        Nenhum lead encontrado. Se a tabela tem dados, verifique as permissões (RLS) no Supabase.
      </div>
    );
  }

  return (
    <section className="surface-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-muted/60 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium">#</th>
              <th className="px-5 py-3 font-medium">Nome</th>
              <th className="px-5 py-3 font-medium">Empresa</th>
              <th className="px-5 py-3 text-right font-medium">Valor</th>
              <th className="px-5 py-3 font-medium">Etapa</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-b last:border-0 hover:bg-muted/40">
                <td className="px-5 py-4 font-mono text-xs text-muted-foreground">{lead.id}</td>
                <td className="px-5 py-4 font-medium">{lead.Nome}</td>
                <td className="px-5 py-4 text-muted-foreground">{lead.Empresa}</td>
                <td className="px-5 py-4 text-right font-mono">{lead.Valor}</td>
                <td className="px-5 py-3">
                  <EtapaSelect lead={lead} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function EtapaSelect({ lead }: { lead: Lead }) {
  const queryClient = useQueryClient();
  const key = leadsQueryOptions().queryKey;

  const mutation = useMutation({
    mutationFn: (etapa: Etapa) => updateLeadEtapa(lead.id, etapa),
    onMutate: async (etapa) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Lead[]>(key);
      queryClient.setQueryData<Lead[]>(key, (old) =>
        old?.map((l) => (l.id === lead.id ? { ...l, Etapa: etapa } : l)),
      );
      return { previous };
    },
    onError: (err, _etapa, ctx) => {
      if (ctx?.previous) queryClient.setQueryData(key, ctx.previous);
      toast.error("Não foi possível mudar a etapa", { description: err.message });
    },
    onSuccess: (_data, etapa) => toast.success(`${lead.Nome} → ${etapa}`),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key }),
  });

  const current = isEtapa(lead.Etapa) ? lead.Etapa : undefined;

  return (
    <Select value={current ?? ""} onValueChange={(v) => isEtapa(v) && mutation.mutate(v)}>
      <SelectTrigger
        aria-label={`Etapa de ${lead.Nome}`}
        className={cn(
          "h-8 w-40 rounded-full border-0 px-3 text-xs font-semibold shadow-none",
          current ? STAGE_STYLE[current].chip : "bg-muted",
        )}
      >
        <SelectValue placeholder={lead.Etapa || "Sem etapa"} />
      </SelectTrigger>
      <SelectContent>
        {ETAPAS.map((etapa) => (
          <SelectItem key={etapa} value={etapa}>
            <span className="flex items-center gap-2">
              <span className={cn("size-2 rounded-full", STAGE_STYLE[etapa].dot)} />
              {etapa}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function NewLeadDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [valor, setValor] = useState("");
  const [etapa, setEtapa] = useState<Etapa>("Novo");

  const mutation = useMutation({
    mutationFn: createLead,
    onSuccess: (lead) => {
      queryClient.invalidateQueries({ queryKey: leadsQueryOptions().queryKey });
      toast.success("Lead adicionado", { description: lead.Nome });
      setNome("");
      setEmpresa("");
      setValor("");
      setEtapa("Novo");
      setOpen(false);
    },
    onError: (err) => toast.error("Não foi possível adicionar o lead", { description: err.message }),
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const numero = Number(valor);
    if (!nome.trim() || !empresa.trim() || !Number.isFinite(numero) || numero < 0) return;
    mutation.mutate({
      Nome: nome.trim(),
      Empresa: empresa.trim(),
      Valor: formatValor(numero),
      Etapa: etapa,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full">
          <Plus /> Novo lead
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Novo lead</DialogTitle>
          <DialogDescription>Preencha os dados para adicionar à tabela.</DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome do lead</Label>
            <Input id="nome" required value={nome} onChange={(e) => setNome(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="empresa">Empresa</Label>
            <Input id="empresa" required value={empresa} onChange={(e) => setEmpresa(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="valor">Valor do projeto (R$)</Label>
            <Input
              id="valor"
              type="number"
              min={0}
              step={1}
              required
              placeholder="12000"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label>Etapa</Label>
            <Select value={etapa} onValueChange={(v) => isEtapa(v) && setEtapa(v)}>
              <SelectTrigger aria-label="Etapa do novo lead">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ETAPAS.map((e) => (
                  <SelectItem key={e} value={e}>
                    {e}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Salvando..." : "Adicionar lead"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
