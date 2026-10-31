grant delete on public.leads to anon, authenticated;
create policy "excluir leads" on public.leads for delete using (true);