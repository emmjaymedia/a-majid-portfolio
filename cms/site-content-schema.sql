create table public.portfolio_site_content (
 id text primary key check(id='main'), content jsonb not null check(jsonb_typeof(content)='object'), revision integer not null default 1 check(revision>0)
);
alter table public.portfolio_site_content enable row level security;
grant select on public.portfolio_site_content to anon,authenticated;
grant update on public.portfolio_site_content to authenticated;
create policy "Public can read website content" on public.portfolio_site_content for select to anon,authenticated using(true);
create policy "Editors can update website content" on public.portfolio_site_content for update to authenticated using(exists(select 1 from public.portfolio_admins where user_id=(select auth.uid()))) with check(exists(select 1 from public.portfolio_admins where user_id=(select auth.uid())));
