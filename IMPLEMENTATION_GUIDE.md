# TreasureHunt Implementation Guide

## Phase 1: Environment Setup (Day 1)

### 1.1 Supabase Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "New Project"
   - Name: "TreasureHunt"
   - Generate a strong database password (save it!)
   - Select region closest to your users
   - Wait for provisioning (~2 minutes)

2. **Get Your Credentials**
   - Go to Project Settings > API
   - Copy `Project URL` → This is `NEXT_PUBLIC_SUPABASE_URL`
   - Copy `anon/public` key → This is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Create Database Tables**
   - Go to SQL Editor in Supabase Dashboard
   - Run this SQL:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create saved_items table
CREATE TABLE saved_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    external_id TEXT NOT NULL,
    vague_title TEXT NOT NULL,
    real_identify TEXT NOT NULL,
    listing_price DECIMAL(10, 2) NOT NULL,
    estimated_value DECIMAL(10, 2) NOT NULL,
    confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
    image_url TEXT,
    item_url TEXT,
    marketplace TEXT DEFAULT 'eBay',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster queries
CREATE INDEX idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX idx_saved_items_created_at ON saved_items(created_at DESC);

-- Enable Row Level Security
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own saved items"
    ON saved_items FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved items"
    ON saved_items FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved items"
    ON saved_items FOR DELETE
    USING (auth.uid() = user_id);
```

4. **Enable Authentication Providers**
   - Go to Authentication > Providers
   - Enable Email provider (already enabled by default)
   - Enable Google OAuth:
     - Go to Google Cloud Console
     - Create OAuth 2.0 credentials
     - Add authorized redirect URI: `https://[YOUR-PROJECT-ID].supabase.co/auth/v1/callback`
     - Copy Client ID and Secret to Supabase

### 1.2 API Keys Setup

1. **OpenAI API Key**
   - Go to https://platform.openai.com/api-keys
   - Create new secret key
   - Copy immediately (you won't see it again)
   - Cost: ~$0.01-0.05 per image analysis

2. **eBay API Key**
   - Go to https://developer.ebay.com/
   - Sign up for developer account
   - Go to "Get Your Application Keys"
   - Create "Production Keys" (requires business verification) OR "Sandbox Keys" (for testing)
   - Copy the App ID (Client ID)

3. **Create Environment File**
   - Create `.env.local` in project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# OpenAI
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx

# eBay
EBAY_APP_ID=your-ebay-app-id-here
EBAY_CERT_ID=your-ebay-cert-id-here (if using production)

# Optional: Gemini (alternative to OpenAI)
GOOGLE_GEMINI_API_KEY=your-gemini-key-here
```

---

## Phase 2: Project Migration (Day 1-2)

### 2.1 Current State Analysis

Your current project has:
- ✅ Basic React + Vite setup
- ✅ Tailwind CSS configured
- ✅ Mock data structure
- ✅ UI components (Layout, Home, Search, Detail pages)
- ❌ No backend/API integration
- ❌ No authentication
- ❌ No real data fetching

### 2.2 Install Required Dependencies

```bash
# Install Supabase client
npm install @supabase/supabase-js @supabase/auth-helpers-react

# Install React Query for data fetching
npm install @tanstack/react-query @tanstack/react-query-devtools

# Install Framer Motion for animations
npm install framer-motion

# Install axios for HTTP requests
npm install axios

# Install date utilities
npm install date-fns
```

### 2.3 Create Supabase Client

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

Update `.env.local` for Vite:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxx
VITE_EBAY_APP_ID=your-ebay-app-id-here
```

---

## Phase 3: Backend API Routes (Day 2-3)

Since you're using Vite (not Next.js), you'll need a separate backend. Options:

### Option A: Add Express Backend to Current Project

1. **Install Express**
```bash
npm install express cors dotenv
npm install --save-dev @types/express @types/cors nodemon
```

2. **Create `server/` directory structure**
```
server/
├── index.js
├── routes/
│   ├── search.js
│   └── items.js
└── services/
    ├── ebay.js
    └── openai.js
```

3. **Create `server/index.js`**
```javascript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import searchRoutes from './routes/search.js';
import itemsRoutes from './routes/items.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/search', searchRoutes);
app.use('/api/items', itemsRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

4. **Update `package.json`**
```json
{
  "scripts": {
    "dev": "concurrently \"vite\" \"nodemon server/index.js\"",
    "server": "nodemon server/index.js",
    "client": "vite"
  }
}
```

### Option B: Migrate to Next.js (Recommended for PRD)

Since the PRD specifies Next.js, you might want to migrate:

```bash
# In a new directory
npx create-next-app@latest treasurehunt-nextjs --typescript --tailwind --app
# Then copy your components over
```

---

## Phase 4: Authentication Implementation (Day 3-4)

### 4.1 Create Auth Context

Create `contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, session, signIn, signUp, signOut, signInWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

### 4.2 Create Login Page

Create `pages/Login.tsx`:

```typescript
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password);
        alert('Check your email for verification link!');
      } else {
        await signIn(email, password);
        navigate('/');
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-rose-50 to-red-50">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <h1 className="text-3xl font-black text-slate-900 mb-6">
          {isSignUp ? 'Join' : 'Welcome to'} <span className="text-red-600">TreasureHunt</span>
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold py-3 rounded-lg hover:from-red-700 hover:to-orange-600 transition-all"
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t border-slate-300"></div>
          <span className="px-4 text-slate-500 text-sm">OR</span>
          <div className="flex-1 border-t border-slate-300"></div>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full border-2 border-slate-300 text-slate-700 font-bold py-3 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        <p className="mt-6 text-center text-slate-600">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-red-600 font-bold hover:underline"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
```

---

## Phase 5: Core Feature Implementation (Day 5-7)

### 5.1 eBay Search Service

Create `services/ebay.ts`:

```typescript
import axios from 'axios';

const EBAY_FINDING_API = 'https://svcs.ebay.com/services/search/FindingService/v1';

export interface EbayItem {
  itemId: string;
  title: string;
  price: number;
  imageUrl: string;
  itemUrl: string;
  condition: string;
}

export async function searchEbay(query: string, maxPrice: number = 200): Promise<EbayItem[]> {
  try {
    const response = await axios.get(EBAY_FINDING_API, {
      params: {
        'OPERATION-NAME': 'findItemsByKeywords',
        'SERVICE-VERSION': '1.0.0',
        'SECURITY-APPNAME': import.meta.env.VITE_EBAY_APP_ID,
        'RESPONSE-DATA-FORMAT': 'JSON',
        'REST-PAYLOAD': '',
        'keywords': query,
        'paginationInput.entriesPerPage': '20',
        'itemFilter(0).name': 'MaxPrice',
        'itemFilter(0).value': maxPrice,
        'itemFilter(1).name': 'Condition',
        'itemFilter(1).value': 'Used',
      },
    });

    const items = response.data.findItemsByKeywordsResponse[0].searchResult[0].item || [];
    
    return items
      .filter((item: any) => isVagueTitle(item.title[0]))
      .map((item: any) => ({
        itemId: item.itemId[0],
        title: item.title[0],
        price: parseFloat(item.sellingStatus[0].currentPrice[0].__value__),
        imageUrl: item.galleryURL?.[0] || '',
        itemUrl: item.viewItemURL[0],
        condition: item.condition?.[0].conditionDisplayName?.[0] || 'Used',
      }));
  } catch (error) {
    console.error('eBay API Error:', error);
    throw error;
  }
}

function isVagueTitle(title: string): boolean {
  const vagueKeywords = ['old', 'vintage', 'antique', 'used', 'chair', 'watch', 'camera', 'lamp'];
  const lowerTitle = title.toLowerCase();
  return vagueKeywords.some(keyword => lowerTitle.includes(keyword)) && 
         lowerTitle.split(' ').length < 6;
}
```

### 5.2 OpenAI Vision Service

Create `services/openai.ts`:

```typescript
import axios from 'axios';

export interface AIAnalysis {
  real_model: string;
  est_value: number;
  is_undervalued: boolean;
  confidence_score: number;
}

export async function analyzeImage(imageUrl: string, vagueTitle: string): Promise<AIAnalysis> {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an expert at identifying valuable items from images. 
            Analyze this item listed as "${vagueTitle}" and identify its true model/brand. 
            Estimate its market value. Return ONLY valid JSON in this exact format:
            {"real_model": "specific brand and model", "est_value": number, "is_undervalued": boolean, "confidence_score": number 1-100}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
        max_tokens: 300
      },
      {
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const content = response.data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
}
```

---

## Phase 6: Testing Checklist

- [ ] Supabase connection works (test with SQL query)
- [ ] User can sign up with email
- [ ] User can sign in with Google OAuth
- [ ] eBay API returns items
- [ ] OpenAI Vision API analyzes image correctly
- [ ] Items save to `saved_items` table
- [ ] RLS policies work (user can only see their items)
- [ ] Animations work smoothly
- [ ] Mobile responsive design works

---

## Phase 7: Deployment

### Option A: Deploy on Vercel (Recommended for Next.js)
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Option B: Deploy on Netlify (For Vite)
```bash
npm run build
netlify deploy --prod --dir=dist
```

---

## Cost Estimates

- **Supabase:** Free tier (50,000 monthly active users, 500MB database)
- **OpenAI:** ~$0.01-0.05 per image analysis (gpt-4o-mini vision)
- **eBay API:** Free (5,000 calls/day on production keys)
- **Hosting:** Free (Vercel/Netlify free tier)

**Total Monthly Cost for MVP:** $5-20 (mostly OpenAI API usage)

---

## Next Steps

1. ✅ Read this guide completely
2. ⬜ Set up Supabase project and get credentials
3. ⬜ Get eBay and OpenAI API keys
4. ⬜ Install dependencies
5. ⬜ Implement authentication
6. ⬜ Build API routes
7. ⬜ Test with real data
8. ⬜ Deploy to production

Would you like me to start implementing any specific phase?
