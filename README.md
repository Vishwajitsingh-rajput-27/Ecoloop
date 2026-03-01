# 🌿 EcoLoop — E-Waste Marketplace

A **production-ready full-stack e-waste marketplace** where users can buy and sell refurbished electronics, with an in-app wallet, UPI/card payments, and Amazon-like e-commerce features.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion, Zustand |
| **Backend** | Express.js 5, TypeScript, Node.js |
| **Database** | **MongoDB Atlas** (Mongoose ODM) |
| **Auth** | JWT + bcryptjs (12 salt rounds) |
| **Payments** | Razorpay (mock mode, production-ready) |

## 🚀 Quick Start

```bash
# 1. Install
npm install

# 2. Configure (already set up with MongoDB Atlas)
# .env file has your MongoDB URI

# 3. Seed database
npx tsx server/db/seed.ts

# 4. Start backend (Terminal 1)
npx tsx watch server/index.ts

# 5. Start frontend (Terminal 2)
npm run dev
```

## 👤 Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| 🛒 Buyer | ananya@example.com | password123 |
| 🏪 Seller | rahul@example.com | password123 |
| 👑 Admin | admin@ecoloop.in | admin@ecoloop |

## 📖 Full Deployment Guide

See [DEPLOYMENT.md](./DEPLOYMENT.md) or visit `/deployment` in the app.
