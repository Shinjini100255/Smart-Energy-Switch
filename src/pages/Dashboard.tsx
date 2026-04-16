import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { getProfile, fetchProfileFromSupabase, fetchChatHistoryFromSupabase } from '../lib/storage';
import { UserProfile, NewsItem, GovernmentScheme } from '../types';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { 
  AlertTriangle, 
  Zap, 
  Flame, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Newspaper, 
  Radio, 
  Landmark, 
  ExternalLink, 
  ArrowRight,
  Calendar,
  Map as MapIcon,
  ChevronRight,
  Info,
  ChefHat,
  Leaf
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { t } from '../lib/i18n';

// Mock real-time data generator
const generateRealTimeData = () => ({
  lpgPrice: 900 + Math.floor(Math.random() * 50),
  electricityStability: Math.floor(Math.random() * 20) + 80, // 80-100%
  crisisLevel: Math.random() > 0.7 ? 'High' : (Math.random() > 0.4 ? 'Medium' : 'Low'),
});

const energyData = [
  { name: 'Mon', usage: 4.2 },
  { name: 'Tue', usage: 3.8 },
  { name: 'Wed', usage: 5.1 },
  { name: 'Thu', usage: 4.5 },
  { name: 'Fri', usage: 3.9 },
  { name: 'Sat', usage: 2.8 },
  { name: 'Sun', usage: 3.1 },
];

const MOCK_NEWS: NewsItem[] = [
  { id: '1', headline: 'LPG Subsidy Reduced by ₹50 in Metro Areas', source: 'Energy Times', timestamp: '10 mins ago', type: 'alert', category: 'Price' },
  { id: '2', headline: 'PM Surya Ghar Scheme Expanded to Rural Districts', source: 'Gov Portal', timestamp: '1 hour ago', type: 'update', category: 'Policy' },
];

const GOV_SCHEMES: GovernmentScheme[] = [
  { 
    id: '1', 
    title: 'PM Surya Ghar Muft Bijli Yojana', 
    description: 'Provides free electricity up to 300 units per month through rooftop solar.', 
    eligibility: 'All residential households with a suitable roof.', 
    benefits: 'Up to ₹78,000 subsidy for 3kW installation.',
    status: 'Active',
    url: 'https://pmsuryaghar.gov.in/',
    type: 'solar' 
  },
];

export const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [realTimeData, setRealTimeData] = useState(generateRealTimeData());
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    const init = async () => {
      let p = getProfile();
      
      if (!p) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          p = await fetchProfileFromSupabase();
          await fetchChatHistoryFromSupabase();
        }
      }

      if (!p || !p.name) {
        navigate('/profile-setup');
      } else {
        setProfile(p);
      }
      setLoading(false);
    };

    init();

    const interval = setInterval(() => {
      setRealTimeData(generateRealTimeData());
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, [navigate]);

  if (loading) return (
    <div className="flex items-center justify-center h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-olive-dark"></div>
    </div>
  );

  if (!profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-12"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold text-ink dark:text-white tracking-tight">
            {t('welcome')}, {profile.name || profile.email.split('@')[0]}
          </h1>
          <p className="text-muted dark:text-muted mt-2 text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-terracotta" /> {profile.location}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <div className="flex items-center gap-3 bg-white dark:bg-white/10 px-4 py-2 rounded-full border border-sand/30 dark:border-white/10 shadow-sm">
            <Radio className="h-4 w-4 text-green-500 animate-pulse" />
            <span className="text-sm font-bold text-green-500 uppercase tracking-wider">Live Intelligence</span>
          </div>
          <span className="text-[10px] text-muted font-bold uppercase tracking-widest mr-4">Updated: {lastUpdated.toLocaleTimeString()}</span>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        
        {/* Main Stats Card - Spans 2 columns */}
        <Card className="md:col-span-2 lg:col-span-2 overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted dark:text-muted flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-olive-dark dark:text-sand" />
                Energy Usage Trend
              </CardTitle>
              <div className="text-xs font-bold text-olive-dark bg-olive-dark/10 px-3 py-1 rounded-full">
                -12% vs last week
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-[280px] pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={energyData}>
                <defs>
                  <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4A5D4E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4A5D4E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#7C7D79' }}
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                    backgroundColor: '#FFFFFF',
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="usage" 
                  stroke="#4A5D4E" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorUsage)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Quick Action: Emergency */}
        <Card className="bg-red-600 text-white border-none shadow-lg shadow-red-600/20 flex flex-col justify-between p-8">
          <div>
            <div className="bg-white/20 w-14 h-14 rounded-2xl flex items-center justify-center mb-8">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h3 className="text-3xl font-serif font-bold leading-tight">
              {t('emergency')}
            </h3>
            <p className="text-white/80 mt-4 text-base leading-relaxed">LPG shortage in your area? Get immediate alternatives.</p>
          </div>
          <Link to="/recommendations">
            <Button variant="secondary" className="w-full mt-10 bg-yellow-400 text-ink hover:bg-yellow-300 border-none h-14 rounded-2xl font-bold shadow-xl">
              {t('need_now')} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </Card>

        {/* Real-time Market Stats */}
        <Card className="p-8 flex flex-col justify-between">
          <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted dark:text-muted flex items-center gap-2 mb-8">
            <Zap className="h-4 w-4 text-sand" />
            Market Pulse
          </CardTitle>
          <div className="space-y-8">
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted dark:text-muted tracking-widest">LPG Price</span>
                <div className="text-3xl font-serif font-bold text-ink dark:text-[#E4E3DA]">₹{realTimeData.lpgPrice}</div>
              </div>
              <div className="text-xs font-bold text-terracotta flex items-center gap-1 mb-1">
                <TrendingUp className="h-3 w-3" /> +₹12
              </div>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted dark:text-muted tracking-widest">Grid Stability</span>
                <div className="text-3xl font-serif font-bold text-ink dark:text-[#E4E3DA]">{realTimeData.electricityStability}%</div>
              </div>
              <div className="text-xs font-bold text-olive-dark dark:text-sand flex items-center gap-1 mb-1">
                Stable
              </div>
            </div>
            <div className="pt-6 border-t border-sand/10 dark:border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${realTimeData.crisisLevel === 'High' ? 'bg-terracotta' : 'bg-olive-dark'}`} />
                <span className="text-xs font-bold uppercase tracking-widest text-muted dark:text-muted">Crisis Level: {realTimeData.crisisLevel}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Government Schemes Snippet */}
        <Card className="md:col-span-2 lg:col-span-2 overflow-hidden">
          <CardHeader className="pb-4 border-b border-sand/10">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
                <Landmark className="h-4 w-4 text-olive-dark" />
                Active Schemes
              </CardTitle>
              <Link to="/dashboard" className="text-xs font-bold text-olive-dark hover:underline">View All</Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {GOV_SCHEMES.map((scheme) => (
              <div key={scheme.id} className="p-8 hover:bg-sand/5 transition-colors border-b border-sand/5 last:border-none">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-xl text-ink dark:text-[#E4E3DA]">{scheme.title}</h4>
                  <Button variant="outline" className="h-10 px-4 text-sm rounded-full border-sand text-olive-dark dark:text-sand" onClick={() => window.open(scheme.url, '_blank')}>
                    Apply <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted dark:text-muted leading-relaxed mb-6">{scheme.description}</p>
                <div className="flex gap-3">
                  <span className="px-3 py-1 bg-olive-dark/10 text-olive-dark text-[10px] font-bold rounded-full uppercase tracking-wider">{scheme.status}</span>
                  <span className="px-3 py-1 bg-sand/10 text-sand text-[10px] font-bold rounded-full uppercase tracking-wider">Subsidy Available</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Community Insight Snippet */}
        <Card className="md:col-span-1 lg:col-span-1 overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <MapIcon className="h-4 w-4 text-olive-dark" />
              Local Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-6 bg-beige/30 dark:bg-white/5 rounded-[24px] border border-sand/10">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-terracotta rounded-full animate-pulse" />
                <span className="text-[10px] font-bold uppercase text-terracotta tracking-widest">Live Alert</span>
              </div>
              <p className="text-sm font-medium text-ink dark:text-[#E4E3DA]/80 leading-relaxed">Gas shortage reported in Dadar West. 12 users switched today.</p>
            </div>
            <Link to="/community" className="flex items-center justify-between text-sm font-bold text-olive-dark dark:text-sand hover:underline group px-2">
              Intelligence Map
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </CardContent>
        </Card>

        {/* News & Alerts */}
        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <Newspaper className="h-4 w-4 text-olive-dark" />
              Latest Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {MOCK_NEWS.map((news) => (
              <div key={news.id} className="group cursor-pointer border-b border-sand/5 last:border-none pb-4 last:pb-0">
                <div className="flex justify-between items-start mb-2">
                  <h5 className="text-sm font-bold text-ink dark:text-[#E4E3DA] group-hover:text-terracotta transition-colors line-clamp-2 leading-snug">{news.headline}</h5>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted font-bold uppercase tracking-widest">
                  <span>{news.source}</span>
                  <span className="text-sand">•</span>
                  <span>{news.timestamp}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* AI Switch Advisor Promo */}
        <Card className="md:col-span-2 lg:col-span-2 bg-olive-dark text-white overflow-hidden relative border-none">
          <div className="absolute top-0 right-0 p-12 opacity-10">
            <Leaf className="w-64 h-64" />
          </div>
          <CardContent className="p-12 flex flex-col h-full justify-between relative z-10">
            <div className="max-w-[400px]">
              <h3 className="text-4xl font-serif font-bold leading-tight">Ready to go 100% Gas-Free?</h3>
              <p className="text-white/70 mt-6 text-lg leading-relaxed">Get a personalized transition roadmap based on your kitchen usage and local energy stability.</p>
            </div>
            <div className="mt-12 flex gap-4">
              <Link to="/recommendations">
                <Button className="bg-sand text-white hover:bg-sand/90 border-none px-10 h-14 rounded-2xl font-bold text-lg">
                  Start Roadmap
                </Button>
              </Link>
              <Button variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 rounded-2xl px-10 text-lg">
                Learn More
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Profile Summary */}
        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted flex items-center gap-2">
              <Info className="h-4 w-4 text-olive-dark" />
              Energy Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm py-2 border-b border-sand/5">
                <span className="text-muted font-medium">Family Size</span>
                <span className="font-bold text-ink dark:text-[#E4E3DA]">{profile.familySize.adults}A, {profile.familySize.children}C</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-sand/5">
                <span className="text-muted font-medium">Cooking</span>
                <span className="font-bold text-ink dark:text-[#E4E3DA]">{profile.cookingFrequency}</span>
              </div>
              <div className="flex justify-between text-sm py-2 border-b border-sand/5">
                <span className="text-muted font-medium">Diet</span>
                <span className="font-bold text-ink dark:text-[#E4E3DA]">{profile.foodPreference}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-8 rounded-2xl border-sand/30 text-muted hover:text-ink dark:hover:text-[#E4E3DA] h-12" onClick={() => navigate('/profile-setup')}>
              Edit Profile
            </Button>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="md:col-span-1 lg:col-span-1 border-sand/20">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-sand flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Daily Tip
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base italic text-ink/80 dark:text-[#E4E3DA]/80 leading-relaxed">
              "Using a lid while boiling water on an induction cooktop can save up to 15% energy and reduce cooking time by 3 minutes."
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-sand text-white flex items-center justify-center shadow-sm">
                <Zap className="h-5 w-5" />
              </div>
              <span className="text-xs font-bold text-sand uppercase tracking-widest">Kitchen Hack</span>
            </div>
          </CardContent>
        </Card>

      </div>
    </motion.div>
  );
};
