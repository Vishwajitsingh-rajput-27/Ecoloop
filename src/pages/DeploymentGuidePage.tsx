import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'atlas' | 'local' | 'backend' | 'frontend' | 'docker' | 'cloud' | 'vps' | 'razorpay' | 'security' | 'api';

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: 'atlas', label: 'MongoDB Atlas', icon: '🍃' },
  { id: 'local', label: 'Local Dev', icon: '💻' },
  { id: 'backend', label: 'Backend', icon: '⚙️' },
  { id: 'frontend', label: 'Frontend', icon: '🎨' },
  { id: 'api', label: 'API Reference', icon: '📡' },
  { id: 'docker', label: 'Docker', icon: '🐳' },
  { id: 'cloud', label: 'Cloud Deploy', icon: '☁️' },
  { id: 'vps', label: 'VPS (Nginx)', icon: '🖥️' },
  { id: 'razorpay', label: 'Razorpay', icon: '💳' },
  { id: 'security', label: 'Security', icon: '🔒' },
];

function CodeBlock({ code, title }: { code: string; title?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {title && (
        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-mono text-gray-500 dark:text-gray-400 flex justify-between items-center">
          <span>{title}</span>
          <button onClick={copy} className="text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
            {copied ? '✅ Copied!' : '📋 Copy'}
          </button>
        </div>
      )}
      <pre className="bg-gray-900 text-green-400 p-4 overflow-x-auto text-sm leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{title}</h3>
      <div className="text-gray-700 dark:text-gray-300 space-y-3">{children}</div>
    </div>
  );
}

function AtlasTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="🍃 Your MongoDB Atlas Database">
        <div className="bg-emerald-50 dark:bg-emerald-900/30 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
          <table className="w-full text-sm">
            <tbody>
              <tr><td className="font-semibold py-1 pr-4">Cluster</td><td>Cluster0 (M0 Free Tier — 512MB)</td></tr>
              <tr><td className="font-semibold py-1 pr-4">Database</td><td>ecoloop</td></tr>
              <tr><td className="font-semibold py-1 pr-4">User</td><td>vishvajitrajput1238_db_user</td></tr>
              <tr><td className="font-semibold py-1 pr-4">Host</td><td>cluster0.nq8iitq.mongodb.net</td></tr>
              <tr><td className="font-semibold py-1 pr-4">ODM</td><td>Mongoose 8.x</td></tr>
            </tbody>
          </table>
        </div>
        <CodeBlock
          title="Connection String (.env)"
          code={`MONGODB_URI=mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0`}
        />
      </SectionCard>

      <SectionCard title="📋 Collections (8 total)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'users', desc: 'Accounts, addresses, wishlist, notifications', icon: '👤' },
            { name: 'products', desc: 'E-waste listings with specs, images, eco-impact', icon: '📦' },
            { name: 'orders', desc: 'Orders with embedded items & status history', icon: '🛒' },
            { name: 'wallets', desc: 'User wallet balances', icon: '💰' },
            { name: 'wallettransactions', desc: 'Top-ups, debits, refunds', icon: '📊' },
            { name: 'reviews', desc: 'Ratings & reviews with verified badge', icon: '⭐' },
            { name: 'categories', desc: 'Product categories with icons', icon: '📂' },
            { name: 'paymentorders', desc: 'Payment gateway tracking', icon: '💳' },
          ].map((c) => (
            <div key={c.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
              <div className="font-mono text-sm font-bold text-emerald-600 dark:text-emerald-400">{c.icon} {c.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="🔧 Atlas Configuration Steps">
        <div className="space-y-4">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">1. Network Access (Allow IP)</h4>
            <p className="text-sm">Atlas → Network Access → Add IP → <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">0.0.0.0/0</code> for dev</p>
            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">⚠️ For production, whitelist only your server IP</p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">2. Database Access (User)</h4>
            <p className="text-sm">Verify <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">vishvajitrajput1238_db_user</code> has <strong>readWriteAnyDatabase</strong></p>
          </div>
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">3. Verify Connection</h4>
            <CodeBlock title="Test with mongosh" code={`mongosh "mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop"\n\n# Once connected:\nshow collections\ndb.users.countDocuments()\ndb.products.find().limit(2).pretty()`} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="🌱 Seed the Database">
        <p>Run this command to populate demo data (12 products, 5 users, orders, reviews):</p>
        <CodeBlock title="Terminal" code={`npx tsx server/db/seed.ts`} />
        <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 mt-3">
          <p className="font-bold text-blue-800 dark:text-blue-300 text-sm">Demo Accounts After Seeding:</p>
          <table className="w-full text-xs mt-2">
            <thead><tr className="text-left"><th className="py-1">Role</th><th>Email</th><th>Password</th><th>Wallet</th></tr></thead>
            <tbody>
              <tr><td>🛒 Buyer</td><td>ananya@example.com</td><td>password123</td><td>₹8,450</td></tr>
              <tr><td>🏪 Seller</td><td>rahul@example.com</td><td>password123</td><td>₹12,000</td></tr>
              <tr><td>🏪 Seller</td><td>techrefurb@example.com</td><td>password123</td><td>₹55,000</td></tr>
              <tr><td>👑 Admin</td><td>admin@ecoloop.in</td><td>admin@ecoloop</td><td>₹0</td></tr>
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}

function LocalTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="🚀 Quick Start (5 Steps)">
        <div className="space-y-4">
          <div>
            <h4 className="font-bold">Step 1 — Install Dependencies</h4>
            <CodeBlock title="Terminal" code={`git clone https://github.com/your-username/ecoloop.git\ncd ecoloop\nnpm install`} />
          </div>
          <div>
            <h4 className="font-bold">Step 2 — Configure .env</h4>
            <CodeBlock title=".env" code={`MONGODB_URI=mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0\nPORT=3001\nNODE_ENV=development\nJWT_SECRET=ecoloop_jwt_secret_vishvajit_2024_change_in_production\nJWT_EXPIRES_IN=7d\nFRONTEND_URL=http://localhost:5173\nVITE_API_URL=http://localhost:3001`} />
          </div>
          <div>
            <h4 className="font-bold">Step 3 — Seed Database</h4>
            <CodeBlock title="Terminal" code={`npx tsx server/db/seed.ts`} />
          </div>
          <div>
            <h4 className="font-bold">Step 4 — Start Backend (Terminal 1)</h4>
            <CodeBlock title="Terminal 1" code={`npx tsx watch server/index.ts\n# → http://localhost:3001`} />
          </div>
          <div>
            <h4 className="font-bold">Step 5 — Start Frontend (Terminal 2)</h4>
            <CodeBlock title="Terminal 2" code={`npm run dev\n# → http://localhost:5173`} />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="✅ Verify Everything Works">
        <CodeBlock title="Test API" code={`# Health check\ncurl http://localhost:3001/api/health\n\n# Get products\ncurl http://localhost:3001/api/products\n\n# Login\ncurl -X POST http://localhost:3001/api/auth/login \\\n  -H "Content-Type: application/json" \\\n  -d '{"email":"ananya@example.com","password":"password123"}'`} />
      </SectionCard>
    </div>
  );
}

function BackendTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="⚙️ Backend Architecture">
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 font-mono text-xs leading-relaxed">
          <pre>{`server/
├── index.ts              ← Express app, CORS, rate limiting, all routes
├── db/
│   ├── database.ts       ← MongoDB Atlas connection (Mongoose)
│   └── seed.ts           ← Seed script (12 products, 5 users, etc.)
├── middleware/
│   └── auth.ts           ← JWT verify, requireAuth, requireRole
├── models/
│   ├── User.ts           ← User + Address + Notification schemas
│   ├── Product.ts        ← Product listing (text search index)
│   ├── Order.ts          ← Order + embedded items + status history
│   ├── Wallet.ts         ← Wallet + WalletTransaction + PaymentOrder
│   ├── Review.ts         ← Review (unique per user-product)
│   └── Category.ts       ← Categories with product counts
└── routes/
    ├── auth.ts           ← Register, login, /me
    ├── products.ts       ← CRUD + search + autocomplete
    ├── orders.ts         ← Place, list, cancel (MongoDB transactions)
    ├── wallet.ts         ← Balance, top-up (Razorpay mock)
    ├── users.ts          ← Profile, addresses, wishlist, notifications
    ├── reviews.ts        ← Add/list/helpful
    ├── categories.ts     ← List categories
    └── admin.ts          ← Dashboard stats, user management`}</pre>
        </div>
      </SectionCard>

      <SectionCard title="🔑 Key Features">
        <ul className="space-y-2 text-sm">
          <li>✅ <strong>Express.js 5</strong> — Latest version with async error handling</li>
          <li>✅ <strong>Mongoose ODM</strong> — Schema validation, indexes, virtuals</li>
          <li>✅ <strong>MongoDB Transactions</strong> — Used in orders (stock + wallet + order atomically)</li>
          <li>✅ <strong>JWT Auth</strong> — bcrypt (12 rounds) + 7-day tokens</li>
          <li>✅ <strong>Role-based Access</strong> — buyer, seller, admin guards</li>
          <li>✅ <strong>Helmet.js</strong> — Security headers</li>
          <li>✅ <strong>Rate Limiting</strong> — 200/15min global, 10/15min auth</li>
          <li>✅ <strong>Compression</strong> — gzip responses</li>
          <li>✅ <strong>Text Search</strong> — Full-text search on products (title, description, tags)</li>
          <li>✅ <strong>Aggregation Pipelines</strong> — Admin stats, seller analytics</li>
        </ul>
      </SectionCard>

      <SectionCard title="🗄️ Database Indexes">
        <CodeBlock title="Auto-created by Mongoose" code={`// Users
{ email: 1 }                     // Fast login lookup
{ role: 1 }                      // Admin user filtering

// Products
{ title: "text", description: "text", brand: "text", tags: "text" }  // Full-text search
{ categoryId: 1 }               // Category filtering
{ sellerId: 1 }                 // Seller's products
{ price: 1 }                    // Price sorting
{ rating: -1 }                  // Top rated
{ createdAt: -1 }               // Newest first

// Orders
{ userId: 1, createdAt: -1 }    // User's order history
{ "items.sellerId": 1 }         // Seller's orders

// Reviews
{ productId: 1, userId: 1 }     // Unique constraint
{ productId: 1, createdAt: -1 } // Product reviews list

// Wallet
{ userId: 1 }                   // Fast balance lookup`} />
      </SectionCard>
    </div>
  );
}

function FrontendTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="🎨 Frontend Stack">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[
            { name: 'React 19', desc: 'UI framework' },
            { name: 'TypeScript', desc: 'Type safety' },
            { name: 'Vite', desc: 'Build tool (HMR)' },
            { name: 'Tailwind CSS', desc: 'Utility-first styles' },
            { name: 'Framer Motion', desc: 'Animations' },
            { name: 'Zustand', desc: 'State management' },
            { name: 'React Router', desc: 'Client routing' },
            { name: 'Lucide Icons', desc: 'Icon library' },
          ].map((t) => (
            <div key={t.name} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
              <div className="font-bold text-sm text-emerald-600 dark:text-emerald-400">{t.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{t.desc}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="📄 Pages (15 total)">
        <div className="space-y-1 text-sm font-mono">
          {[
            { path: '/', name: 'HomePage', desc: 'Landing with hero, categories, featured products' },
            { path: '/products', name: 'ProductsPage', desc: 'Search, filter, sort, pagination' },
            { path: '/products/:id', name: 'ProductDetailPage', desc: 'Gallery, specs, reviews, seller info' },
            { path: '/cart', name: 'CartPage', desc: 'Shopping cart with price breakdown' },
            { path: '/checkout', name: 'CheckoutPage', desc: 'Address, payment, order confirmation' },
            { path: '/orders', name: 'OrdersPage', desc: 'Order history with filters' },
            { path: '/orders/:id', name: 'OrderDetailPage', desc: 'Status timeline, tracking' },
            { path: '/wallet', name: 'WalletPage', desc: 'Balance, top-up, transaction history' },
            { path: '/profile', name: 'ProfilePage', desc: 'Profile edit, address management' },
            { path: '/wishlist', name: 'WishlistPage', desc: 'Saved products' },
            { path: '/sell', name: 'SellPage', desc: 'Create/edit product listings' },
            { path: '/dashboard', name: 'DashboardPage', desc: 'Seller analytics & order management' },
            { path: '/admin', name: 'AdminPage', desc: 'Platform stats, user/product management' },
            { path: '/auth', name: 'AuthPage', desc: 'Login / Register with role selection' },
            { path: '/deployment', name: 'DeploymentGuidePage', desc: 'This page' },
          ].map((p) => (
            <div key={p.path} className="flex items-start gap-2 py-1">
              <span className="text-emerald-600 dark:text-emerald-400 shrink-0 w-36">{p.path}</span>
              <span className="text-gray-500 dark:text-gray-400">{p.desc}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="🌗 Dark Mode">
        <p className="text-sm">Theme toggle in header. Persisted in localStorage. Uses Tailwind's <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">dark:</code> prefix.</p>
        <CodeBlock title="Theme Logic (Zustand store)" code={`// Toggle in store
toggleDarkMode: () => {\n  const dark = !get().darkMode;\n  set({ darkMode: dark });\n  localStorage.setItem('ecoloop-dark', String(dark));\n  document.documentElement.classList.toggle('dark', dark);\n}`} />
      </SectionCard>
    </div>
  );
}

function ApiTab() {
  const endpoints = [
    { group: 'Auth', routes: [
      { m: 'POST', p: '/api/auth/register', a: '❌', d: 'Create account (buyer/seller)' },
      { m: 'POST', p: '/api/auth/login', a: '❌', d: 'Login → JWT token' },
      { m: 'GET', p: '/api/auth/me', a: '✅', d: 'Current user profile' },
    ]},
    { group: 'Products', routes: [
      { m: 'GET', p: '/api/products', a: '❌', d: 'Search with filters & pagination' },
      { m: 'GET', p: '/api/products/suggestions?q=', a: '❌', d: 'Autocomplete (max 8)' },
      { m: 'GET', p: '/api/products/:id', a: '❌', d: 'Detail + increment views' },
      { m: 'POST', p: '/api/products', a: '🏪', d: 'Create listing' },
      { m: 'PUT', p: '/api/products/:id', a: '🏪', d: 'Update listing' },
      { m: 'DELETE', p: '/api/products/:id', a: '🏪', d: 'Soft delete' },
    ]},
    { group: 'Orders', routes: [
      { m: 'POST', p: '/api/orders', a: '✅', d: 'Place order (MongoDB transaction)' },
      { m: 'GET', p: '/api/orders', a: '✅', d: 'User\'s orders' },
      { m: 'GET', p: '/api/orders/:id', a: '✅', d: 'Order detail' },
      { m: 'PUT', p: '/api/orders/:id/status', a: '🏪👑', d: 'Update status' },
      { m: 'POST', p: '/api/orders/:id/cancel', a: '✅', d: 'Cancel + refund to wallet' },
    ]},
    { group: 'Wallet', routes: [
      { m: 'GET', p: '/api/wallet', a: '✅', d: 'Balance + transaction history' },
      { m: 'POST', p: '/api/wallet/topup/initiate', a: '✅', d: 'Start payment (mock/Razorpay)' },
      { m: 'POST', p: '/api/wallet/topup/complete', a: '✅', d: 'Verify & credit wallet' },
    ]},
    { group: 'Users', routes: [
      { m: 'PUT', p: '/api/users/me', a: '✅', d: 'Update profile' },
      { m: 'POST', p: '/api/users/me/addresses', a: '✅', d: 'Add address' },
      { m: 'DELETE', p: '/api/users/me/addresses/:id', a: '✅', d: 'Delete address' },
      { m: 'POST', p: '/api/users/me/wishlist/:pid', a: '✅', d: 'Toggle wishlist' },
      { m: 'GET', p: '/api/users/me/wishlist', a: '✅', d: 'Wishlist products' },
    ]},
    { group: 'Reviews', routes: [
      { m: 'GET', p: '/api/reviews/:productId', a: '❌', d: 'Product reviews' },
      { m: 'POST', p: '/api/reviews', a: '✅', d: 'Submit review (1 per product)' },
      { m: 'PUT', p: '/api/reviews/:id/helpful', a: '✅', d: 'Mark as helpful' },
    ]},
    { group: 'Admin', routes: [
      { m: 'GET', p: '/api/admin/stats', a: '👑', d: 'Platform metrics' },
      { m: 'GET', p: '/api/admin/users', a: '👑', d: 'All users' },
      { m: 'PUT', p: '/api/admin/users/:id/role', a: '👑', d: 'Change user role' },
    ]},
  ];

  return (
    <div className="space-y-6">
      {endpoints.map((g) => (
        <SectionCard key={g.group} title={`${g.group} Endpoints`}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gray-200 dark:border-gray-600">
                  <th className="py-2 pr-2 w-16">Method</th>
                  <th className="py-2 pr-2">Endpoint</th>
                  <th className="py-2 pr-2 w-10">Auth</th>
                  <th className="py-2">Description</th>
                </tr>
              </thead>
              <tbody>
                {g.routes.map((r, i) => (
                  <tr key={i} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className={`py-2 pr-2 font-mono text-xs font-bold ${r.m === 'GET' ? 'text-blue-600' : r.m === 'POST' ? 'text-green-600' : r.m === 'PUT' ? 'text-amber-600' : 'text-red-600'}`}>{r.m}</td>
                    <td className="py-2 pr-2 font-mono text-xs">{r.p}</td>
                    <td className="py-2 pr-2">{r.a}</td>
                    <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{r.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      ))}
    </div>
  );
}

function DockerTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="🐳 Dockerfile">
        <CodeBlock title="Dockerfile" code={`FROM node:20-alpine AS builder\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN VITE_API_URL=/api npm run build\n\nFROM node:20-alpine AS runner\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci --omit=dev\nCOPY --from=builder /app/dist ./dist\nCOPY server ./server\n\nENV NODE_ENV=production\nENV PORT=3001\nEXPOSE 3001\nCMD ["npx", "tsx", "server/index.ts"]`} />
      </SectionCard>

      <SectionCard title="📦 docker-compose.yml">
        <CodeBlock title="docker-compose.yml" code={`version: '3.8'\n\nservices:\n  ecoloop:\n    build: .\n    ports:\n      - "3001:3001"\n    environment:\n      - MONGODB_URI=mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0\n      - JWT_SECRET=your_production_secret\n      - NODE_ENV=production\n      - PORT=3001\n    restart: unless-stopped`} />
      </SectionCard>

      <SectionCard title="▶️ Run">
        <CodeBlock title="Terminal" code={`# Build & start\ndocker-compose up -d --build\n\n# Seed database (first time)\ndocker-compose exec ecoloop npx tsx server/db/seed.ts\n\n# View logs\ndocker-compose logs -f ecoloop\n\n# Stop\ndocker-compose down`} />
      </SectionCard>
    </div>
  );
}

function CloudTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="🚂 Railway (Recommended — Easiest)">
        <CodeBlock title="Terminal" code={`# 1. Install CLI\nnpm install -g @railway/cli\n\n# 2. Login & deploy\nrailway login\nrailway init\nrailway up\n\n# 3. Set environment variables\nrailway variables set MONGODB_URI="mongodb+srv://vishvajitrajput1238_db_user:A3x6Z9cT3YDaNY2S@cluster0.nq8iitq.mongodb.net/ecoloop?retryWrites=true&w=majority&appName=Cluster0"\nrailway variables set JWT_SECRET="$(openssl rand -hex 32)"\nrailway variables set NODE_ENV="production"\n\n# 4. Seed database\nrailway run npx tsx server/db/seed.ts\n\n# 5. Open deployed app\nrailway open`} />
        <p className="text-sm text-gray-500">Cost: ~$5/month hobby plan | Free trial available</p>
      </SectionCard>

      <SectionCard title="🔺 Vercel (Frontend) + Railway (Backend)">
        <CodeBlock title="Terminal" code={`# Frontend → Vercel\nvercel --prod\nvercel env add VITE_API_URL production\n# Enter: https://your-backend.railway.app\n\n# Backend → Railway (see above)`} />
      </SectionCard>

      <SectionCard title="🎨 Render.com">
        <div className="text-sm space-y-2">
          <p>1. Go to render.com → New → <strong>Web Service</strong></p>
          <p>2. Connect GitHub repo</p>
          <p>3. Build: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">npm install && npm run build</code></p>
          <p>4. Start: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">npx tsx server/index.ts</code></p>
          <p>5. Add env vars in Render dashboard</p>
          <p className="text-gray-500">Cost: Free tier (spins down after 15 min inactivity)</p>
        </div>
      </SectionCard>
    </div>
  );
}

function VpsTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="🖥️ Ubuntu 22.04 + PM2 + Nginx + SSL">
        <CodeBlock title="Complete VPS Setup" code={`# ── 1. Install Dependencies ─────────────────────────
sudo apt update && sudo apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx certbot python3-certbot-nginx git
sudo npm install -g pm2

# ── 2. Clone & Build ───────────────────────────────
sudo mkdir -p /var/www/ecoloop
sudo chown $USER:$USER /var/www/ecoloop
git clone https://github.com/your-username/ecoloop.git /var/www/ecoloop
cd /var/www/ecoloop
npm install
cp .env.example .env
nano .env  # Set MONGODB_URI, JWT_SECRET, NODE_ENV=production

# ── 3. Build Frontend ──────────────────────────────
VITE_API_URL=https://ecoloop.in npm run build

# ── 4. Seed Database ───────────────────────────────
npx tsx server/db/seed.ts

# ── 5. Start with PM2 ──────────────────────────────
pm2 start "npx tsx server/index.ts" --name ecoloop
pm2 save
pm2 startup

# ── 6. Nginx Config ────────────────────────────────
sudo nano /etc/nginx/sites-available/ecoloop
# (see nginx config below)
sudo ln -s /etc/nginx/sites-available/ecoloop /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# ── 7. SSL Certificate ─────────────────────────────
sudo certbot --nginx -d ecoloop.in -d www.ecoloop.in`} />
      </SectionCard>

      <SectionCard title="📝 Nginx Configuration">
        <CodeBlock title="/etc/nginx/sites-available/ecoloop" code={`server {\n    server_name ecoloop.in www.ecoloop.in;\n\n    location / {\n        root /var/www/ecoloop/dist;\n        try_files $uri $uri/ /index.html;\n        expires 1d;\n    }\n\n    location /api/ {\n        proxy_pass http://127.0.0.1:3001;\n        proxy_http_version 1.1;\n        proxy_set_header Host $host;\n        proxy_set_header X-Real-IP $remote_addr;\n        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;\n        proxy_set_header X-Forwarded-Proto $scheme;\n    }\n\n    listen 80;\n}`} />
      </SectionCard>
    </div>
  );
}

function RazorpayTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="💳 Current: Mock Mode ✅">
        <p className="text-sm">Wallet top-up works in <strong>mock mode</strong> — simulates payment success without a real gateway. Perfect for development.</p>
        <div className="bg-amber-50 dark:bg-amber-900/30 rounded-lg p-3 mt-2 text-sm">
          <p className="font-bold text-amber-800 dark:text-amber-300">How Mock Works:</p>
          <ol className="list-decimal ml-4 mt-1 space-y-1 text-amber-700 dark:text-amber-400">
            <li>User enters amount → POST /api/wallet/topup/initiate → creates PaymentOrder</li>
            <li>Frontend simulates payment → POST /api/wallet/topup/complete</li>
            <li>Backend credits wallet + creates WalletTransaction</li>
          </ol>
        </div>
      </SectionCard>

      <SectionCard title="🔴 Go Live with Razorpay">
        <div className="space-y-4 text-sm">
          <div>
            <h4 className="font-bold">1. Get API Keys</h4>
            <p>Sign up at <a href="https://dashboard.razorpay.com" className="text-emerald-600 underline" target="_blank" rel="noreferrer">dashboard.razorpay.com</a> → Settings → API Keys</p>
          </div>
          <div>
            <h4 className="font-bold">2. Install SDK</h4>
            <CodeBlock title="Terminal" code={`npm install razorpay`} />
          </div>
          <div>
            <h4 className="font-bold">3. Update server/routes/wallet.ts</h4>
            <CodeBlock title="Initiate endpoint (replace mock)" code={`import Razorpay from 'razorpay';\n\nconst razorpay = new Razorpay({\n  key_id: process.env.RAZORPAY_KEY_ID!,\n  key_secret: process.env.RAZORPAY_KEY_SECRET!,\n});\n\nconst rzpOrder = await razorpay.orders.create({\n  amount: amount * 100,  // paise\n  currency: 'INR',\n  receipt: \`wallet_\${req.userId}_\${Date.now()}\`,\n});`} />
          </div>
          <div>
            <h4 className="font-bold">4. Verify Signature (Complete endpoint)</h4>
            <CodeBlock title="Verify payment" code={`import crypto from 'crypto';\n\nconst expectedSig = crypto\n  .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)\n  .update(\`\${razorpayOrderId}|\${razorpayPaymentId}\`)\n  .digest('hex');\n\nif (expectedSig !== razorpaySignature) {\n  return res.status(400).json({ error: 'Payment verification failed.' });\n}`} />
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

function SecurityTab() {
  return (
    <div className="space-y-6">
      <SectionCard title="✅ Already Implemented">
        <ul className="space-y-2 text-sm">
          {[
            'Helmet.js — Secure HTTP headers (XSS, clickjacking, etc.)',
            'Rate Limiting — 200 req/15min global, 10/15min on auth',
            'bcryptjs — Password hashing with 12 salt rounds',
            'JWT — Stateless auth with configurable expiry',
            'Role-based Access — buyer/seller/admin guards on routes',
            'Input Validation — All endpoints validate request body',
            'CORS — Restricted to frontend origin only',
            'MongoDB Injection — Mongoose sanitizes all queries',
            'Error Handling — No stack traces in production',
            'Compression — gzip responses for performance',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✅</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="⬜ Before Going to Production">
        <ul className="space-y-2 text-sm">
          {[
            'Generate strong JWT_SECRET: openssl rand -hex 32',
            'Set NODE_ENV=production',
            'Enable HTTPS (Let\'s Encrypt or Cloudflare)',
            'Set CORS origin to exact production domain',
            'Restrict Atlas Network Access to server IP only',
            'Enable MongoDB Atlas audit logging',
            'Set up automated database backups',
            'Add request logging (Morgan / Winston)',
            'Implement token refresh / revocation',
            'Add CSRF protection for sensitive operations',
            'Set up monitoring (PM2, UptimeRobot, etc.)',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-gray-400 mt-0.5">⬜</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </SectionCard>

      <SectionCard title="🔐 Environment Variables">
        <CodeBlock title="Production .env" code={`# NEVER commit real secrets to git!\nMONGODB_URI=mongodb+srv://...@cluster0.nq8iitq.mongodb.net/ecoloop\nJWT_SECRET=<openssl rand -hex 32>\nNODE_ENV=production\nPORT=3001\nFRONTEND_URL=https://ecoloop.in\nRAZORPAY_KEY_ID=rzp_live_xxxxx\nRAZORPAY_KEY_SECRET=xxxxx`} />
      </SectionCard>
    </div>
  );
}

export default function DeploymentGuidePage() {
  const [activeTab, setActiveTab] = useState<Tab>('atlas');

  const renderTab = () => {
    switch (activeTab) {
      case 'atlas': return <AtlasTab />;
      case 'local': return <LocalTab />;
      case 'backend': return <BackendTab />;
      case 'frontend': return <FrontendTab />;
      case 'api': return <ApiTab />;
      case 'docker': return <DockerTab />;
      case 'cloud': return <CloudTab />;
      case 'vps': return <VpsTab />;
      case 'razorpay': return <RazorpayTab />;
      case 'security': return <SecurityTab />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <h1 className="text-4xl font-bold mb-3">🚀 EcoLoop Deployment Guide</h1>
            <p className="text-emerald-100 text-lg max-w-2xl">
              Complete guide to deploy EcoLoop with <strong>MongoDB Atlas</strong>, 
              <strong> Express.js</strong> backend, and <strong>React</strong> frontend.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">MongoDB Atlas</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Express.js</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">React + Vite</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">TypeScript</span>
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">Mongoose</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="sticky top-16 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
