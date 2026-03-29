-- Run in Supabase → SQL Editor if the app shows no books but `SELECT * FROM books` in the SQL editor returns rows.
-- PostgREST uses the `anon` role; without a policy, RLS returns zero rows and no error.

alter table public.books enable row level security;

drop policy if exists "Allow anon read books" on public.books;

create policy "Allow anon read books"
  on public.books
  for select
  to anon, authenticated
  using (true);
