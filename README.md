## TableQR Web

Next.js + TypeScript + Supabase project for managing store menus and waitlists.

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

## Environment Variables

Create a `.env.local` file with the following values. All keys prefixed with `NEXT_PUBLIC_` are used on the client.

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_VAPID_KEY=...
```

## Queue Notification Flow

1. Customers enter their queue number on the waitlist page (`WaitlistClientBoard`).
2. The browser requests FCM permissions, obtains a token, and sends `{ store_id, queue_number, fcm_token }` to `/api/stores/[storeId]/queue-notifications`.
3. Tokens are stored in the `queue_notifications` table (create via Supabase migration).
4. Admins mark a queue as ready by calling `POST /api/stores/[storeId]/queues/[queueNumber]/ready`.
5. A Supabase trigger captures the status change, writes to `queue_notifications` (e.g. mark as `pending`) and invokes an Edge Function.
6. A scheduled Edge Function (cron) reads pending rows and sends FCM push notifications.
7. Customers receive “주문이 준비되었습니다” notifications in the browser.

> Ensure the `queue_notifications` table exists:

```sql
create table if not exists queue_notifications (
  id bigserial primary key,
  store_id bigint not null references stores(store_id) on delete cascade,
  queue_number int not null,
  fcm_token text not null,
  created_at timestamp with time zone default now() not null
);
```

## Scripts

- `npm run dev` – start the development server
- `npm run build` – build for production
- `npm run start` – run the production build
