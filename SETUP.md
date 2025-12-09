# 🚀 TreasureHunt Setup Guide

## ✅ What's Been Implemented

Your TreasureHunt app is now **fully functional** with:
- ✅ Beautiful login/signup pages (matching your design)
- ✅ Supabase authentication integration
- ✅ API integration with your FastAPI backend
- ✅ Real-time search with loading states
- ✅ Save items to watchlist functionality
- ✅ User profile with logout
- ✅ Error handling and user feedback

## 📋 Setup Instructions

### 1. Create `.env.local` (Frontend)

Copy the example file and add your values:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:
```bash
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
NEXT_PUBLIC_API_URL="http://localhost:8000"
```

**Get Supabase Credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project (or create one)
3. Go to Settings → API
4. Copy the "Project URL" and "anon public" key

### 2. Create `backend/.env` (Backend)

Create the file:
```bash
cd backend
touch .env
```

Add these values:
```bash
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
EBAY_APP_ID="your-ebay-app-id"
EBAY_CERT_ID="your-ebay-cert-id"
GOOGLE_API_KEY="your-gemini-api-key"
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

**Get API Keys:**
- **Supabase Service Key**: Supabase Dashboard → Settings → API → "service_role" key
- **Google Gemini**: https://aistudio.google.com/app/apikey (FREE - no billing required)
- **eBay API**: https://developer.ebay.com/
- **Upstash Redis**: https://upstash.com/ (FREE tier available)

### 3. Install Backend Dependencies

```bash
cd backend
pip install fastapi uvicorn supabase httpx google-generativeai upstash-redis python-dotenv
```

Or if you have a `requirements.txt`:
```bash
pip install -r requirements.txt
```

### 4. Set Up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Create saved items table
create table public.saved_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,
  external_id text not null,
  title_vague text not null,
  title_real text,
  price_listed numeric,
  price_estimated numeric,
  profit_potential numeric generated always as (price_estimated - price_listed) stored,
  image_url text,
  market_url text,
  marketplace text default 'ebay',
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table saved_items enable row level security;

-- Create policy
create policy "Users manage own items" on saved_items
  for all using (auth.uid() = user_id);
```

## 🏃 Running the App

### Terminal 1 - Backend:
```bash
cd backend
python main.py
```
Backend will run on `http://localhost:8000`

### Terminal 2 - Frontend:
```bash
npm run dev
```
Frontend will run on `http://localhost:3000`

## 🎨 What You'll See

1. **Login Page** - Beautiful auth page with sign up/sign in
2. **Home Page** - Hero section with search bar
3. **Search Results** - Real API results from your backend with:
   - AI analysis
   - Loading spinner
   - Error handling
4. **Item Detail** - Full details with save to watchlist button
5. **User Menu** - Click avatar to sign out

## 🐛 Troubleshooting

### "Module not found" errors:
```bash
npm install
```

### Backend connection issues:
- Make sure backend is running on port 8000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in `backend/main.py`

### Authentication issues:
- Verify Supabase URL and keys are correct
- Check Supabase dashboard for auth errors
- Make sure email confirmation is disabled in Supabase (Settings → Auth → Email Auth)

### No search results:
- Check backend logs for errors
- Verify Google API key is valid
- Check eBay API credentials

## 📝 Notes

- The app requires authentication - users must sign up/login first
- Search queries hit your real FastAPI backend
- AI analysis uses Google Gemini (free tier)
- Results are cached for 24 hours via Redis
- All saved items are stored in Supabase with RLS

## 🎉 You're Ready!

Your full-stack TreasureHunt app is complete and ready to use!
