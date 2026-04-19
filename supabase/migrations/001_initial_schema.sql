-- ============================================================
-- VPRequisições — Schema completo (IDEMPOTENTE — safe to re-run)
-- Gerado a partir de src/lib/supabase/types.ts
-- ============================================================

-- ─── ENUMs (idempotente) ──────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE public.req_module_type AS ENUM (
    'M1_PRODUTOS','M2_VIAGENS','M3_SERVICOS',
    'M4_MANUTENCAO','M5_FRETE','M6_LOCACAO'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.req_ticket_status AS ENUM (
    'DRAFT','SUBMITTED','QUOTING','PENDING_APPROVAL',
    'APPROVED','REJECTED','PURCHASING','RECEIVING',
    'IN_USE','RETURNED','RELEASED','CANCELLED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.req_user_role AS ENUM (
    'requester','quoter','approver','buyer','receiver','admin'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.req_priority_level AS ENUM (
    'low','normal','high','urgent'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.req_quotation_status AS ENUM (
    'PENDING','SENT','RECEIVED','SELECTED','REJECTED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.req_approval_decision AS ENUM (
    'PENDING','APPROVED','REJECTED','DELEGATED'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.req_log_level AS ENUM (
    'info','success','warning','error'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── TABELA: profiles (base para activity_logs) ───────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  full_name  TEXT,
  role       TEXT DEFAULT 'user',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─── TABELAS req_* ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.req_departments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  cost_center TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  manager_id  UUID,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name       TEXT NOT NULL,
  email           TEXT NOT NULL,
  role            public.req_user_role NOT NULL DEFAULT 'requester',
  department_id   UUID REFERENCES public.req_departments(id),
  approval_tier   INTEGER,
  approval_limit  NUMERIC,
  avatar_url      TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_suppliers (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  document       TEXT,
  email          TEXT,
  phone          TEXT,
  address        TEXT,
  categories     TEXT[] NOT NULL DEFAULT '{}',
  rating         NUMERIC,
  lead_time_days INTEGER,
  is_active      BOOLEAN NOT NULL DEFAULT true,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_tickets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number  TEXT NOT NULL UNIQUE,
  title          TEXT NOT NULL,
  description    TEXT,
  module         public.req_module_type NOT NULL,
  status         public.req_ticket_status NOT NULL DEFAULT 'DRAFT',
  priority       public.req_priority_level NOT NULL DEFAULT 'normal',
  currency       TEXT NOT NULL DEFAULT 'BRL',
  total_value    NUMERIC,
  metadata       JSONB NOT NULL DEFAULT '{}',
  department_id  UUID NOT NULL REFERENCES public.req_departments(id),
  requester_id   UUID NOT NULL REFERENCES public.req_profiles(id),
  submitted_at   TIMESTAMPTZ,
  quoted_at      TIMESTAMPTZ,
  approved_at    TIMESTAMPTZ,
  rejected_at    TIMESTAMPTZ,
  purchased_at   TIMESTAMPTZ,
  received_at    TIMESTAMPTZ,
  released_at    TIMESTAMPTZ,
  cancelled_at   TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_ticket_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id   UUID NOT NULL REFERENCES public.req_tickets(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity    NUMERIC NOT NULL DEFAULT 1,
  unit        TEXT NOT NULL DEFAULT 'un',
  unit_price  NUMERIC,
  total_price NUMERIC,
  notes       TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_quotations (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id      UUID NOT NULL REFERENCES public.req_tickets(id) ON DELETE CASCADE,
  supplier_id    UUID NOT NULL REFERENCES public.req_suppliers(id),
  status         public.req_quotation_status NOT NULL DEFAULT 'PENDING',
  total_value    NUMERIC,
  delivery_days  INTEGER,
  validity_date  DATE,
  is_winner      BOOLEAN NOT NULL DEFAULT false,
  items          JSONB NOT NULL DEFAULT '[]',
  notes          TEXT,
  attachment_url TEXT,
  quoter_id      UUID REFERENCES public.req_profiles(id),
  sent_at        TIMESTAMPTZ,
  received_at    TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_approvals (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id    UUID NOT NULL REFERENCES public.req_tickets(id) ON DELETE CASCADE,
  approver_id  UUID NOT NULL REFERENCES public.req_profiles(id),
  tier         INTEGER NOT NULL,
  decision     public.req_approval_decision NOT NULL DEFAULT 'PENDING',
  delegated_to UUID REFERENCES public.req_profiles(id),
  notes        TEXT,
  decided_at   TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_audit_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id  UUID REFERENCES public.req_tickets(id),
  user_id    UUID REFERENCES public.req_profiles(id),
  action     TEXT NOT NULL,
  details    TEXT,
  level      public.req_log_level NOT NULL DEFAULT 'info',
  module     TEXT,
  metadata   JSONB NOT NULL DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.req_notifications (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID NOT NULL REFERENCES public.req_profiles(id) ON DELETE CASCADE,
  ticket_id  UUID REFERENCES public.req_tickets(id),
  title      TEXT NOT NULL,
  body       TEXT,
  type       TEXT NOT NULL,
  action_url TEXT,
  is_read    BOOLEAN NOT NULL DEFAULT false,
  read_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.modules (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,
  name        TEXT NOT NULL,
  description TEXT,
  url         TEXT NOT NULL,
  icon        TEXT,
  color       TEXT,
  is_active   BOOLEAN DEFAULT true,
  sort_order  INTEGER,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID REFERENCES public.profiles(id),
  user_name  TEXT,
  user_email TEXT,
  action     TEXT NOT NULL,
  target     TEXT,
  details    JSONB,
  criado_em  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.module_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL,
  module_slug TEXT NOT NULL,
  can_access  BOOLEAN DEFAULT true,
  granted_by  UUID,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.role_permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  module_slug TEXT NOT NULL,
  level       TEXT NOT NULL,
  department  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─── ÍNDICES (idempotente) ────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_req_tickets_status     ON public.req_tickets(status);
CREATE INDEX IF NOT EXISTS idx_req_tickets_module     ON public.req_tickets(module);
CREATE INDEX IF NOT EXISTS idx_req_tickets_requester  ON public.req_tickets(requester_id);
CREATE INDEX IF NOT EXISTS idx_req_tickets_department ON public.req_tickets(department_id);
CREATE INDEX IF NOT EXISTS idx_req_quotations_ticket  ON public.req_quotations(ticket_id);
CREATE INDEX IF NOT EXISTS idx_req_approvals_ticket   ON public.req_approvals(ticket_id);
CREATE INDEX IF NOT EXISTS idx_req_audit_ticket       ON public.req_audit_logs(ticket_id);
CREATE INDEX IF NOT EXISTS idx_req_notif_user         ON public.req_notifications(user_id);

-- ─── VIEWS (idempotente) ──────────────────────────────────────
CREATE OR REPLACE VIEW public.req_tickets_view AS
SELECT
  t.id, t.ticket_number, t.title, t.description,
  t.module, t.status, t.priority, t.currency, t.total_value,
  t.metadata, t.submitted_at, t.approved_at, t.released_at, t.updated_at, t.created_at,
  p.full_name  AS requester_name,
  p.email      AS requester_email,
  p.role       AS requester_role,
  d.name       AS department_name,
  d.cost_center
FROM public.req_tickets t
JOIN public.req_profiles    p ON p.id = t.requester_id
JOIN public.req_departments d ON d.id = t.department_id;

CREATE OR REPLACE VIEW public.req_users_public AS
SELECT
  id, full_name, email, role,
  department_id, approval_tier, approval_limit, is_active
FROM public.req_profiles;

-- ─── FUNÇÕES ─────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.req_generate_ticket_number(
  p_module public.req_module_type
) RETURNS TEXT
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_prefix TEXT;
  v_count  BIGINT;
BEGIN
  v_prefix := split_part(p_module::TEXT, '_', 1); -- M1, M2, etc.
  SELECT COUNT(*) + 1 INTO v_count
  FROM public.req_tickets
  WHERE module = p_module;
  RETURN v_prefix || '-' || LPAD(v_count::TEXT, 6, '0');
END;
$$;

CREATE OR REPLACE FUNCTION public.req_is_valid_transition(
  p_from public.req_ticket_status,
  p_to   public.req_ticket_status
) RETURNS BOOLEAN
LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN CASE
    WHEN p_from = 'DRAFT'            AND p_to IN ('SUBMITTED','CANCELLED')                 THEN true
    WHEN p_from = 'SUBMITTED'        AND p_to IN ('QUOTING','PENDING_APPROVAL','CANCELLED') THEN true
    WHEN p_from = 'QUOTING'          AND p_to IN ('PENDING_APPROVAL','CANCELLED')           THEN true
    WHEN p_from = 'PENDING_APPROVAL' AND p_to IN ('APPROVED','REJECTED','QUOTING')          THEN true
    WHEN p_from = 'APPROVED'         AND p_to IN ('PURCHASING','CANCELLED')                 THEN true
    WHEN p_from = 'PURCHASING'       AND p_to IN ('RECEIVING','RELEASED','CANCELLED')       THEN true
    WHEN p_from = 'RECEIVING'        AND p_to IN ('IN_USE','RELEASED','RETURNED')           THEN true
    WHEN p_from = 'IN_USE'           AND p_to IN ('RETURNED','RELEASED')                    THEN true
    WHEN p_from = 'RETURNED'         AND p_to IN ('RELEASED')                               THEN true
    ELSE false
  END;
END;
$$;

CREATE OR REPLACE FUNCTION public.req_transition_ticket(
  p_ticket_id  UUID,
  p_new_status public.req_ticket_status,
  p_user_id    UUID,
  p_notes      TEXT DEFAULT NULL
) RETURNS public.req_tickets
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_ticket public.req_tickets;
BEGIN
  SELECT * INTO v_ticket FROM public.req_tickets WHERE id = p_ticket_id FOR UPDATE;
  IF NOT FOUND THEN RAISE EXCEPTION 'Ticket % não encontrado', p_ticket_id; END IF;

  IF NOT public.req_is_valid_transition(v_ticket.status, p_new_status) THEN
    RAISE EXCEPTION 'Transição inválida: % → %', v_ticket.status, p_new_status;
  END IF;

  UPDATE public.req_tickets SET
    status       = p_new_status,
    updated_at   = now(),
    submitted_at  = CASE WHEN p_new_status = 'SUBMITTED'  THEN now() ELSE submitted_at  END,
    quoted_at     = CASE WHEN p_new_status = 'QUOTING'    THEN now() ELSE quoted_at     END,
    approved_at   = CASE WHEN p_new_status = 'APPROVED'   THEN now() ELSE approved_at   END,
    rejected_at   = CASE WHEN p_new_status = 'REJECTED'   THEN now() ELSE rejected_at   END,
    purchased_at  = CASE WHEN p_new_status = 'PURCHASING' THEN now() ELSE purchased_at  END,
    received_at   = CASE WHEN p_new_status = 'RECEIVING'  THEN now() ELSE received_at   END,
    released_at   = CASE WHEN p_new_status IN ('RELEASED','IN_USE','RETURNED') THEN now() ELSE released_at END,
    cancelled_at  = CASE WHEN p_new_status = 'CANCELLED'  THEN now() ELSE cancelled_at  END
  WHERE id = p_ticket_id
  RETURNING * INTO v_ticket;

  INSERT INTO public.req_audit_logs(ticket_id, user_id, action, details, level, module, metadata)
  VALUES (
    p_ticket_id, p_user_id,
    'STATUS_CHANGED',
    COALESCE(p_notes, 'Status alterado para ' || p_new_status),
    'success',
    v_ticket.module::TEXT,
    jsonb_build_object('from', v_ticket.status, 'to', p_new_status)
  );

  RETURN v_ticket;
END;
$$;

CREATE OR REPLACE FUNCTION public.req_log_audit(
  p_ticket_id UUID,
  p_user_id   UUID,
  p_action    TEXT,
  p_details   TEXT,
  p_level     public.req_log_level,
  p_module    TEXT,
  p_metadata  JSONB DEFAULT '{}'
) RETURNS UUID
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE v_id UUID;
BEGIN
  INSERT INTO public.req_audit_logs(ticket_id, user_id, action, details, level, module, metadata)
  VALUES (p_ticket_id, p_user_id, p_action, p_details, p_level, p_module, p_metadata)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.req_is_admin() RETURNS BOOLEAN
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.req_profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.req_current_user_role()
RETURNS public.req_user_role
LANGUAGE plpgsql SECURITY DEFINER STABLE AS $$
DECLARE v_role public.req_user_role;
BEGIN
  SELECT role INTO v_role FROM public.req_profiles WHERE id = auth.uid();
  RETURN COALESCE(v_role, 'requester');
END;
$$;

CREATE OR REPLACE FUNCTION public.req_set_user_role(
  p_user_id UUID,
  p_role    public.req_user_role,
  p_tier    INTEGER DEFAULT NULL,
  p_limit   NUMERIC DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.req_profiles SET
    role           = p_role,
    approval_tier  = COALESCE(p_tier,  approval_tier),
    approval_limit = COALESCE(p_limit, approval_limit),
    updated_at     = now()
  WHERE id = p_user_id;
END;
$$;

-- ─── TRIGGER: updated_at automático ──────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

DO $$ BEGIN
  CREATE TRIGGER trg_req_tickets_updated_at
    BEFORE UPDATE ON public.req_tickets
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_req_profiles_updated_at
    BEFORE UPDATE ON public.req_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_req_departments_updated_at
    BEFORE UPDATE ON public.req_departments
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_req_suppliers_updated_at
    BEFORE UPDATE ON public.req_suppliers
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_req_quotations_updated_at
    BEFORE UPDATE ON public.req_quotations
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── TRIGGER: criar req_profile ao registrar usuário ─────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.req_profiles(id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'requester'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DO $$ BEGIN
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── RLS ─────────────────────────────────────────────────────
ALTER TABLE public.req_tickets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.req_ticket_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.req_quotations    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.req_approvals     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.req_audit_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.req_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.req_profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.req_departments   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.req_suppliers     ENABLE ROW LEVEL SECURITY;

-- Policies: req_tickets
DO $$ BEGIN
  CREATE POLICY "tickets_select" ON public.req_tickets FOR SELECT
    USING (
      requester_id = auth.uid()
      OR public.req_current_user_role() IN ('quoter','approver','buyer','receiver','admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tickets_insert" ON public.req_tickets FOR INSERT
    WITH CHECK (requester_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "tickets_update" ON public.req_tickets FOR UPDATE
    USING (public.req_current_user_role() IN ('approver','buyer','receiver','admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies: req_profiles
DO $$ BEGIN
  CREATE POLICY "profiles_select_own" ON public.req_profiles FOR SELECT
    USING (id = auth.uid() OR public.req_is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "profiles_update_own" ON public.req_profiles FOR UPDATE
    USING (id = auth.uid() OR public.req_is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies: req_departments
DO $$ BEGIN
  CREATE POLICY "departments_select" ON public.req_departments FOR SELECT
    USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "departments_manage" ON public.req_departments FOR ALL
    USING (public.req_is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies: req_suppliers
DO $$ BEGIN
  CREATE POLICY "suppliers_select" ON public.req_suppliers FOR SELECT
    USING (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "suppliers_manage" ON public.req_suppliers FOR ALL
    USING (public.req_current_user_role() IN ('quoter','buyer','admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies: req_quotations
DO $$ BEGIN
  CREATE POLICY "quotations_select" ON public.req_quotations FOR SELECT
    USING (
      EXISTS (SELECT 1 FROM public.req_tickets t WHERE t.id = ticket_id AND t.requester_id = auth.uid())
      OR public.req_current_user_role() IN ('quoter','approver','buyer','admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "quotations_manage" ON public.req_quotations FOR ALL
    USING (public.req_current_user_role() IN ('quoter','buyer','admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies: req_approvals
DO $$ BEGIN
  CREATE POLICY "approvals_select" ON public.req_approvals FOR SELECT
    USING (
      approver_id = auth.uid()
      OR public.req_current_user_role() IN ('admin','approver')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "approvals_manage" ON public.req_approvals FOR ALL
    USING (approver_id = auth.uid() OR public.req_is_admin());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies: req_audit_logs
DO $$ BEGIN
  CREATE POLICY "audit_select" ON public.req_audit_logs FOR SELECT
    USING (public.req_current_user_role() IN ('approver','buyer','receiver','admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies: req_notifications
DO $$ BEGIN
  CREATE POLICY "notif_own" ON public.req_notifications FOR ALL
    USING (user_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Policies: req_ticket_items
DO $$ BEGIN
  CREATE POLICY "items_select" ON public.req_ticket_items FOR SELECT
    USING (
      EXISTS (SELECT 1 FROM public.req_tickets t WHERE t.id = ticket_id AND t.requester_id = auth.uid())
      OR public.req_current_user_role() IN ('quoter','approver','buyer','admin')
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "items_manage" ON public.req_ticket_items FOR ALL
    USING (public.req_current_user_role() IN ('buyer','admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ─── DADOS INICIAIS: Módulos ──────────────────────────────────
INSERT INTO public.modules (slug, name, description, url, icon, color, sort_order) VALUES
  ('M1_PRODUTOS',  'Produtos',    'Requisição de produtos e materiais',        '/products',    'Package',  '#3b82f6', 1),
  ('M2_VIAGENS',   'Viagens',     'Solicitação de viagens corporativas',        '/travel',      'Plane',    '#8b5cf6', 2),
  ('M3_SERVICOS',  'Serviços',    'Contratação de serviços terceirizados',      '/services',    'Wrench',   '#10b981', 3),
  ('M4_MANUTENCAO','Manutenção',  'Ordens de manutenção preventiva/corretiva',  '/maintenance', 'Settings', '#f59e0b', 4),
  ('M5_FRETE',     'Frete',       'Gestão de fretes e transportes',             '/freight',     'Truck',    '#ef4444', 5),
  ('M6_LOCACAO',   'Locação',     'Locação de equipamentos e veículos',         '/rental',      'Key',      '#06b6d4', 6)
ON CONFLICT (slug) DO NOTHING;
