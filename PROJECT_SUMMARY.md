# TreasureHunt - AI-Powered Deal Finder

**A full-stack web application that uses AI to find undervalued items on eBay and Vinted marketplaces**

## 📋 Project Overview

TreasureHunt is an intelligent marketplace search tool that helps users discover hidden gems by comparing listing prices against real market values. The application uses Google's Gemini AI to analyze product images and titles, then cross-references actual sold listings to identify potentially undervalued items - perfect for resellers and bargain hunters.

### Key Features

- 🔍 **Multi-Marketplace Search**: Simultaneous searching across eBay and Vinted
- 🤖 **AI-Powered Analysis**: Fashion-specialized Gemini AI identifies brands and estimates values
- 💰 **Real Market Price Lookup**: Fetches median prices from actual eBay sold listings
- 📊 **Profit Calculator**: Shows potential profit based on market value vs. listing price
- 🎯 **Smart Filtering**: Filter by price range, marketplace, and AI confidence score
- 🔐 **User Authentication**: Secure login/signup with Supabase
- 💾 **Save Items**: Bookmark interesting finds for later review
- ⚡ **Redis Caching**: Fast results with 24-hour cache

## 🏗️ Architecture

### Tech Stack

**Frontend:**
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Lucide React (Icons)
- Supabase Auth

**Backend:**
- FastAPI (Python 3.11.4)
- Uvicorn (ASGI Server)
- Google Gemini 2.5 Flash API
- Upstash Redis
- Supabase PostgreSQL

**APIs & Services:**
- eBay Browse API (OAuth)
- Vinted API (Direct HTTP)
- Google Generative AI
- Supabase Database & Auth

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Home Page   │  │Search Results│  │ Item Detail  │      │
│  │  + Auth      │  │  + Filters   │  │  + Save Item │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                           ▼                                  │
│                   Supabase Auth Client                       │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Backend (FastAPI)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │              Search Router (/search)                    │ │
│  │  • Parallel eBay + Vinted queries                      │ │
│  │  • Top 5 AI analysis                                   │ │
│  │  • Market price lookup                                 │ │
│  │  • Redis caching                                       │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │               Items Router (/items)                     │ │
│  │  • Save/retrieve/delete items                          │ │
│  │  • Supabase database operations                        │ │
│  └────────────────────────────────────────────────────────┘ │
└───┬─────────────┬─────────────┬─────────────┬──────────────┘
    │             │             │             │
    ▼             ▼             ▼             ▼
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌──────────┐
│  eBay   │  │ Vinted  │  │ Gemini  │  │Supabase  │
│ Service │  │ Service │  │   AI    │  │ Service  │
└─────────┘  └─────────┘  └─────────┘  └──────────┘
```

## 📁 Project Structure

```
TreasureHunt/
├── backend/                      # FastAPI Backend
│   ├── main.py                   # FastAPI app entry point
│   ├── requirements.txt          # Python dependencies
│   ├── .env                      # Environment variables (not in git)
│   ├── routers/
│   │   ├── search.py            # Search endpoints + AI analysis
│   │   └── items.py             # Saved items CRUD
│   └── services/
│       ├── ai.py                # Gemini AI with fashion specialization
│       ├── cache.py             # Redis caching service
│       ├── ebay.py              # eBay API + market price lookup
│       ├── supabase.py          # Database operations
│       └── vinted.py            # Vinted API integration
│
├── src/                         # Next.js Frontend
│   ├── app/
│   │   ├── page.tsx            # Main app container with auth
│   │   ├── layout.tsx          # Root layout
│   │   ├── context.tsx         # Navigation context
│   │   ├── globals.css         # Global styles
│   │   └── api/                # (Removed - using FastAPI backend)
│   ├── components/
│   │   ├── Layout.tsx          # App layout with header/footer
│   │   ├── UIComponents.tsx    # Reusable UI components
│   │   ├── ParticleBackground.tsx
│   │   └── Waves.tsx
│   ├── pages/
│   │   ├── Home.tsx            # Landing page with search
│   │   ├── Login.tsx           # Authentication page
│   │   ├── SearchResults.tsx   # Results grid + filters
│   │   └── ItemDetail.tsx      # Individual item view
│   ├── lib/
│   │   ├── api.ts              # Backend API client
│   │   └── supabase.ts         # Supabase client config
│   ├── types.ts                # TypeScript interfaces
│   └── mockData.ts             # Mock data for testing
│
├── package.json                # Node.js dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind CSS config
├── next.config.js              # Next.js config
└── README.md                   # Project documentation
```

## 🔄 Data Flow

### Search Flow

1. **User Input**: User enters search query and optionally selects marketplace
2. **Frontend Request**: `api.searchItems(query, userId)` → Backend `/search` endpoint
3. **Cache Check**: Redis checks for cached results (disabled during development)
4. **Parallel Search**:
   - eBay Browse API query
   - Vinted API query
   - Results merged and sorted by price
5. **AI Analysis** (Top 5 items):
   - Downloads product images
   - Gemini AI analyzes with fashion-specialized prompts
   - Identifies real title, brand, condition
   - Detects category (fashion/electronics/collectibles)
6. **Market Price Lookup**:
   - If AI doesn't return price estimate
   - Query eBay sold listings for comparable items
   - Calculate median price from recent sales
   - Fallback to 1.5x listing price if unavailable
7. **Profit Calculation**: `profit = market_price - listing_price`
8. **Cache Results**: Store in Redis for 24 hours
9. **Frontend Display**: Results grid with filters

### Save Item Flow

1. **User Action**: Click save button on item
2. **Frontend**: `api.saveItem(item, userId)` → Backend `/items` endpoint
3. **Database**: Insert into Supabase `items` table
4. **Response**: Updated saved items list
5. **UI Update**: Show saved indicator

## 🤖 AI Intelligence

### Fashion Specialization

The AI system uses category detection to provide specialized analysis:

**Fashion/Clothing Items:**
- Recognizes designer brands (Gucci, Prada, Louis Vuitton)
- Identifies streetwear (Supreme, Off-White, Bape)
- Detects athletic brands (Yeezy, Jordan, Nike)
- Analyzes fabric quality, stitching, logos
- Confidence scoring relative to brand recognition

**Other Categories:**
- Electronics: Model numbers, specifications
- Collectibles: Rarity, condition, authenticity
- General items: Basic condition assessment

### AI Confidence Scoring

- **HIGH (75-95%)**: Designer brands, visible logos, clear authentication markers
- **MEDIUM (50-74%)**: Fast fashion (Zara, H&M), recognizable styles
- **LOW (0-49%)**: Generic/unbranded, unclear images, insufficient data

## 🔑 Key Features Deep Dive

### 1. Multi-Marketplace Support

**eBay Integration:**
- OAuth authentication with token caching
- Browse API for active listings
- Sold listings API for market price lookup
- Supports price filters, condition filters
- Returns: title, price, image, URL, condition

**Vinted Integration:**
- Direct HTTP API calls (no wrapper needed)
- Session-based authentication
- Price format parsing: `{"amount": "4.05", "currency_code": "USD"}`
- Returns: title, price, image, URL, brand

### 2. Market Price Intelligence

**Real Market Data:**
```python
async def get_market_price(item_title: str) -> float:
    # Query eBay sold listings API
    # Fetch up to 20 recent sales
    # Extract prices, calculate median
    # Return robust market value
```

**Why Median?**
- Resistant to outliers (extremely high/low sales)
- More accurate than average for price distributions
- Better represents typical market value

### 3. Smart Filtering

**Client-Side Filters:**
- **Price Range**: Min/max slider
- **Marketplace**: eBay, Vinted, or both
- **Confidence Score**: AI confidence threshold (0-100%)
- **Search State**: Reads marketplace filter from context

**Filter Persistence:**
- Marketplace selection persists via React Context
- "Hunt on eBay" / "Hunt on Vinted" buttons pre-filter results

### 4. Authentication & Security

**Supabase Auth:**
- Email/password authentication
- JWT token-based sessions
- Row Level Security (RLS) policies
- User-specific saved items

**Environment Security:**
- All API keys in `.env` (not committed)
- Service role key for backend operations
- Anon key for frontend auth only

## 📊 Database Schema

### Items Table (Supabase PostgreSQL)

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  title_vague TEXT,
  title_real TEXT,
  price_listed NUMERIC,
  price_estimated NUMERIC,
  profit_potential NUMERIC,
  image_url TEXT,
  market_url TEXT,
  marketplace TEXT,
  confidence NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

-- Users can only see their own items
CREATE POLICY "Users can view own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

-- Users can only insert their own items
CREATE POLICY "Users can insert own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own items
CREATE POLICY "Users can delete own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);
```

### Redis Cache Schema

```json
{
  "key": "search:{query}:{marketplace}",
  "value": {
    "results": [...],
    "timestamp": "2025-12-10T..."
  },
  "expiry": 86400  // 24 hours
}
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Python 3.11+ (Anaconda recommended)
- Supabase account
- eBay Developer account
- Google AI Studio account (Gemini API)
- Upstash Redis account

### Installation

1. **Clone Repository:**
```bash
git clone <repository-url>
cd TreasureHunt
```

2. **Frontend Setup:**
```bash
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
```

Create `backend/.env`:
```env
# Supabase
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_service_role_key

# eBay
EBAY_APP_ID=your_app_id
EBAY_CERT_ID=your_cert_id

# Google AI
GOOGLE_API_KEY=your_gemini_api_key

# Redis
UPSTASH_REDIS_URL=your_redis_url
UPSTASH_REDIS_TOKEN=your_redis_token

# Vinted
VINTED_DOMAIN=com
```

4. **Run Development Servers:**

Frontend:
```bash
npm run dev
# Opens on http://localhost:3000
```

Backend:
```bash
cd backend
uvicorn main:app --reload --port 8000
# Opens on http://localhost:8000
```

## 🔧 Configuration

### AI Model Configuration

Current model: `models/gemini-2.5-flash`

To change AI model, edit `backend/services/ai.py`:
```python
self.model = genai.GenerativeModel("models/gemini-2.5-flash")
```

Available models:
- `gemini-2.5-flash` - Fastest, best for production
- `gemini-pro-vision` - Better image analysis
- `gemini-pro` - Text-only, higher accuracy

### Cache Configuration

Adjust cache TTL in `backend/services/cache.py`:
```python
await self.redis.set(key, value, ex=86400)  # 24 hours
```

To disable caching during development:
```python
# In backend/routers/search.py
cached_result = None  # Skip cache
```

### Marketplace Configuration

**eBay Settings** (`backend/services/ebay.py`):
- `limit`: Number of results (default: 50)
- `filter`: FIXED_PRICE, AUCTION, or BOTH
- `condition`: NEW, USED, UNSPECIFIED

**Vinted Settings** (`backend/services/vinted.py`):
- `per_page`: Results per page (default: 5)
- `order`: RELEVANCE, PRICE_HIGH_TO_LOW, PRICE_LOW_TO_HIGH, NEWEST_FIRST

## 📈 Performance Optimizations

1. **Parallel API Calls**: eBay and Vinted searched simultaneously using `asyncio.gather()`
2. **Redis Caching**: 24-hour cache reduces API calls by ~80%
3. **Top 5 AI Analysis**: Only analyze most promising items to save API costs
4. **Image Optimization**: AI downloads images asynchronously
5. **Client-Side Filtering**: No backend calls when changing filters
6. **Token Caching**: eBay OAuth token cached for 2 hours

## 🐛 Known Issues & Solutions

### Issue: Vinted Returns 0 Results
**Cause**: Price format parsing error  
**Solution**: Parse `price["amount"]` instead of `price` directly

### Issue: AI Confidence Always 50%
**Cause**: Generic prompts for all items  
**Solution**: Implemented category detection with fashion specialization

### Issue: Market Price Shows $0
**Cause**: AI failed to estimate price  
**Solution**: Added market price lookup from eBay sold listings

### Issue: Redis Cache Format Error
**Cause**: Storing Python dict directly  
**Solution**: JSON serialize before caching

## 🔮 Future Enhancements

### Planned Features
- [ ] Vinted sold listings for market price (currently eBay only)
- [ ] Email alerts for matching deals
- [ ] Price history graphs
- [ ] Browser extension for on-page analysis
- [ ] Mobile app (React Native)
- [ ] More marketplaces (Poshmark, Mercari, Depop)
- [ ] Advanced filters (brand, size, color)
- [ ] Profit calculator with fees/shipping
- [ ] Community features (share finds, ratings)

### Technical Improvements
- [ ] Rate limiting for API protection
- [ ] Webhooks for real-time updates
- [ ] GraphQL API for flexible queries
- [ ] Elasticsearch for better search
- [ ] Image similarity search
- [ ] A/B testing framework
- [ ] Analytics dashboard

## 🧪 Testing

### Manual Testing Checklist

**Authentication:**
- [ ] Sign up with new account
- [ ] Login with existing account
- [ ] Logout functionality
- [ ] Session persistence

**Search:**
- [ ] Basic keyword search
- [ ] eBay-only search
- [ ] Vinted-only search
- [ ] Dual marketplace search
- [ ] Empty results handling

**Filters:**
- [ ] Price range slider
- [ ] Marketplace toggle
- [ ] Confidence threshold
- [ ] Filter combinations

**AI Analysis:**
- [ ] Fashion item recognition
- [ ] Brand detection
- [ ] Market price accuracy
- [ ] Confidence scoring

**Saved Items:**
- [ ] Save item functionality
- [ ] View saved items
- [ ] Delete saved item
- [ ] User isolation (RLS)

## 📝 API Documentation

### Backend Endpoints

**POST /search**
```json
Request:
{
  "query": "string",
  "user_id": "uuid"
}

Response:
{
  "results": [
    {
      "title_vague": "Red Supreme Shirt",
      "title_real": "Supreme Box Logo Tee SS21",
      "price_listed": 45.00,
      "price_estimated": 150.00,
      "profit_potential": 105.00,
      "confidence": 85,
      "marketplace": "eBay",
      "image_url": "https://...",
      "market_url": "https://..."
    }
  ]
}
```

**POST /items**
```json
Request:
{
  "item": {
    "title_vague": "string",
    "title_real": "string",
    "price_listed": 0,
    "price_estimated": 0,
    "profit_potential": 0,
    "image_url": "string",
    "market_url": "string",
    "marketplace": "string",
    "confidence": 0
  },
  "user_id": "uuid"
}

Response:
{
  "message": "Item saved successfully"
}
```

**GET /items/{user_id}**
```json
Response:
{
  "items": [...]
}
```

**DELETE /items/{item_id}**
```json
Response:
{
  "message": "Item deleted successfully"
}
```

## 🤝 Contributing

### Development Workflow

1. Create feature branch: `git checkout -b feature/new-feature`
2. Make changes with proper commit messages
3. Test thoroughly
4. Submit pull request

### Code Style

**Python (Backend):**
- Follow PEP 8
- Use type hints
- Async/await for I/O operations
- Docstrings for all functions

**TypeScript (Frontend):**
- Use TypeScript strict mode
- Functional components with hooks
- Proper interface definitions
- ESLint compliance

## 📄 License

This project is proprietary. All rights reserved.

## 👨‍💻 Author

**Keenan Sylo**
- Project: TreasureHunt
- Started: December 2025

## 🙏 Acknowledgments

- **Google Gemini AI** - Powerful image and text analysis
- **eBay Browse API** - Comprehensive marketplace data
- **Vinted API** - Fashion marketplace integration
- **Supabase** - Auth and database infrastructure
- **Upstash Redis** - Lightning-fast caching
- **Next.js** - Modern React framework
- **FastAPI** - High-performance Python backend
