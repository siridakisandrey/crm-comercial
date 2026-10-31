grant select, insert, update on public.leads to anon, authenticated;
grant all on public.leads to service_role;
create policy "ler leads" on public.leads for select using (true);
create policy "inserir leads" on public.leads for insert with check (true);
create policy "atualizar etapa" on public.leads for update using (true) with check (true);