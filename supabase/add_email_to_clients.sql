-- Add Email to Clients table for easier display
ALTER TABLE public.clients
ADD COLUMN IF NOT EXISTS email text;

-- Optional: Create index on email
CREATE INDEX IF NOT EXISTS idx_clients_email ON public.clients(email);
