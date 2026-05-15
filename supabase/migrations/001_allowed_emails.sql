create table allowed_emails (
  email text primary key,
  is_admin boolean default false,
  created_at timestamptz default now()
);

alter table allowed_emails enable row level security;

insert into allowed_emails (email, is_admin)
values ('drhhtang@gmail.com', true);
