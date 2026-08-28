-- Ejecutar en el SQL Editor de tu proyecto Supabase

create extension if not exists pgcrypto;

create table if not exists gastos (
  id uuid primary key default gen_random_uuid(),
  descripcion text not null,
  valor numeric(12,2) not null check (valor > 0),
  categoria text not null,
  fecha date not null,
  metodo_pago text,
  observaciones text,
  created_at timestamp default now()
);

create index if not exists idx_gastos_fecha on gastos (fecha desc);
create index if not exists idx_gastos_categoria on gastos (categoria);

-- La app no maneja login ni usuarios: se usa la clave "anon" directamente.
-- Row Level Security queda deshabilitado a propósito para simplificar el
-- acceso público de este proyecto personal. Si en el futuro agregas
-- autenticación, activa RLS y crea políticas por usuario.
alter table gastos disable row level security;
