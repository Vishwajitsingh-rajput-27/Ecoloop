# 🚀 EcoLoop — Complete Deployment Guide

## MongoDB Atlas + Express.js + React (Vite) + TypeScript

---

## 📋 Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [MongoDB Atlas Setup](#2-mongodb-atlas-setup)
3. [Local Development](#3-local-development)
4. [Seed the Database](#4-seed-the-database)
5. [API Endpoints Reference](#5-api-endpoints-reference)
6. [Production Deployment](#6-production-deployment)
7. [Docker Deployment](#7-docker-deployment)
8. [Cloud Platform Deployment](#8-cloud-platform-deployment)
9. [VPS Deployment (Ubuntu + Nginx)](#9-vps-deployment)
10. [Razorpay Integration](#10-razorpay-integration)
11. [Security Checklist](#11-security-checklist)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     EcoLoop Architecture                     │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│   ┌──────────────────┐          ┌──────────────────────┐    │
│   │   React Frontend │  ──────► │  Express.js Backend  │    │
│   │   (Vite + TS)    │  HTTP    │  (Node.js + TS)      │    │
│   │   Port: 5173     │  REST    │  Port: 3001          │    │
│   └──────────────────┘          └──────────┬───────────┘    │
│                                             │                │
│                                    Mongoose │                │
│                                             ▼                │
│                                  ┌──────────────────────┐   │
│                                  │   MongoDB Atlas      │   │
│                                  │   (Cloud Database)   │   │
│                                  │   Cluster0 — M0 Free │   │
│                                  └──────────────────────┘   │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│  Tech Stack:                                                 │
│  • Frontend: React 19, TypeScript, Tailwind CSS,             │
│              Framer Motion, Zustand, React Router             │
│  • Backend:  Express.js 5, Mongoose ODM, bcryptjs, JWT       │
│  • Database: MongoDB Atlas (M0 Free Tier — 512MB)            │
│  • Auth:     JWT tokens + bcrypt (12 rounds)                 │
│  • Payments: Razorpay (mock mode, production-ready hooks)    │
└─────────────────────────────────────────────────────────────┘
```

### Database Collections (6 Mongoose Models)

| Collection          | Description                                    |
|---------------------|------------------------------------------------|
| `users`             | User accounts, addresses, wishlist, notifications |
| `products`          | E-waste product listings with specs & images   |
| `orders`            | Orders with embedded items & status history    |
| `wallets`           | User wallet balances                           |
| `wallettransactions`| All wallet credits/debits/refunds              |
| `reviews`           | Product ratings & reviews                      |
| `categories`        | Product categories with icons                  |
| `paymentorders`     | Payment gateway order tracking                 |

---

## 2. MongoDB Atlas Setup

### Your Current Database

```
Cluster:    Cluster0
Region:     MongoDB Atlas Cloud
Database:   ecoloop
Connection: mongodb+srv://vishvajitrajput1238_db_user:***@cluster0.nq8iitq.mongodb.net/ecoloop
```

### Step-by-Step Atlas Configuration

#### A. Network Access (Allow Connections)

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) → Log in
2. Click **Network Access** (left sidebar)
3. Click **+ Add IP Address**
4. For development: Click **Allow Access from Anywhere** (`0.0.0.0/0`)
5. For production: Add only your server's IP address
6. Click **Confirm**

> ⚠️ **IMPORTANT**: If you get `MongoServerSelectionError`, your IP is not whitelisted. Always check Network Access first.

#### B. Database Access (User Credentials)

1. Go to **Database Access** (left sidebar)
2. Verify your user `vishvajitrajput1238_db_user` exists
3. Ensure it has **readWriteAnyDatabase** or **Atlas admin** privileges
4. If needed, click **Edit** → **Update Password**

#### C. Get Connection String

1. Go to **Database** → Click **Connect** on Cluster0
2. Choose **Drivers** → **Node.js**
3. Copy the connection string
4. Replace `<password>` with your actual password
5. Add `/ecoloop` as the database name before the `?`

Your connection string:
```
mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0
```

#### D. Verify Connection

```bash
# Install mongosh (MongoDB Shell)
brew install mongosh   # macOS
# or download from https://www.mongodb.com/try/download/shell

# Test connection
mongosh "mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop"

# Once connected, run:
show collections
db.users.countDocuments()
db.products.countDocuments()
```

---

## 3. Local Development

### Prerequisites

- **Node.js 18+**: [Download](https://nodejs.org/) — check with `node --version`
- **npm 9+**: Bundled with Node.js — check with `npm --version`
- **Git**: [Download](https://git-scm.com/)

### Step 1 — Clone & Install

```bash
git clone https://github.com/your-username/ecoloop.git
cd ecoloop
npm install
```

### Step 2 — Configure Environment

The `.env` file is already configured with your MongoDB Atlas credentials.

If starting fresh:
```bash
cp .env.example .env
# Edit .env with your MongoDB URI
```

Verify `.env` has:
```env
MONGODB_URI=mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0
PORT=3001
NODE_ENV=development
JWT_SECRET=ecoloop_jwt_secret_vishvajit_2024_change_in_production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001
```

### Step 3 — Seed the Database

```bash
npx tsx server/db/seed.ts
```

Expected output:
```
🌱 EcoLoop MongoDB Seed Script
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🗑️  Clearing existing data...
✅ Database cleared

📂 Seeding categories...
✅ 8 categories seeded
👤 Seeding users...
✅ 5 users seeded
💰 Seeding wallets...
✅ Wallets & transactions seeded
📦 Seeding products...
✅ 12 products seeded
⭐ Seeding reviews...
✅ 5 reviews seeded
🛒 Seeding orders...
✅ 2 orders seeded

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎉 Database seeded successfully!

📋 Demo accounts:
  🛒 Buyer:  ananya@example.com / password123
  🏪 Seller: rahul@example.com / password123
  🏪 Seller: techrefurb@example.com / password123
  👑 Admin:  admin@ecoloop.in / admin@ecoloop

💰 Wallet balances:
  Ananya:      ₹8,450
  Rahul:       ₹12,000
  TechRefurb:  ₹55,000
  Priya:       ₹18,000
```

### Step 4 — Start the Backend Server

```bash
# Terminal 1 — Backend (Express.js + MongoDB)
npx tsx watch server/index.ts
```

Expected output:
```
✅ MongoDB Atlas connected: cluster0-shard-00-02.nq8iitq.mongodb.net / db: ecoloop

🌿 EcoLoop API Server
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 Server running at: http://localhost:3001
🌐 Frontend URL:      http://localhost:5173
🏥 Health check:      http://localhost:3001/api/health
🗄️  Database:          MongoDB Atlas
📦 Environment:       development
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 5 — Start the Frontend

```bash
# Terminal 2 — Frontend (React + Vite)
npm run dev
```

Open http://localhost:5173 in your browser.

### Step 6 — Test the API

```bash
# Health check
curl http://localhost:3001/api/health

# Get products
curl http://localhost:3001/api/products

# Get categories
curl http://localhost:3001/api/categories

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ananya@example.com","password":"password123"}'

# Get wallet (with auth token from login response)
curl http://localhost:3001/api/wallet \
  -H "Authorization: Bearer <your-jwt-token>"
```

---

## 4. Seed the Database

### Re-seed (Reset All Data)

```bash
npx tsx server/db/seed.ts
```

> ⚠️ This **clears all existing data** before inserting fresh seed data.

### Demo Accounts After Seeding

| Role | Email | Password | Wallet Balance |
|------|-------|----------|----------------|
| 🛒 Buyer | ananya@example.com | password123 | ₹8,450 |
| 🏪 Seller | rahul@example.com | password123 | ₹12,000 |
| 🏪 Seller | techrefurb@example.com | password123 | ₹55,000 |
| 🏪 Seller | priya@example.com | password123 | ₹18,000 |
| 👑 Admin | admin@ecoloop.in | admin@ecoloop | ₹0 |

### Seeded Data

- **8 categories**: Smartphones, Laptops, Tablets, Components, Appliances, Audio, Cameras, Gaming
- **12 products**: iPhones, Dell laptops, MacBooks, GPUs, headphones, PS5, etc.
- **5 reviews**: With ratings, verified badges, helpful counts
- **2 orders**: One shipped, one delivered (for Ananya)
- **5 wallets**: With transaction history

---

## 5. API Endpoints Reference

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/me` | ✅ | Get current user |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/products` | ❌ | List/search with filters |
| GET | `/api/products/suggestions?q=` | ❌ | Autocomplete |
| GET | `/api/products/:id` | ❌ | Product detail |
| POST | `/api/products` | 🏪 Seller | Create listing |
| PUT | `/api/products/:id` | 🏪 Owner | Update listing |
| DELETE | `/api/products/:id` | 🏪 Owner | Soft delete |

### Orders
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/orders` | ✅ | Place order (uses MongoDB transactions) |
| GET | `/api/orders` | ✅ | User's orders |
| GET | `/api/orders/:id` | ✅ | Order detail |
| PUT | `/api/orders/:id/status` | 🏪/👑 | Update status |
| POST | `/api/orders/:id/cancel` | ✅ | Cancel + wallet refund |

### Wallet
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/wallet` | ✅ | Balance + transactions |
| POST | `/api/wallet/topup/initiate` | ✅ | Start payment |
| POST | `/api/wallet/topup/complete` | ✅ | Complete + credit |

### Users
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | ✅ | Profile |
| PUT | `/api/users/me` | ✅ | Update profile |
| POST | `/api/users/me/addresses` | ✅ | Add address |
| DELETE | `/api/users/me/addresses/:id` | ✅ | Delete address |
| POST | `/api/users/me/wishlist/:productId` | ✅ | Toggle wishlist |
| GET | `/api/users/me/wishlist` | ✅ | Wishlist products |

### Reviews
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/reviews/:productId` | ❌ | Product reviews |
| POST | `/api/reviews` | ✅ | Add review |
| PUT | `/api/reviews/:id/helpful` | ✅ | Mark helpful |

### Admin
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | 👑 | Dashboard metrics |
| GET | `/api/admin/users` | 👑 | All users |
| PUT | `/api/admin/users/:id/role` | 👑 | Change role |
| GET | `/api/admin/products` | 👑 | All products |
| GET | `/api/admin/orders` | 👑 | All orders |

### Categories
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/categories` | ❌ | All categories |

---

## 6. Production Deployment

### Build for Production

```bash
# Build frontend (creates dist/ folder)
VITE_API_URL=https://api.ecoloop.in npm run build

# The backend serves the built frontend in production mode
NODE_ENV=production npx tsx server/index.ts
```

### Environment Variables for Production

```env
MONGODB_URI=mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://ecoloop.in
JWT_SECRET=<generate-with-openssl-rand-hex-32>
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=rzp_live_your_key
RAZORPAY_KEY_SECRET=your_live_secret
```

---

## 7. Docker Deployment

### Dockerfile

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN VITE_API_URL=/api npm run build

FROM node:20-alpine AS runner
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY --from=builder /app/dist ./dist
COPY server ./server

ENV NODE_ENV=production
ENV PORT=3001

EXPOSE 3001

CMD ["npx", "tsx", "server/index.ts"]
```

### docker-compose.yml

```yaml
version: '3.8'

services:
  ecoloop:
    build: .
    ports:
      - "3001:3001"
    environment:
      - MONGODB_URI=mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0
      - JWT_SECRET=your_production_secret_here
      - NODE_ENV=production
      - PORT=3001
    restart: unless-stopped

  # Optional: Nginx reverse proxy with SSL
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - ecoloop
    restart: unless-stopped
```

### Run with Docker

```bash
# Build and start
docker-compose up -d --build

# Seed database (first time only)
docker-compose exec ecoloop npx tsx server/db/seed.ts

# View logs
docker-compose logs -f ecoloop

# Stop
docker-compose down
```

---

## 8. Cloud Platform Deployment

### Option A: Railway (Recommended — Easiest)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login & init
railway login
railway init

# 3. Set environment variables
railway variables set MONGODB_URI="mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0"
railway variables set JWT_SECRET="$(openssl rand -hex 32)"
railway variables set NODE_ENV="production"
railway variables set PORT="3001"

# 4. Deploy
railway up

# 5. Seed database
railway run npx tsx server/db/seed.ts

# 6. Get your public URL
railway open
```

**Cost**: ~$5/month for hobby plan

### Option B: Render.com

1. Go to [render.com](https://render.com) → New → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx tsx server/index.ts`
   - **Environment**: Node
4. Add environment variables in Render dashboard
5. Deploy

**Cost**: Free tier available (spins down after 15 min inactivity)

### Option C: Vercel (Frontend) + Railway (Backend)

```bash
# Deploy frontend to Vercel
vercel --prod
vercel env add VITE_API_URL production
# Enter: https://your-backend.railway.app

# Deploy backend to Railway (see Option A)
```

### Option D: AWS / DigitalOcean / Linode

See Section 9 (VPS Deployment) below.

---

## 9. VPS Deployment (Ubuntu + Nginx)

### Complete Setup on Ubuntu 22.04+

```bash
# ── 1. Server Setup ────────────────────────────────────────────
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git
sudo npm install -g pm2

# ── 2. Clone & Install ─────────────────────────────────────────
sudo mkdir -p /var/www/ecoloop
sudo chown $USER:$USER /var/www/ecoloop
git clone https://github.com/your-username/ecoloop.git /var/www/ecoloop
cd /var/www/ecoloop
npm install

# ── 3. Environment Variables ───────────────────────────────────
cp .env.example .env
nano .env
# Set:
#   MONGODB_URI=mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0
#   JWT_SECRET=<run: openssl rand -hex 32>
#   NODE_ENV=production
#   PORT=3001
#   FRONTEND_URL=https://ecoloop.in

# ── 4. Build Frontend ──────────────────────────────────────────
VITE_API_URL=https://ecoloop.in npm run build

# ── 5. Seed Database ───────────────────────────────────────────
npx tsx server/db/seed.ts

# ── 6. Start with PM2 ──────────────────────────────────────────
pm2 start "npx tsx server/index.ts" --name ecoloop
pm2 save
pm2 startup

# ── 7. Configure Nginx ─────────────────────────────────────────
sudo nano /etc/nginx/sites-available/ecoloop
```

#### Nginx Configuration

```nginx
server {
    server_name ecoloop.in www.ecoloop.in;

    # Frontend static files
    location / {
        root /var/www/ecoloop/dist;
        try_files $uri $uri/ /index.html;
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90s;
    }

    listen 80;
}
```

```bash
# ── 8. Enable Site & SSL ───────────────────────────────────────
sudo ln -s /etc/nginx/sites-available/ecoloop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# SSL with Let's Encrypt (free)
sudo certbot --nginx -d ecoloop.in -d www.ecoloop.in
# Auto-renewal: certbot auto-configures a cron job

# ── 9. Verify ──────────────────────────────────────────────────
curl https://ecoloop.in/api/health
pm2 status
pm2 logs ecoloop
```

---

## 10. Razorpay Integration

### Current State: Mock Mode ✅

The wallet top-up flow works in **mock mode** — it simulates payment success without a real payment gateway. This is perfect for development/demo.

### Go Live with Razorpay

#### Step 1: Get Keys

1. Sign up at [dashboard.razorpay.com](https://dashboard.razorpay.com)
2. Go to **Settings** → **API Keys**
3. Generate keys:
   - **Test keys**: `rzp_test_xxxxx` (for testing with test cards)
   - **Live keys**: `rzp_live_xxxxx` (for real payments)

#### Step 2: Install SDK

```bash
npm install razorpay
```

#### Step 3: Update `server/routes/wallet.ts`

Replace the **initiate** mock block:

```typescript
// ── BEFORE (Mock) ──────────────────────────────────
const paymentOrder = await PaymentOrder.create({
  userId: req.userId,
  amount,
  method,
  status: "pending",
  gatewayOrderId: `pay_mock_${Date.now()}`,
});

// ── AFTER (Production Razorpay) ────────────────────
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const rzpOrder = await razorpay.orders.create({
  amount: amount * 100,  // Razorpay uses paise
  currency: 'INR',
  receipt: `wallet_${req.userId}_${Date.now()}`,
  notes: { userId: req.userId, method },
});

const paymentOrder = await PaymentOrder.create({
  userId: req.userId,
  amount,
  method,
  status: "pending",
  gatewayOrderId: rzpOrder.id,
});
```

Replace the **complete** mock verification:

```typescript
// ── AFTER (Verify Razorpay Signature) ──────────────
import crypto from 'crypto';

const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

const expectedSig = crypto
  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest('hex');

if (expectedSig !== razorpaySignature) {
  return res.status(400).json({
    success: false,
    error: 'Payment verification failed. Signature mismatch.',
  });
}

// Then proceed to credit wallet...
```

#### Step 4: Frontend — Open Razorpay Checkout

```typescript
// In WalletPage.tsx or a payment hook
const options = {
  key: process.env.RAZORPAY_KEY_ID,
  amount: amount * 100,
  currency: 'INR',
  name: 'EcoLoop',
  description: 'Wallet Top-Up',
  order_id: paymentOrder.gatewayOrderId,
  handler: async function (response: any) {
    await fetch('/api/wallet/topup/complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({
        paymentOrderId: paymentOrder.id,
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
        amount,
        method,
      }),
    });
  },
  prefill: { name: user.name, email: user.email, contact: user.phone },
  theme: { color: '#10B981' },
};

const rzp = new (window as any).Razorpay(options);
rzp.open();
```

---

## 11. Security Checklist

### ✅ Already Implemented

- [x] **Helmet.js** — Secure HTTP headers
- [x] **Rate Limiting** — 200 req/15min (global), 10/15min (auth)
- [x] **bcryptjs** — Password hashing (12 salt rounds)
- [x] **JWT** — Stateless auth with 7-day expiry
- [x] **Input Validation** — On all API endpoints
- [x] **CORS** — Configured for frontend origin only
- [x] **MongoDB Injection Prevention** — Mongoose sanitizes by default
- [x] **Error Handling** — No stack traces in production responses

### ⬜ Do Before Production

- [ ] Generate strong JWT secret: `openssl rand -hex 32`
- [ ] Set `NODE_ENV=production`
- [ ] Enable HTTPS (Let's Encrypt / Cloudflare)
- [ ] Set CORS `origin` to exact production domain
- [ ] Restrict MongoDB Atlas Network Access to server IP only
- [ ] Enable MongoDB Atlas audit logging
- [ ] Set up automated database backups
- [ ] Add request logging (Morgan / Winston)
- [ ] Implement token refresh / revocation
- [ ] Add CSRF protection for cookie-based flows

---

## 12. Troubleshooting

### MongoDB Atlas Connection Issues

```
❌ MongoServerSelectionError: connect ECONNREFUSED
```
**Fix**: Go to Atlas → **Network Access** → Add your IP or `0.0.0.0/0` for dev

```
❌ MongooseError: Authentication failed
```
**Fix**: Check username/password in MONGODB_URI. Go to Atlas → **Database Access** → Edit user → Update password.

```
❌ MongooseError: connection timed out
```
**Fix**: 
1. Check your internet connection
2. Try a different network (some corporate firewalls block MongoDB ports)
3. Increase `serverSelectionTimeoutMS` in `database.ts`

### Backend Won't Start

```
❌ Error: Cannot find module 'mongoose'
```
**Fix**: Run `npm install`

```
❌ Error: JWT_SECRET is not defined
```
**Fix**: Check your `.env` file exists and has `JWT_SECRET` set

### Frontend Can't Reach Backend

```
❌ Network Error / CORS error
```
**Fix**:
1. Ensure backend is running on port 3001
2. Check `VITE_API_URL=http://localhost:3001` in `.env`
3. Check `FRONTEND_URL=http://localhost:5173` in `.env`

### Seed Script Fails

```
❌ Seed failed: MongoServerError: E11000 duplicate key error
```
**Fix**: The seed script clears all data before inserting. If you get duplicates, run it again. If the issue persists, drop the database manually:
```bash
mongosh "mongodb+srv://..." --eval "db.dropDatabase()"
npx tsx server/db/seed.ts
```

---

## 📁 Project File Structure

```
ecoloop/
├── .env                          # Environment variables (your MongoDB URI)
├── .env.example                  # Template for new developers
├── package.json                  # Dependencies (frontend + backend)
├── tsconfig.json                 # TypeScript config
├── vite.config.ts                # Vite build config
├── index.html                    # HTML entry point
├── DEPLOYMENT.md                 # ← This file
├── README.md                     # Project overview
│
├── server/                       # ══ BACKEND ══
│   ├── index.ts                  # Express app entry — CORS, routes, middleware
│   ├── db/
│   │   ├── database.ts           # MongoDB Atlas connection (Mongoose)
│   │   └── seed.ts               # Seed script — creates demo data
│   ├── middleware/
│   │   └── auth.ts               # JWT verify, requireAuth, requireRole
│   ├── models/
│   │   ├── User.ts               # User, Address, Notification schemas
│   │   ├── Product.ts            # Product listing schema
│   │   ├── Order.ts              # Order with embedded items
│   │   ├── Wallet.ts             # Wallet, WalletTransaction, PaymentOrder
│   │   ├── Review.ts             # Product review schema
│   │   └── Category.ts           # Product category schema
│   └── routes/
│       ├── auth.ts               # Register, login, /me
│       ├── products.ts           # CRUD + search + filters
│       ├── orders.ts             # Place, list, cancel (MongoDB transactions)
│       ├── wallet.ts             # Balance, top-up, Razorpay hooks
│       ├── users.ts              # Profile, addresses, wishlist, notifications
│       ├── reviews.ts            # Add/list reviews, helpful
│       ├── categories.ts         # List categories
│       └── admin.ts              # Admin dashboard, user management
│
├── src/                          # ══ FRONTEND ══
│   ├── App.tsx                   # React Router, layout, theme
│   ├── main.tsx                  # ReactDOM entry
│   ├── index.css                 # Tailwind + global styles
│   ├── services/
│   │   └── api.ts                # Mock API (used when backend unavailable)
│   ├── store/
│   │   └── useStore.ts           # Zustand global state
│   ├── types/
│   │   └── index.ts              # TypeScript interfaces
│   ├── components/
│   │   ├── layout/               # Header, Footer
│   │   ├── ui/                   # Button, Badge, Input, Modal, Toast
│   │   └── product/              # ProductCard
│   └── pages/
│       ├── HomePage.tsx           # Landing page with categories
│       ├── ProductsPage.tsx       # Search, filter, sort
│       ├── ProductDetailPage.tsx  # Gallery, specs, reviews
│       ├── CartPage.tsx           # Shopping cart
│       ├── CheckoutPage.tsx       # Address, payment, confirm
│       ├── OrdersPage.tsx         # Order history
│       ├── OrderDetailPage.tsx    # Status timeline
│       ├── WalletPage.tsx         # Balance, top-up, transactions
│       ├── ProfilePage.tsx        # Profile + addresses
│       ├── WishlistPage.tsx       # Saved products
│       ├── SellPage.tsx           # Create/edit listings
│       ├── DashboardPage.tsx      # Seller analytics
│       ├── AdminPage.tsx          # Admin dashboard
│       ├── AuthPage.tsx           # Login/Register
│       └── DeploymentGuidePage.tsx# This deployment guide
│
└── dist/                         # Built frontend (after npm run build)
```

---

**Built with ❤️ by EcoLoop — Making e-waste recycling accessible to everyone.**
