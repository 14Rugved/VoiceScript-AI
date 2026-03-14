alter table public.transcripts
add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists transcripts_user_id_idx on public.transcripts(user_id);

update public.transcripts
set user_id = null
where user_id is null;

alter table public.transcripts enable row level security;

drop policy if exists "Users can read own transcripts" on public.transcripts;
create policy "Users can read own transcripts"
on public.transcripts
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "Users can insert own transcripts" on public.transcripts;
create policy "Users can insert own transcripts"
on public.transcripts
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can delete own transcripts" on public.transcripts;
create policy "Users can delete own transcripts"
on public.transcripts
for delete
to authenticated
using (auth.uid() = user_id);
