# Stock Market Manager - NeonDB Migration Guide

## ✅ Migration Progress: STEP 1-4 COMPLETE

### What's Been Done:

1. ✅ Removed all Supabase dependencies (@supabase/ssr, @supabase/supabase-js)
2. ✅ Added PostgreSQL client (pg, bcrypt, jsonwebtoken)
3. ✅ Created database connection layer (`lib/db.ts`)
4. ✅ Created JWT + bcrypt authentication (`lib/auth.ts`)
5. ✅ Updated middleware for route protection
6. ✅ Created NeonDB schema with proper tables and indexes
7. ✅ Created seed data with 10 Indian stocks
8. ✅ Converted all API routes to use direct PostgreSQL
9. ✅ Updated all authentication pages (login, signup)
10. ✅ Updated all components (Navbar, Dashboard, etc.)

### New Files Created:

- `/lib/db.ts` - PostgreSQL connection and query utilities
- `/lib/auth.ts` - JWT, bcrypt, and session management
- `/app/api/auth/register/route.ts` - New registration API
- `/app/api/auth/login/route.ts` - New login API  
- `/app/api/auth/logout/route.ts` - New logout API
- `/app/api/auth/me/route.ts` - User info API
- `/db/schema.sql` - Complete database schema
- `/db/seed.sql` - Sample stock data
- `/.env.local` - Environment variables

### Updated Files:

- `package.json` - Replaced Supabase with pg/bcrypt/jwt
- `middleware.ts` - JWT-based route protection
- All API routes in `/api/` - Now use direct PostgreSQL
- All page components - Use new auth endpoints
- `components/Navbar.tsx` - Uses new logout API
- `app/page.tsx` - Uses new auth check
- `app/dashboard/page.tsx` - Updated for new data structure
- `app/transactions/page.tsx` - Updated for new data structure

---

## 🚀 SETUP INSTRUCTIONS

### 1. Install Dependencies (Already Running)
```bash
npm install
```
Installs: pg, bcrypt, jsonwebtoken, and removes @supabase packages

### 2. Setup NeonDB Database

Open your NeonDB dashboard and run these scripts:

**Script 1: Create Tables** (from `/db/schema.sql`)
```sql
-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  balance DECIMAL(15, 2) DEFAULT 100000.00,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stocks table
CREATE TABLE IF NOT EXISTS stocks (
  id SERIAL PRIMARY KEY,
  symbol VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  current_price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Portfolio table (user holdings)
CREATE TABLE IF NOT EXISTS portfolio (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_id INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(user_id, stock_id)
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stock_id INTEGER NOT NULL REFERENCES stocks(id),
  type VARCHAR(10) NOT NULL CHECK (type IN ('BUY', 'SELL')),
  quantity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_portfolio_user_id ON portfolio(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_stock_id ON portfolio(stock_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_stocks_symbol ON stocks(symbol);
```

**Script 2: Seed Sample Stocks** (from `/db/seed.sql`)
```sql
INSERT INTO stocks (symbol, name, current_price) VALUES
  ('RELIANCE', 'Reliance Industries', 2850.50),
  ('TCS', 'Tata Consultancy Services', 3650.75),
  ('INFY', 'Infosys Limited', 1890.25),
  ('WIPRO', 'Wipro Limited', 550.80),
  ('HDFC', 'HDFC Bank Limited', 1825.60),
  ('ICICI', 'ICICI Bank Limited', 980.40),
  ('SBIN', 'State Bank of India', 645.15),
  ('LT', 'Larsen & Toubro', 2950.30),
  ('MARUTI', 'Maruti Suzuki', 9850.20),
  ('BAJAJ', 'Bajaj Auto', 4520.75)
ON CONFLICT (symbol) DO NOTHING;
```

### 3. Environment Variables (Already Set)

Your `.env.local` file is ready with:
```
DATABASE_URL=postgresql://neondb_owner:npg_90VzGvxNOBnU@ep-winter-base-aqi12ieg-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-12345
NODE_ENV=development
```

⚠️ **IMPORTANT**: Change `JWT_SECRET` to a random string in production!

### 4. Start the Development Server

```bash
npm run dev
```

Navigate to: http://localhost:3000

---

## 📋 Testing Checklist

### User Registration & Login
- [ ] Visit `/auth/sign-up`
- [ ] Create account with email and password
- [ ] Verify user is created in NeonDB users table
- [ ] Verify password is hashed (not plain text)
- [ ] Verify ₹100,000 default balance is assigned
- [ ] Check auth token is set in HTTP-only cookie

### Login Flow
- [ ] Log out (Navbar > Logout)
- [ ] Go to `/auth/login`
- [ ] Login with credentials
- [ ] Redirected to `/dashboard`
- [ ] User email shows in navbar

### Dashboard Features
- [ ] Cash balance displays correctly (₹100,000)
- [ ] Portfolio value shows ₹0 (no stocks yet)
- [ ] "Browse Stocks" tab shows 10 stocks
- [ ] Stock prices display correctly
- [ ] Transaction history is empty

### Buy Stock Flow
- [ ] Click "Buy" on any stock
- [ ] Enter valid quantity
- [ ] Click "Confirm Purchase"
- [ ] Balance decreases by purchase amount
- [ ] Stock appears in portfolio
- [ ] Transaction recorded in history

### Sell Stock Flow
- [ ] Click "Sell" on a portfolio stock
- [ ] Enter valid quantity (≤ owned quantity)
- [ ] Click "Confirm Sale"
- [ ] Balance increases by sale amount
- [ ] Portfolio quantity updates
- [ ] Transaction recorded as SELL

### Route Protection
- [ ] Try accessing `/dashboard` without login → redirects to `/login`
- [ ] Try accessing `/transactions` without login → redirects to `/login`
- [ ] Try accessing `/portfolio` without login → redirects to `/login`

### Edge Cases
- [ ] Try buying with insufficient balance → error
- [ ] Try overselling → error
- [ ] Try invalid quantities (negative, zero) → error
- [ ] Try selling stocks not in portfolio → error

---

## 🔧 Database Structure

### users
- id (PK)
- email (unique)
- password (hashed with bcrypt)
- name
- balance (default: 100000.00)
- created_at
- updated_at

### stocks
- id (PK)
- symbol (unique)
- name
- current_price
- created_at
- updated_at

### portfolio
- id (PK)
- user_id (FK → users)
- stock_id (FK → stocks)
- quantity
- created_at
- updated_at

### transactions
- id (PK)
- user_id (FK → users)
- stock_id (FK → stocks)
- type (BUY | SELL)
- quantity
- price
- created_at

---

## 🔐 Security Features Implemented

✅ Bcrypt password hashing (10 rounds)
✅ JWT tokens with 7-day expiration
✅ HTTP-only secure cookies
✅ Parameterized SQL queries (no SQL injection)
✅ Route middleware for protected paths
✅ Automatic session validation
✅ CORS and secure headers

---

## 📝 Next Steps

1. Wait for `npm install` to complete
2. Run database schema in NeonDB console
3. Run seed data in NeonDB console
4. Start dev server: `npm run dev`
5. Test all features per checklist
6. Deploy to Vercel or hosting provider

---

## 🐛 Troubleshooting

**Error: "Cannot find module 'pg'"**
→ Run `npm install` again

**Error: "database does not exist"**
→ Check `.env.local` DATABASE_URL is correct

**Error: "password authentication failed"**
→ Verify NeonDB credentials in DATABASE_URL

**Error: "Unauthorized" on protected routes**
→ Check auth_token cookie is set
→ Verify JWT_SECRET matches

**Error: "UNIQUE constraint failed: users.email"**
→ Email already exists, use different email or delete user from DB

---

