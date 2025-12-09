import React, { useState } from 'react';
import { Sparkles, TrendingUp, Gem, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { createClient } from '@/lib/supabase';

interface LoginProps {
  onSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          setSuccess('Account created! Check your email to verify your account.');
          setTimeout(() => {
            setIsSignUp(false);
            setSuccess('');
          }, 3000);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          onSuccess();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-rose-50 to-red-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-red-200/40 to-orange-200/30 rounded-full blur-3xl animate-float-slow"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-orange-200/30 to-pink-200/40 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-red-500 to-orange-500 text-white text-sm font-bold shadow-xl shadow-red-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
              </span>
              Live Treasure Hunting
            </div>
            
            <h1 className="text-6xl font-black text-slate-900 leading-tight">
              Find <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500">Hidden Gems</span>
              <br />Before Anyone Else
            </h1>
            
            <p className="text-lg text-slate-600 leading-relaxed">
              Join thousands of treasure hunters using AI to spot undervalued items and make profit.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Sparkles, label: 'Items Found', value: '2.8k+' },
              { icon: TrendingUp, label: 'Avg Profit', value: '$347' },
              { icon: Gem, label: 'Success Rate', value: '94%' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-slate-200 shadow-sm">
                <stat.icon className="w-5 h-5 text-red-500 mb-2" />
                <div className="text-2xl font-black text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Testimonial */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <svg key={i} className="w-5 h-5 text-orange-400 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
            <p className="text-slate-700 italic mb-3">
              "Found a vintage Leica for $80 that sold for $1,200. This app paid for itself in one find!"
            </p>
            <div className="font-bold text-slate-900">Sarah M.</div>
            <div className="text-xs text-slate-500">Vintage Camera Collector</div>
          </div>
        </div>

        {/* Right Side - Auth Form */}
        <div className="w-full max-w-md mx-auto">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-slate-200 p-8 space-y-6">
            
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900">
                {isSignUp ? 'Start Hunting' : 'Welcome Back'}
              </h2>
              <p className="text-slate-600">
                {isSignUp 
                  ? 'Create your account to discover hidden gems' 
                  : 'Sign in to continue your treasure hunt'}
              </p>
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                {success}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="text-xs text-slate-500 mt-1">Minimum 6 characters</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white font-bold rounded-xl transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle Sign Up / Sign In */}
            <div className="text-center pt-4 border-t border-slate-100">
              <p className="text-slate-600">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                    setSuccess('');
                  }}
                  className="text-red-600 font-bold hover:text-red-700 transition-colors"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="lg:hidden mt-6 grid grid-cols-3 gap-3">
            {[
              { label: 'Items', value: '2.8k+' },
              { label: 'Profit', value: '$347' },
              { label: 'Rate', value: '94%' }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-slate-200 text-center">
                <div className="text-lg font-black text-slate-900">{stat.value}</div>
                <div className="text-xs text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
