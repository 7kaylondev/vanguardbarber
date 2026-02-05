CREATE TABLE IF NOT EXISTS public.appointment_products (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id uuid NOT NULL REFERENCES public.agendamentos(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products_v2(id) ON DELETE SET NULL,
  name text NOT NULL,
  quantity int NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE public.appointment_products ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Appt Products" ON public.appointment_products;
CREATE POLICY "Public Read Appt Products" ON public.appointment_products FOR SELECT USING (true);

DROP POLICY IF EXISTS "Owner Manage Appt Products" ON public.appointment_products;
CREATE POLICY "Owner Manage Appt Products" ON public.appointment_products FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.agendamentos a
    WHERE a.id = appointment_products.appointment_id
    AND a.barbershop_id IN (
      SELECT id FROM public.barbershops WHERE owner_id = auth.uid()
    )
  )
);
