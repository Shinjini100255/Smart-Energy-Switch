import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Lightbulb, ShoppingCart, ChefHat, LogOut, Menu, X, User, Settings, Users, Zap, Landmark } from 'lucide-react';
import { clearProfile, clearChatHistory } from '../lib/storage';
import { t } from '../lib/i18n';
import { supabase } from '../lib/supabase';

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    clearProfile();
    clearChatHistory();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: t('dashboard'), icon: Home },
    { path: '/recommendations', label: t('switch_expert'), icon: Lightbulb },
    { path: '/community', label: t('community'), icon: Users },
    { path: '/vendors', label: t('marketplace'), icon: ShoppingCart },
    { path: '/recipes', label: t('kitchen'), icon: ChefHat },
    { path: '/schemes', label: 'Gov Schemes', icon: Landmark },
  ];

  const bottomNavItems = [
    { path: '/profile-setup', label: t('profile'), icon: User },
    { path: '/settings', label: t('settings'), icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FDFCF9] dark:bg-[#121411] flex text-ink dark:text-[#E4E3DA] transition-colors duration-300">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-[300px] bg-white dark:bg-[#1A1C18] border-r border-sand/10 fixed h-full z-10 py-12 px-8 shadow-sm">
        <div className="flex items-center gap-4 mb-14 px-2">
          <div className="w-12 h-12 bg-olive-dark rounded-2xl flex items-center justify-center shadow-xl shadow-olive-dark/20">
            <Zap className="h-7 w-7 text-sand" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-xl font-bold leading-none tracking-tight">SMART ENERGY</span>
            <span className="text-[10px] font-bold text-terracotta tracking-[4px] mt-1.5">SWITCH</span>
          </div>
        </div>
        
        <nav className="flex-1 space-y-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-olive-dark text-white shadow-xl shadow-olive-dark/10' 
                    : 'text-muted dark:text-muted hover:bg-sand/10 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-sand' : 'text-muted dark:text-muted'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-10 border-t border-sand/10 space-y-3">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-4 px-5 py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                  isActive 
                    ? 'bg-olive-dark text-white shadow-xl shadow-olive-dark/10' 
                    : 'text-muted dark:text-muted hover:bg-sand/10 dark:hover:bg-white/5 hover:text-ink dark:hover:text-white'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-sand' : 'text-muted dark:text-muted'}`} />
                {item.label}
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-4 px-5 py-4 w-full rounded-2xl text-sm font-bold text-terracotta hover:bg-terracotta/5 transition-all mt-6"
          >
            <LogOut className="h-5 w-5" />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-20 bg-white dark:bg-[#1A1C18] border-b border-sand/10 flex items-center justify-between px-8 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-olive-dark rounded-xl flex items-center justify-center">
            <Zap className="h-5 w-5 text-sand" />
          </div>
          <span className="font-serif font-bold text-base tracking-tight">SMART ENERGY SWITCH</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-ink dark:text-white">
          {isMobileMenuOpen ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
        </button>
      </div>


      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-20 bg-white dark:bg-[#121411] text-ink dark:text-[#E4E3DA] z-10 flex flex-col">
          <nav className="flex-1 p-8 space-y-3">
            {[...navItems, ...bottomNavItems].map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-6 py-5 rounded-2xl text-base font-bold transition-all ${
                    isActive 
                      ? 'bg-olive-dark text-white shadow-lg' 
                      : 'text-muted hover:bg-sand/10 dark:hover:bg-white/5'
                  }`}
                >
                  <Icon className={`h-6 w-6 ${isActive ? 'text-sand' : 'text-muted'}`} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="p-8 border-t border-sand/10">
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-4 px-6 py-5 w-full rounded-2xl bg-terracotta text-white font-bold shadow-lg"
            >
              <LogOut className="h-6 w-6" />
              {t('logout')}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-[300px] pt-20 md:pt-0 min-h-screen">
        <div className="p-8 md:p-12 max-w-7xl mx-auto flex flex-col gap-10">
          {children}
        </div>
      </main>
    </div>
  );
};
