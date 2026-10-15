# Peso WiFi: captive portal + admin dashboard

Two parts in one project:

| Path | What it is |
| --- | --- |
| `/` | **Captive portal splash page** (`index.html`). The page customers see when they join the WiFi. Plans, "Pay using Blaggo", coin slot and voucher options, and a time-left countdown. |
| `/admin` | **Admin dashboard** (React, in `src/`). Sign-in, overview and orders, connected to Supabase. |

Both run in **demo mode** until you configure them, so you can click through everything right away.

## The captive portal (`index.html`)

The portal is one self-contained HTML file: styles, icons and script are all inside it,
with no fonts or libraries loaded from the internet. That's deliberate: phones have no
internet before they pay, so anything external would fail to load. You can copy the built
`dist/index.html` straight onto a router (for example a MikroTik hotspot `login.html`)
and it will work offline.

### Settings

Open `index.html` and edit the `CONFIG` block near the bottom:

- `networkName`, `merchantName`, `supportText`: your shop's details.
- `plans`: price in pesos, minutes, and an optional tag such as "Best value".
- `pesoMinutes`: minutes per ₱1 for the coin slot.
- `blaggo.appLink`: the link that opens the Blaggo app. Replace `blaggo://` with the
  official link from Blaggo.
- `blaggo.createPaymentUrl` / `blaggo.statusUrl`: your payment server. When these are
  empty, the page runs in demo mode with a "Simulate a successful payment" button.

To show Blaggo's official logo on the pay buttons, put the logo file you received from
Blaggo at `public/blaggo-logo.png`. If the file isn't there, the buttons show text only.

### How "Pay using Blaggo" works

1. The customer picks a plan and taps **Pay using Blaggo**.
2. The page calls `createPaymentUrl` (POST `{planId, amount, mac, ip}`) and your server
   replies with `{reference}`. The page shows the reference code and an **Open Blaggo** button.
3. The page checks `statusUrl?reference=...` every 3 seconds. Your server replies with
   `{status: "pending" | "paid" | "failed" | "expired", username, password}`.
4. When the status is `paid`, the page logs the device in on the router using the
   returned `username`/`password`, then shows the countdown.

The payment server is the part that talks to Blaggo's merchant API and to your router,
so it needs the API details from Blaggo (8Nexity Technology Corporation). Keep Blaggo
API keys on that server, never in this page.

### Router setup (important)

- **Walled garden:** before paying, customers have no internet, so the Blaggo app can't
  reach Blaggo either. Add Blaggo's API domains and your payment server's domain to the
  router's walled garden (allowed-before-login list). Ask Blaggo which domains to allow.
- **Device details:** the page reads `mac`, `ip`, `link-login-only` and `dst` from the URL.
  On MikroTik, redirect to the portal with
  `?mac=$(mac)&ip=$(ip)&link-login-only=$(link-login-only)&dst=$(link-orig)`.
- **Coin slot:** your vendo board's firmware can call `window.addCoin(5)` when a coin
  drops. In demo mode, ₱1/₱5/₱10 buttons stand in for real coins.
- **Phones' sign-in popups:** iPhones and some Androids open captive portals in a small
  popup browser. Switching to the Blaggo app can close that popup. The reference code is
  shown so customers can copy it first, and they can reopen the page from WiFi settings.

## The admin dashboard (`/admin`)

## 1. Run it locally

You need Node.js 18 or newer.

```bash
npm install
npm run dev
```

Open the link it prints (usually http://localhost:5173). The portal is at `/` and the dashboard at `/admin`.

## 2. Connect Supabase

1. Create a project at https://supabase.com (pick the Singapore region if you're in Southeast Asia).
2. In the Supabase **SQL Editor**, run this to create the orders table:

```sql
create table public.orders (
  id bigint generated always as identity primary key,
  customer_name text not null,
  customer_email text,
  amount numeric(10,2) not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'shipped', 'cancelled')),
  created_at timestamptz not null default now()
);

-- Row Level Security: only signed-in users can read and update orders.
alter table public.orders enable row level security;

create policy "Signed-in users can read orders"
  on public.orders for select to authenticated using (true);

create policy "Signed-in users can update orders"
  on public.orders for update to authenticated using (true);

-- Optional: a few test rows
insert into public.orders (customer_name, customer_email, amount, status) values
  ('Maria Santos', 'maria@example.com', 1250, 'paid'),
  ('Juan Dela Cruz', 'juan@example.com', 980, 'pending'),
  ('Ana Reyes', 'ana@example.com', 2430, 'shipped');
```

3. Create your admin login: **Authentication > Users > Add user** (email + password).
   Then turn off public sign-ups under **Authentication > Sign In / Providers**
   so strangers can't create accounts.
4. Copy `.env.example` to `.env.local` and fill in the values from
   **Project Settings > API** (Project URL and the `anon` public key).
5. Restart `npm run dev`. The "Demo data" tag disappears and you'll see the sign-in page.

> Never put the `service_role` key in this app. Everything here runs in the
> browser, so only the `anon` key belongs here; Row Level Security is what
> keeps the data safe.

## 3. Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On https://vercel.com, click **Add New > Project** and import the repo.
   Vercel detects Vite automatically.
3. Under **Environment Variables**, add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
4. Click **Deploy**.

`vercel.json` is already included so refreshing pages like `/admin/orders` works.
On Netlify or Cloudflare Pages, use build command `npm run build`, output folder `dist`,
and add a rewrite from `/admin/*` to `/admin/index.html`.

## Where to change things

| What | File |
| --- | --- |
| Portal plans, prices, Blaggo settings | `index.html` (`CONFIG` block) |
| Currency and date format | `src/lib/format.js` |
| Colors, spacing, breakpoints | `src/styles.css` (top of file) |
| Menu items | `src/components/Layout.jsx` (`NAV`) |
| Supabase queries | `src/lib/data.js` |
| Add a page | create it in `src/pages/`, add a route in `src/App.jsx` and a menu item in `Layout.jsx` |
