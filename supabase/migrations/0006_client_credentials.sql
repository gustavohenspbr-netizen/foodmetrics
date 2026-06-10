-- 1. CREATE TABLE FOR CLIENT CREDENTIALS
CREATE TABLE IF NOT EXISTS public.client_credentials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  username text,
  password text,
  url text,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.client_credentials ENABLE ROW LEVEL SECURITY;

-- 3. SELECT POLICY: Admins/managers/support (is_staff()) and clients themselves (via my_client_ids) can read
DROP POLICY IF EXISTS "credentials_read" ON public.client_credentials;
CREATE POLICY "credentials_read"
  ON public.client_credentials FOR SELECT
  USING (
    public.is_staff()
    OR client_id IN (select public.my_client_ids())
  );

-- 4. WRITE POLICY: Admins/managers/support (is_staff()) and clients themselves (via my_client_ids) can perform insert, update, delete
DROP POLICY IF EXISTS "credentials_write" ON public.client_credentials;
CREATE POLICY "credentials_write"
  ON public.client_credentials FOR ALL
  USING (
    public.is_staff()
    OR client_id IN (select public.my_client_ids())
  )
  WITH CHECK (
    public.is_staff()
    OR client_id IN (select public.my_client_ids())
  );
