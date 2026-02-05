# Agenda & Metrics Audit
Date: 2026-02-05

## 1. Routes & Components

### Dashboard (Main)
- **Route**: `/dashboard`
- **File**: `src/app/(main)/dashboard/page.tsx`
- **Mini Agenda Component**: `AgendaList` (`src/components/dashboard/agenda-list.tsx`)
- **Stats Component**: `DashboardStats`
- **Key Features**: 
  - Dynamic Date Filter (URL params: `?date=`, `?start=`, `?end=`)
  - Metrics Calculation (Revenue, Sales, New Clients)
  - Timeline View (Today/Period Events)

### Appointments (Full Agenda)
- **Route**: `/dashboard/agendamentos`
- **File**: `src/app/(main)/dashboard/agendamentos/page.tsx`
- **Client Component**: `AppointmentsClient` (`src/components/dashboard/appointments-client.tsx`)
- **Key Features**:
  - Full History List
  - Mobile Cards / Desktop Table
  - Operational Actions (Start, Sale, Finish)

## 2. Supabase Queries

### Dashboard (`dashboard/page.tsx`)
- **Usage**: Fetching data for charts, stats, and mini-list.
- **Table**: `agendamentos`
- **Filters**:
  - `barbershop_id`
  - `.gte('date', start)`
  - `.lte('date', end)`
  - `.order('date'), .order('time')`
- **Relations**:
  - `clients (name, phone)`
  - `professionals (name)`
  - `products_v2 (name, price)`
  - `appointment_products (price, quantity)`

### Appointments Page (`dashboard/agendamentos/page.tsx`)
- **Usage**: Fetching full list.
- **Table**: `agendamentos`
- **Strategy**: Manual Join (Fetch Appointments -> Fetch AppointmentProducts -> Merge) to avoid `PGRST200` error.
- **Filters**: Same as Dashboard (Date Range).

## 3. Metrics Calculation (Source of Truth)

### Revenue (Faturamento)
- **Source**: `periodAppointments` (array in `dashboard/page.tsx`)
- **Logic**:
  - Filter: `status` is 'confirmed' OR 'completed'.
  - Base Value: `app.price` (Total Snapshot) ?? `app.products_v2.price` (Service Price).
  - **Issue Identification**: If `app.price` is not updated with extra items, Revenue = Service Price only.
  - Calculation:
    ```typescript
    total = app.price ?? service_price
    revenue += total
    ```

### Sales (Vendas)
- **Source**: Count of `periodAppointments` where status is 'confirmed' or 'completed'.

### Services vs Products
- **Services**: `total - products_sum`
- **Products**: `sum(appointment_products.price * quantity)`

## 4. Stability Check
- **Mini Agenda**: Relying on `events` prop passed from Dashboard Page.
- **Navigation**: `AgendaList` currently navigates to `?period=30` (Dashboard filter) instead of `/dashboard/agendamentos`. **Action Required: Fix Link.**
