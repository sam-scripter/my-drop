# 🚚 mydrop

> **Your customers always know where their order is.**

mydrop is a real-time delivery tracking platform built for Kenyan SMEs. Every delivery gets a live tracking link the customer can follow on their phone — no app download, no phone calls, no confusion.

**Live:** [mydrop.duckdns.org](https://mydrop.duckdns.org)

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Web Dashboard Setup](#web-dashboard-setup)
  - [Flutter App Setup (Android)](#flutter-app-setup-android)
  - [Flutter App Setup (iOS)](#flutter-app-setup-ios)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Deployment](#deployment)
- [Architecture](#architecture)
- [API Reference](#api-reference)
- [Subscription Tiers](#subscription-tiers)
- [Contributing](#contributing)

---

## Overview

mydrop solves a specific problem: SME delivery operations managed over WhatsApp create chaos — missed assignments, no visibility, and customers calling every 5 minutes asking where their order is.

The flow is simple:

1. Manager creates an order on the dashboard
2. Manager assigns a rider from their fleet
3. Customer receives a tracking link automatically
4. Customer watches the rider move on a map in real time
5. Rider confirms delivery with a PIN
6. Customer rates the experience

No customer app required. Works on any phone, any browser.

---

## Features

### Management Dashboard (Web)
- Create and manage delivery orders
- Add riders — credentials emailed automatically
- Assign riders to orders with one click
- Real-time order status tracking
- Analytics: orders today, delivery rate, avg delivery time
- Reports: revenue, trends, top performers
- Customer feedback and ratings
- Subscription management

### Customer Tracking Page (Web)
- Live rider location on Google Maps
- Status progress bar with business-type-aware labels
- Delivery PIN confirmation
- ETA display
- Post-delivery rating prompt
- Works on any browser, no app required

### Rider App (Flutter — Android & iOS)
- Login with emailed credentials
- View assigned deliveries
- Navigate to customer via Google Maps
- Stream GPS location in real time via Firebase
- Confirm delivery with customer PIN
- Force password change on first login

### Platform Features
- Multi-tenant: each business is fully isolated
- Business types: Food, Retail, Pharmacy, Courier, Other
- Subscription tiers with usage limits
- 14-day free trial on signup
- Email notifications via Gmail SMTP
- Password reset flow
- Google Places Autocomplete for delivery addresses

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Node.js + Express |
| Database | PostgreSQL 15 |
| ORM | Prisma 5.22 |
| Mobile App | Flutter (Android + iOS) |
| Web Dashboard | React + Vite |
| Real-time GPS | Firebase Firestore |
| Push Notifications | Firebase Cloud Messaging (FCM) |
| File Storage | Cloudflare R2 |
| Email | Nodemailer + Gmail SMTP |
| Maps | Google Maps Platform |
| Infrastructure | Oracle Free Tier VPS (ARM64, Ubuntu 22.04) |
| Reverse Proxy | Nginx (Docker) |
| CI/CD | GitHub Actions |
| Container Registry | GitHub Container Registry (GHCR) |

---

## Repository Structure

```
mydrop/
├── backend/                  # Node.js API
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── migrations/       # Migration history
│   ├── scripts/
│   │   ├── security-audit.js         # Multi-tenant security tests
│   │   └── reset-monthly-counts.js   # Monthly cron job
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   ├── middleware/       # Auth, validation, subscription limits
│   │   ├── routes/           # API route definitions
│   │   ├── services/         # Email, Firebase, notifications
│   │   └── utils/            # Prisma client, JWT, business type helpers
│   ├── server.js             # Entry point
│   ├── docker-compose.yml    # Backend + DB containers
│   └── Dockerfile
│
├── web/                      # React dashboard + tracking page
│   ├── src/
│   │   ├── components/       # DashboardLayout, LocationPicker, etc.
│   │   ├── hooks/            # useWindowSize
│   │   ├── pages/            # All page components
│   │   ├── theme.js          # Design tokens (orange/navy)
│   │   ├── api.js            # Axios instance with JWT interceptor
│   │   └── auth.js           # Auth helpers (localStorage)
│   └── index.html
│
├── app/                      # Flutter mobile app
│   ├── lib/
│   │   ├── core/             # Theme, constants, router
│   │   ├── models/           # Data models
│   │   ├── providers/        # Riverpod state management
│   │   ├── screens/
│   │   │   ├── auth/         # Login, change password
│   │   │   ├── manager/      # Dashboard, orders, riders, create order
│   │   │   └── rider/        # Home, active delivery
│   │   └── services/         # API, auth, Firebase, location, GPS
│   ├── android/              # Android-specific config
│   ├── ios/                  # iOS-specific config
│   └── IOS_SETUP.md          # iOS setup guide for macOS developers
│
└── .github/
    └── workflows/
        ├── deploy-backend.yml    # Build + push Docker image, deploy to VPS
        └── deploy-web.yml        # Build React, copy to VPS via SCP
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15
- Flutter 3.x SDK
- Docker + Docker Compose
- A Google Cloud project with Maps + Places APIs enabled
- A Firebase project with Firestore + FCM enabled

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file (see [Environment Variables](#environment-variables) below).

Run database migrations:

```bash
npx prisma migrate dev
npx prisma generate
```

Start the dev server:

```bash
npm run dev
```

The API runs on `http://localhost:3000`.

Run the security audit to verify multi-tenant isolation:

```bash
node scripts/security-audit.js
```

All 10 checks should pass.

---

### Web Dashboard Setup

```bash
cd web
npm install
```

Create a `.env` file:

```bash
VITE_API_BASE_URL=http://localhost:3000/api
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Start the dev server:

```bash
npm run dev
```

Dashboard runs on `http://localhost:5173`.

---

### Flutter App Setup (Android)

```bash
cd app
flutter pub get
flutter run
```

The app connects to the production API by default. To point it to your local backend, update `lib/core/constants.dart`:

```dart
static const String apiBaseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
// or your local machine's IP for a real device
```

---

### Flutter App Setup (iOS)

See [`app/IOS_SETUP.md`](app/IOS_SETUP.md) for the full guide.

Quick summary for macOS developers:

```bash
cd app
flutter pub get
cd ios && pod install && cd ..
open ios/Runner.xcworkspace   # Set your Apple ID as signing team
flutter run
```

No Apple Developer account required for running on your own device.

---

## Environment Variables

### Backend (`backend/.env`)

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mydrop_dev

# JWT
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret

# Email (Gmail SMTP)
EMAIL_FROM=your_gmail@gmail.com
EMAIL_APP_PASSWORD=your_16_char_app_password
EMAIL_FROM_NAME=mydrop
SUPPORT_EMAIL=support@yourdomain.com

# Firebase Admin (for FCM push notifications)
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your_project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# App
APP_URL=https://mydrop.duckdns.org
ALLOWED_ORIGINS=https://mydrop.duckdns.org,http://localhost:5173
NODE_ENV=development

# Optional — SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_SMS_FROM=+1xxxxxxxxxx
```

### Web (`web/.env`)

```bash
VITE_API_BASE_URL=https://mydrop.duckdns.org/api
VITE_GOOGLE_MAPS_API_KEY=your_key
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## Database

### Schema overview

| Model | Purpose |
|---|---|
| `Business` | Tenant — each signup creates one |
| `User` | Managers and riders, scoped to a business |
| `Order` | A delivery request |
| `Delivery` | Created when a rider is assigned to an order |
| `LocationSnapshot` | GPS history during a delivery |
| `PasswordResetToken` | Time-limited tokens for password reset |
| `SubscriptionPayment` | Payment records for billing |

### Key design decisions

- Every `Order` and `User` record has a `business_id` foreign key
- Every API endpoint filters by `req.user.businessId` from the JWT
- Business A can never read Business B's data — verified by the security audit script
- Firestore is used only for real-time GPS streaming during active deliveries — coordinates are not stored permanently in PostgreSQL

### Useful commands

```bash
# Open Prisma Studio (local DB browser)
npx prisma studio

# Reset all data (keeps schema)
docker exec mydrop-db psql -U mydrop_user -d mydrop -c "
TRUNCATE TABLE \"PasswordResetToken\", \"SubscriptionPayment\",
\"LocationSnapshot\", \"Delivery\", \"Order\", \"User\", \"Business\"
RESTART IDENTITY CASCADE;
"

# Run a migration
npx prisma migrate dev --name describe_your_change

# Generate Prisma client after schema change
npx prisma generate
```

---

## Deployment

### Infrastructure

- **VPS:** Oracle Free Tier ARM64, Ubuntu 22.04
- **Domain:** mydrop.duckdns.org (DuckDNS free dynamic DNS)
- **SSL:** Let's Encrypt via Certbot
- **Reverse proxy:** Nginx in Docker (`ksg_nginx` container)
- **Backend:** Dockerized Node.js app (`mydrop-api` container)
- **Database:** PostgreSQL in Docker (`mydrop-db` container)

### CI/CD

Pushing to `main` triggers two GitHub Actions workflows:

**`deploy-backend.yml`**
1. Builds a multi-arch Docker image (amd64 + arm64)
2. Pushes to GitHub Container Registry (GHCR)
3. SSH into VPS, pulls new image, restarts container
4. Runs `prisma migrate deploy` on startup

**`deploy-web.yml`**
1. Builds React app with Vite
2. Injects environment variables from GitHub Secrets
3. SCP built files to `~/mydrop/web/` on VPS
4. Reloads Nginx

### Required GitHub Secrets

```
VPS_HOST
VPS_USER
VPS_SSH_KEY
GHCR_TOKEN
VITE_API_BASE_URL
VITE_GOOGLE_MAPS_API_KEY
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID
```

### VPS Cron Jobs

```bash
# DuckDNS renewal (every 30 min)
*/30 * * * * ~/duckdns/duck.sh >/dev/null 2>&1

# Daily database backup at 2am (7-day retention)
0 2 * * * /home/ubuntu/mydrop/backup.sh >> /home/ubuntu/mydrop/backups/backup.log 2>&1

# Reset monthly order counts on 1st of month
0 0 1 * * docker exec mydrop-api node scripts/reset-monthly-counts.js >> ~/mydrop/backups/cron.log 2>&1

# Daily trial expiry check at 9am
0 9 * * * docker exec mydrop-api node scripts/reset-monthly-counts.js >> ~/mydrop/backups/cron.log 2>&1
```

---

## Architecture

```
Customer browser          Manager browser          Rider phone
      │                        │                       │
      │  GET /track/:token      │  Dashboard API calls  │  Flutter app API calls
      ▼                        ▼                       ▼
   ┌─────────────────────────────────────────────────────┐
   │                    Nginx (HTTPS)                    │
   │              mydrop.duckdns.org                     │
   └──────────┬──────────────────────┬───────────────────┘
              │                      │
              ▼                      ▼
     React static files       Node.js API (Express)
     (web/dist via Nginx)     port 3000 in Docker
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                 ▼
              PostgreSQL        Firebase           Gmail SMTP
              (orders, users,   (real-time GPS,    (transactional
               billing)          FCM push)          emails)
```

**Real-time GPS flow:**

```
Rider phone (Flutter)
  → writes lat/lng to Firestore every 3 seconds
    → Customer browser listens via onSnapshot
      → Marker animates smoothly on Google Maps
```

---

## API Reference

All endpoints (except public ones) require a JWT in the `Authorization: Bearer <token>` header.

### Auth (public)
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register a new business |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/forgot-password` | Request password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |

### Orders
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/orders` | List orders (filter by status) |
| POST | `/api/orders` | Create order |
| GET | `/api/orders/:id` | Get single order |
| POST | `/api/orders/:id/assign` | Assign rider |
| PUT | `/api/orders/:id/status` | Update status |
| PUT | `/api/orders/:id/rate` | Submit customer rating (public) |
| GET | `/api/track/:token` | Public tracking endpoint |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/riders` | List riders |
| POST | `/api/users/rider` | Create rider account |
| PUT | `/api/users/me` | Update own profile |
| PUT | `/api/users/change-password` | Change password |
| PUT | `/api/users/fcm-token` | Update FCM token |
| PUT | `/api/users/riders/:id/toggle` | Activate/deactivate rider |

### Business
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/business/me` | Get business details |
| PUT | `/api/business/me` | Update business details |

### Analytics & Reports
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/analytics/today` | Today's summary stats |
| GET | `/api/reports` | Reports for a period |
| GET | `/api/feedback` | Customer ratings |

### Subscription
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/subscription` | Current plan, usage, limits |
| GET | `/api/subscription/history` | Payment history |
| POST | `/api/subscription/payment` | Record M-Pesa payment |

### Other
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/contact` | Contact form submission (public) |
| GET | `/health` | Health check |

---

## Subscription Tiers

| Feature | Free | Starter | Growth | Scale |
|---|---|---|---|---|
| Orders/month | 30 | 200 | 1,000 | Unlimited |
| Rider accounts | 1 | 5 | 20 | Unlimited |
| Reports | ✗ | ✓ | ✓ | ✓ |
| Custom branding | ✗ | ✗ | ✓ | ✓ |
| API access | ✗ | ✗ | ✗ | ✓ |
| Price (KES/month) | 0 | 1,500 | 4,000 | 10,000 |

All new signups start with a 14-day free trial at Starter limits. No credit card required.

Payment is via M-Pesa Paybill. The subscription system is built to support Daraja API automation in a future release — currently payments are recorded manually via the admin endpoint.

---

## Contributing

This is a private project built for [AngaCore Labs](https://angacorelabs.com). If you're a team member:

### Branching strategy

- `main` — production, auto-deploys on push
- `develop` — integration branch
- Personal branches — `ruth/feature-name`, `joan/feature-name`, `sam/feature-name`

### Before pushing

1. Run the security audit and confirm 10/10:
   ```bash
   cd backend && node scripts/security-audit.js
   ```

2. Run migrations locally:
   ```bash
   npx prisma migrate dev
   ```

3. Test locally with `npm run dev` before pushing to `main`

### Code style

- All files have a comment block at the top explaining what the file does and why
- Controllers include JSDoc for every function
- Never hardcode business_id — always use `req.user.businessId` from JWT middleware

---

## Known Limitations (v1)

- SMS notifications require a paid Twilio account or Africa's Talking shortcode — currently manual via WhatsApp
- WhatsApp Business API requires Meta approval — planned post-launch
- Reports revenue data requires managers to enter order values when creating orders — optional field
- iOS build requires macOS (see `app/IOS_SETUP.md`)
- Multi-manager support (multiple managers per business) is not yet implemented
- Payment activation is manual — Daraja API automation planned for v2

---

## License

Private — All rights reserved © 2026 AngaCore Labs
