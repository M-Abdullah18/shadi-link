import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, HeartHandshake, ArrowRight, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { loginAdmin, checkAdminAuth, AuthApiError } from '../api/auth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { isUrdu } = useLanguage();
  const navigate = useNavigate();

  // If already authenticated, redirect immediately to /admin/dashboard
  useEffect(() => {
    let isMounted = true;
    checkAdminAuth().then((isAuthenticated) => {
      if (isMounted) {
        if (isAuthenticated) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          setCheckingAuth(false);
        }
      }
    });
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;

    setError(null);
    setLoading(true);

    try {
      await loginAdmin(email, password);
      setSuccess(true);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 400);
    } catch (err: any) {
      setLoading(false);
      if (err instanceof AuthApiError) {
        if (err.code === 'UNAUTHORIZED' || err.status === 401) {
          setError(
            isUrdu
              ? 'درج کردہ ای میل یا پاس ورڈ درست نہیں ہے۔'
              : 'Invalid email or password'
          );
        } else if (err.code === 'RATE_LIMITED' || err.status === 429) {
          setError(
            isUrdu
              ? 'بہت زیادہ کوششیں کی گئیں۔ براہ کرم ۱۵ منٹ بعد دوبارہ کوشش کیجیے۔'
              : 'Too many login attempts. Please try again in 15 minutes.'
          );
        } else {
          // 5xx or non-JSON response from server
          setError(
            isUrdu
              ? 'سرور جواب نہیں دے رہا ہے۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کیجیے۔'
              : 'The server is not responding. Please try again later.'
          );
        }
      } else {
        // Network failure or unexpected non-JSON response
        setError(
          isUrdu
            ? 'سرور جواب نہیں دے رہا ہے۔ براہ کرم کچھ دیر بعد دوبارہ کوشش کیجیے۔'
            : 'The server is not responding. Please try again later.'
        );
      }
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center bg-canvas">
        <div className="flex items-center gap-2.5 text-content-muted text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span>{isUrdu ? 'توثیق کی جا رہی ہے...' : 'Verifying session...'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-canvas">
      <div className="max-w-md w-full bg-surface border border-border rounded-2xl p-8 sm:p-10 shadow-card relative overflow-hidden">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary-subtle border border-accent/40 flex items-center justify-center mx-auto mb-4 shadow-sm">
            <HeartHandshake className="w-7 h-7 text-primary" />
          </div>
          <h2 className={`text-2xl sm:text-3xl font-bold text-content ${isUrdu ? 'font-urdu-heading text-primary' : 'font-serif'}`}>
            {isUrdu ? 'ایڈمن لاگ ان' : 'Admin Login'}
          </h2>
          <p className={`text-xs sm:text-sm text-content-muted mt-2 font-normal ${isUrdu ? 'font-urdu-body' : 'font-sans'}`}>
            {isUrdu
              ? 'یہ لاگ ان صرف سائٹ ایڈمنسٹریٹر کے لیے مخصوص ہے۔'
              : 'Restricted portal for the site administrator only.'}
          </p>
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-error-subtle border border-error/30 text-error text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className={isUrdu ? 'font-urdu-body' : ''}>{error}</span>
          </div>
        )}

        {/* Success notification */}
        {success && (
          <div className="mb-6 p-4 rounded-xl bg-success-subtle border border-success/30 text-success text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className={isUrdu ? 'font-urdu-body' : ''}>
              {isUrdu ? 'کامیابی سے لاگ ان ہو گئے۔ ڈیش بورڈ پر منتقل کیا جا رہا ہے...' : 'Login successful. Redirecting to dashboard...'}
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`block text-xs font-semibold text-content uppercase tracking-wider mb-2 ${isUrdu ? 'font-urdu-body' : ''}`}>
              {isUrdu ? 'ای میل ایڈریس' : 'Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-5 h-5 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                disabled={loading || success}
                className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-content placeholder:text-content-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm disabled:opacity-60"
              />
            </div>
          </div>

          <div>
            <label className={`block text-xs font-semibold text-content uppercase tracking-wider mb-2 ${isUrdu ? 'font-urdu-body' : ''}`}>
              {isUrdu ? 'پاس ورڈ' : 'Password'}
            </label>
            <div className="relative">
              <Lock className="w-5 h-5 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading || success}
                className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-sm text-content placeholder:text-content-subtle focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm disabled:opacity-60"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="min-h-[48px] h-12 w-full rounded-xl bg-primary hover:bg-primary-hover text-primary-content font-medium text-sm shadow-sm transition-all active:scale-95 flex items-center justify-center gap-2 mt-6 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className={isUrdu ? 'font-urdu-body' : ''}>
                  {isUrdu ? 'تصدیق ہو رہی ہے...' : 'Signing In...'}
                </span>
              </>
            ) : (
              <>
                <span className={isUrdu ? 'font-urdu-body' : ''}>
                  {isUrdu ? 'سائن ان کریں' : 'Sign In'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
