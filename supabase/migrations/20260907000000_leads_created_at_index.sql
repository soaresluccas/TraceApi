create index if not exists leads_created_at_idx on public.leads using btree (created_at desc);
