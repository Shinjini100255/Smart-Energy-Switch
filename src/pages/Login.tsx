import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../components/ui';
import { motion } from 'motion/react';
import { Zap, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { fetchProfileFromSupabase, fetchChatHistoryFromSupabase } from '../lib/storage';

export const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignUp, setIsSignUp] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        
        if (data.user) {
          // Manually sync to login_profiles and energy_profiles to be safe
          // (The trigger should handle this, but manual sync ensures immediate availability)
          await supabase.from('login_profiles').upsert({
            id: data.user.id,
            email: email,
          });

          await supabase.from('energy_profiles').upsert({
            id: data.user.id,
            email: email,
          });
        }

        alert('Account created! You can now sign in.');
        setIsSignUp(false);
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;

        // Fetch existing data for "Smart Memory"
        const profile = await fetchProfileFromSupabase();
        await fetchChatHistoryFromSupabase();

        if (profile && profile.name) {
          navigate('/dashboard');
        } else {
          navigate('/profile-setup');
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCF9] dark:bg-[#121411] flex items-center justify-center p-8 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-olive-dark/5 rounded-full blur-[150px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-terracotta/5 rounded-full blur-[150px]" />

      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg relative z-10"
      >
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-olive-dark rounded-[24px] flex items-center justify-center shadow-2xl shadow-olive-dark/30">
              <Zap className="h-9 w-9 text-sand" />
            </div>
          </div>
          <h1 className="font-serif text-4xl font-bold text-ink dark:text-[#E4E3DA] tracking-tight">SMART ENERGY SWITCH</h1>
          <p className="text-muted dark:text-muted mt-4 text-xl">Resilient cooking solutions for the modern home.</p>
        </div>

        <Card className="overflow-hidden border-none shadow-2xl rounded-[48px]">
          <CardHeader className="text-center p-12 pb-0 bg-white dark:bg-[#1A1C18]">
            <CardTitle className="text-3xl font-bold text-ink dark:text-[#E4E3DA]">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </CardTitle>
            <p className="text-base text-muted dark:text-muted mt-3">
              {isSignUp ? 'Join the sustainable energy movement' : 'Enter your credentials to continue'}
            </p>
          </CardHeader>
          <CardContent className="p-12 bg-bg-card dark:bg-[#242622]">
            <form onSubmit={handleAuth} className="space-y-8">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-xl text-center font-bold">
                  {error}
                </div>
              )}
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px] ml-1">Email Address</label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px] ml-1">Password</label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading}
                className="w-full h-16 rounded-2xl bg-olive-dark text-white font-bold text-xl shadow-2xl shadow-olive-dark/20 transition-all hover:scale-[1.02] mt-6 flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (isSignUp ? 'Sign Up' : 'Sign In')}
              </Button>
              <div className="text-center">
                <button 
                  type="button" 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-xs font-bold text-muted dark:text-muted hover:text-olive-dark dark:hover:text-sand transition-colors uppercase tracking-[3px]"
                >
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
