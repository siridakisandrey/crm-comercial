<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Leads live in the user's own external Supabase table `public.leads` (columns `id`, `Nome`, `Empresa`, `Valor` text like "12.000 R$", `Etapa`); keep the exact capitalized column names because the table already exists there.
- Lead data access goes through `src/lib/leads.ts` (browser client from `VITE_SUPABASE_*` env); pure formatting/stage rules live in `src/lib/leads-format.ts` so they stay testable.
