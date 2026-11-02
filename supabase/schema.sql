create table public.metro_studio_documents (
  site_id text not null,
  key text not null,
  document jsonb not null check (jsonb_typeof(document) = 'object'),
  updated_at timestamptz not null default now(),
  primary key (site_id, key)
);
alter table public.metro_studio_documents enable row level security;
revoke all on public.metro_studio_documents from anon, authenticated;
grant select, insert, update, delete on public.metro_studio_documents to service_role;
create index metro_studio_versions_recent on public.metro_studio_documents (site_id, updated_at desc) where key like 'versions/%';
create function public.metro_studio_publish(p_site_id text, p_document jsonb)
returns text language plpgsql security invoker set search_path = '' as $$
declare version_key text;
begin
  version_key := 'versions/' || to_char(clock_timestamp() at time zone 'utc', 'YYYY-MM-DD"T"HH24-MI-SS-MS') || '-' || gen_random_uuid()::text || '.json';
  insert into public.metro_studio_documents(site_id,key,document) values
    (p_site_id,version_key,p_document),
    (p_site_id,'draft.json',p_document),
    (p_site_id,'published.json',p_document)
  on conflict (site_id,key) do update set document=excluded.document,updated_at=now();
  return version_key;
end;
$$;
revoke execute on function public.metro_studio_publish(text,jsonb) from public,anon,authenticated;
grant execute on function public.metro_studio_publish(text,jsonb) to service_role;
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('metro-studio-media','metro-studio-media',false,8388608,array['image/jpeg','image/png','image/webp','image/gif','video/mp4','video/webm']);
