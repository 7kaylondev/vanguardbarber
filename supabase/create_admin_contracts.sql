-- Create admin_contracts table for manual revenue tracking
CREATE TABLE IF NOT EXISTS public.admin_contracts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_name TEXT NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount >= 0),
    due_day INTEGER NOT NULL CHECK (due_day BETWEEN 1 AND 31),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE public.admin_contracts ENABLE ROW LEVEL SECURITY;

-- Only Admins can view/edit
CREATE POLICY "Allow Admin Full Access Contracts" ON public.admin_contracts
    USING (auth.role() = 'authenticated');
