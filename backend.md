Here is the complete **Master Product Requirements Document (PRD)**.

You can copy this entire block and paste it directly into **GitHub Copilot Workspace**, **Cursor**, or **Windsurf**. It contains every technical detail needed to generate the working code for your project.

-----

# Master PRD: TreasureHunt (Hybrid Architecture)

**Role:** Act as a Senior Full Stack Engineer.
**Goal:** Build a high-performance arbitrage dashboard called **"TreasureHunt"**.
**Core Logic:** The app finds secondhand items with "vague" titles (e.g., "Old Camera") that have high real-world value (e.g., "Leica M3") by using visual AI analysis.

-----

## 1\. Tech Stack & Architecture

We are using a **Hybrid Microservice Architecture** to optimize for speed and scraping capabilities.

### **Frontend (The Client)**

  * **Framework:** Next.js 14+ (App Router, TypeScript).
  * **Styling:** Tailwind CSS + Lucide React (Icons).
  * **Auth:** Supabase Auth Helpers (Client Component).
  * **State:** React Query (TanStack Query) for fetching API data.
  * **Hosting:** Vercel.

### **Backend (The "Brain")**

  * **Framework:** FastAPI (Python 3.10+).
  * **Server:** Uvicorn.
  * **Database Client:** `supabase-py` (Official Python Client).
  * **Caching:** `upstash-redis` (Async).
  * **AI Engine:** `google-generativeai` (Gemini 1.5 Flash).
  * **Scraping/API:** `httpx` (Async) for eBay Browse API.
  * **Hosting:** Railway or DigitalOcean.

### **Database (The Storage)**

  * **Provider:** Supabase (PostgreSQL).

-----

## 2\. Database Schema (SQL)

The AI agent should generate a migration file or run these SQL commands to set up the database:

```sql
-- 1. SAVED ITEMS (The Watchlist)
create table public.saved_items (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null,            -- Retrieved from Auth Token
  external_id text not null,        -- eBay/Vinted Item ID
  title_vague text not null,        -- Seller's title (e.g., "Old Camera")
  title_real text,                  -- AI Identified title (e.g., "Leica M3")
  price_listed numeric,             -- 45.00
  price_estimated numeric,          -- 1200.00
  profit_potential numeric generated always as (price_estimated - price_listed) stored,
  image_url text,
  market_url text,
  marketplace text default 'ebay',
  created_at timestamp with time zone default now()
);

-- 2. ENABLE ROW LEVEL SECURITY (RLS)
alter table saved_items enable row level security;

-- 3. RLS POLICY (Users only see their own items)
create policy "Users manage own items" on saved_items
  for all using (auth.uid() = user_id);
```

-----

## 3\. Backend Specifications (FastAPI)

The backend must expose a REST API with the following structure.

### **Authentication Middleware**

  * **Security:** All protected routes must verify the `Authorization: Bearer <token>` header.
  * **Logic:** Use `supabase.auth.get_user(token)` to validate the session and extract `user_id`.

### **Endpoint: `GET /search`**

  * **Params:** `q` (string), `max_price` (int, default: 100).
  * **Caching Logic (Redis):**
    1.  Check Redis key `search:{q}`. If hit, return cached JSON immediately.
    2.  If miss, perform the search (see below).
    3.  Save result to Redis with `TTL=86400` (24 hours).
  * **Search Logic:**
    1.  **eBay:** Call `item_summary/search` for items with `condition: Used`.
    2.  **Filter:** Reject items with "Brand New" or "Sealed" in the title.
    3.  **AI Analysis:** Send top 3 image URLs to Gemini 1.5 Flash.
          * *Prompt:* "Identify specific model. Estimate used market value. Return JSON."
    4.  **Merge:** Return combined list of `{listing, analysis}`.

### **Endpoint: `POST /items`**

  * **Body:** JSON object matching the `saved_items` table.
  * **Logic:** Save the item to Supabase under the authenticated `user_id`.

-----

## 4\. Frontend Specifications (Next.js)

### **Design System**

  * **Theme:** "Clean Red" (White background, `#DC2626` Red Accents).
  * **Components:**
      * `SearchInput`: Large, centered input with loading spinner.
      * `GemCard`: Displays Image, Vague Title (strikethrough), Real Title (Bold Red), and Profit Badge.
      * `LiveTicker`: A horizontal scrolling component for "Recent Finds".

### **Page Structure**

1.  **`/login`**: Supabase Auth UI widget.
2.  **`/dashboard` (Protected)**:
      * Shows `SearchInput`.
      * Displays results in a Grid.
      * Uses `useQuery` to hit the FastAPI backend.
3.  **`/saved` (Protected)**:
      * Fetches from `POST /items` logic.

-----

## 5\. Environment Variables (`.env`)

The project requires these variables to function:

```bash
# CLIENT (Next.js)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
NEXT_PUBLIC_API_URL="http://localhost:8000" # Points to FastAPI

# SERVER (FastAPI)
SUPABASE_URL="https://your-project.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
EBAY_APP_ID="your-ebay-app-id"
EBAY_CERT_ID="your-ebay-cert-id"
GOOGLE_API_KEY="your-gemini-key"
UPSTASH_REDIS_REST_URL="your-upstash-url"
UPSTASH_REDIS_REST_TOKEN="your-upstash-token"
```

-----

## 6\. Implementation Instructions for AI Agent

**Step 1: Backend Scaffolding**

  * Create a `backend/` folder.
  * Initialize a Python FastAPI app.
  * Create `services/ebay.py` (OAuth + Search) and `services/ai.py` (Gemini).
  * Implement `routers/search.py` with the Redis Caching logic.

**Step 2: Frontend Scaffolding**

  * Create a `frontend/` folder (Next.js App Router).
  * Install `lucide-react`, `framer-motion`, `@tanstack/react-query`.
  * Create the `GemCard` component with the Red/White theme.

**Step 3: Integration**

  * Ensure Frontend passes the Supabase JWT to the Backend in every fetch request.
  * Ensure Backend validates that token before returning data.

-----

### 💡 How to use this:

1.  Open **GitHub Copilot Chat** (or Cursor/Windsurf).
2.  Paste the entire text block above.
3.  Add this command at the very end:
    > *"Based on this PRD, please create the project structure and write the initial code for the `backend/main.py` and the `frontend/app/page.tsx` file."*

[Automating Cursor to build a full-stack system from single source of truth](https://www.youtube.com/watch?v=SccSCuHhOw0)
*This video demonstrates how to use a single prompt document (like the one above) to make an AI agent build a decoupled frontend and backend that communicate perfectly.*