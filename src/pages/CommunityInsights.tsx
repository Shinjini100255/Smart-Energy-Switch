import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '../components/ui';
import { getProfile } from '../lib/storage';
import { UserProfile, CommunityPost } from '../types';
import { motion } from 'motion/react';
import { MapPin, Users, Send, ArrowUpRight, Leaf, AlertCircle, Info } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

interface FuelCluster {
  id: string;
  name: string;
  location: [number, number];
  dominantFuel: string;
  userCount: number;
  emissionScore: number; // 0-100
  sustainabilityRank: number; // 1-10
}

const FUEL_TYPES = {
  SOLAR: { label: 'Solar Cooker', color: '#3B82F6', intensity: 'Very Low', score: 5 },
  BIOGAS: { label: 'Biogas', color: '#10B981', intensity: 'Low', score: 15 },
  ELECTRICITY: { label: 'Electricity', color: '#F59E0B', intensity: 'Medium', score: 40 },
  PNG: { label: 'PNG / Natural Gas', color: '#F97316', intensity: 'Medium', score: 45 },
  LPG: { label: 'LPG', color: '#EA580C', intensity: 'Medium-High', score: 60 },
  KEROSENE: { label: 'Kerosene', color: '#EF4444', intensity: 'High', score: 80 },
  BIOMASS: { label: 'Biomass / Wood', color: '#DC2626', intensity: 'High', score: 85 },
  CHARCOAL: { label: 'Charcoal', color: '#7C3AED', intensity: 'Very High', score: 95 },
  HYBRID: { label: 'Hybrid Fuel', color: '#6366F1', intensity: 'Variable', score: 50 },
};

const COMMUNITY_CLUSTERS: FuelCluster[] = [
  { id: 'c1', name: 'Bandra West', location: [19.0596, 72.8295], dominantFuel: 'PNG', userCount: 1250, emissionScore: 45, sustainabilityRank: 4 },
  { id: 'c2', name: 'Dharavi Sector 1', location: [19.0380, 72.8538], dominantFuel: 'Biomass', userCount: 3400, emissionScore: 85, sustainabilityRank: 8 },
  { id: 'c3', name: 'Andheri East', location: [19.1136, 72.8697], dominantFuel: 'LPG', userCount: 2100, emissionScore: 60, sustainabilityRank: 6 },
  { id: 'c4', name: 'Powai Eco-Hub', location: [19.1176, 72.9060], dominantFuel: 'Solar', userCount: 450, emissionScore: 5, sustainabilityRank: 1 },
  { id: 'c5', name: 'Thane Industrial', location: [19.2183, 72.9781], dominantFuel: 'Charcoal', userCount: 890, emissionScore: 95, sustainabilityRank: 10 },
  { id: 'c6', name: 'Navi Mumbai', location: [19.0330, 73.0297], dominantFuel: 'Electricity', userCount: 1800, emissionScore: 40, sustainabilityRank: 3 },
  { id: 'c7', name: 'Chembur', location: [19.0622, 72.8974], dominantFuel: 'Biogas', userCount: 620, emissionScore: 15, sustainabilityRank: 2 },
  { id: 'c8', name: 'Kurla', location: [19.0727, 72.8826], dominantFuel: 'Kerosene', userCount: 1100, emissionScore: 80, sustainabilityRank: 9 },
];

const getHeatColor = (score: number) => {
  if (score < 20) return '#10B981'; // Green (Low)
  if (score < 50) return '#F59E0B'; // Yellow/Orange (Medium)
  if (score < 85) return '#EF4444'; // Red (High)
  return '#7C3AED'; // Purple (Extreme)
};

const INITIAL_COMMUNITY_POSTS: CommunityPost[] = [
  { id: '1', user: 'Rahul D.', location: 'Andheri West', status: 'LPG delayed by 3 days', alternative: 'Induction', timestamp: '5 mins ago' },
  { id: '2', user: 'Priya S.', location: 'Thane', status: 'Switched completely', alternative: 'Biogas', timestamp: '12 mins ago' },
  { id: '3', user: 'Amit K.', location: 'Bandra', status: 'Gas price is too high here', alternative: 'Solar', timestamp: '25 mins ago' },
  { id: '4', user: 'Sneha R.', location: 'Dadar', status: 'Delivery agent asking for extra ₹100', alternative: 'Induction', timestamp: '1 hour ago' },
];

export const CommunityInsights = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(INITIAL_COMMUNITY_POSTS);
  const [newStatus, setNewStatus] = useState('');
  const [newAlternative, setNewAlternative] = useState('Induction');

  useEffect(() => {
    setProfile(getProfile());
  }, []);

  const handlePostCommunity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStatus.trim() || !profile) return;

    const newPost: CommunityPost = {
      id: Date.now().toString(),
      user: profile.name || profile.email.split('@')[0],
      location: profile.location,
      status: newStatus,
      alternative: newAlternative,
      timestamp: 'Just now'
    };

    setCommunityPosts([newPost, ...communityPosts]);
    setNewStatus('');
  };

  if (!profile) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-10"
    >
      <div className="px-2">
        <h2 className="font-serif text-4xl font-bold text-ink dark:text-[#E4E3DA] flex items-center gap-4">
          <Users className="h-10 w-10 text-terracotta" /> Community Insights
        </h2>
        <p className="text-muted dark:text-muted mt-3 text-lg">Real-time reports from users in your district.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <Card className="h-full overflow-hidden border-none shadow-xl">
            <CardHeader className="p-8 border-b border-sand/10 bg-white dark:bg-[#1A1C18]">
              <CardTitle className="flex items-center gap-4 text-2xl font-bold text-ink dark:text-[#E4E3DA]">
                <div className="p-3 bg-green-500/10 rounded-2xl">
                  <MapPin className="h-6 w-6 text-green-500" />
                </div>
                Live Intelligence Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] w-full relative z-0">
                <MapContainer center={[19.0760, 72.8777]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                  />
                  {COMMUNITY_CLUSTERS.map((cluster) => {
                    const fuelInfo = Object.values(FUEL_TYPES).find(f => f.label.includes(cluster.dominantFuel)) || FUEL_TYPES.LPG;
                    return (
                      <CircleMarker 
                        key={cluster.id}
                        center={cluster.location} 
                        radius={15 + (cluster.userCount / 500)} 
                        pathOptions={{ 
                          color: 'white', 
                          weight: 2,
                          fillColor: getHeatColor(cluster.emissionScore), 
                          fillOpacity: 0.7 
                        }}
                      >
                        <Popup className="custom-popup">
                          <div className="p-3 space-y-3 min-w-[200px]">
                            <div className="flex justify-between items-start border-b border-sand/10 pb-2">
                              <h4 className="font-bold text-ink text-lg">{cluster.name}</h4>
                              <span className="text-[10px] font-bold bg-sand/10 px-2 py-1 rounded-full uppercase tracking-wider">
                                Rank #{cluster.sustainabilityRank}
                              </span>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted font-medium">Dominant Fuel:</span>
                                <span className="text-xs font-bold text-ink flex items-center gap-2">
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fuelInfo.color }} />
                                  {cluster.dominantFuel}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted font-medium">CO₂ Intensity:</span>
                                <span className="text-xs font-bold" style={{ color: getHeatColor(cluster.emissionScore) }}>
                                  {fuelInfo.intensity} ({cluster.emissionScore}/100)
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted font-medium">Active Users:</span>
                                <span className="text-xs font-bold text-ink">{cluster.userCount.toLocaleString()}</span>
                              </div>
                            </div>
                            <div className="pt-2">
                              <div className="w-full bg-sand/10 h-1.5 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-1000" 
                                  style={{ 
                                    width: `${cluster.emissionScore}%`,
                                    backgroundColor: getHeatColor(cluster.emissionScore)
                                  }} 
                                />
                              </div>
                              <div className="flex justify-between mt-1">
                                <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">Low Emission</span>
                                <span className="text-[8px] font-bold text-muted uppercase tracking-tighter">High Emission</span>
                              </div>
                            </div>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
                </MapContainer>
              </div>

              <div className="p-8 bg-white dark:bg-[#1A1C18] border-t border-sand/10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px] flex items-center gap-2">
                      <Leaf className="h-4 w-4 text-olive-dark" /> CO₂ Emission Intensity
                    </h5>
                    <div className="flex items-center gap-2 w-full max-w-md">
                      <div className="flex-1 h-3 rounded-l-full bg-[#10B981]" />
                      <div className="flex-1 h-3 bg-[#F59E0B]" />
                      <div className="flex-1 h-3 bg-[#EF4444]" />
                      <div className="flex-1 h-3 rounded-r-full bg-[#7C3AED]" />
                    </div>
                    <div className="flex justify-between text-[9px] font-bold text-muted uppercase tracking-wider max-w-md">
                      <span>Low CO₂</span>
                      <span>Medium</span>
                      <span>High</span>
                      <span>Extreme</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px] flex items-center gap-2">
                      <Users className="h-4 w-4 text-terracotta" /> Fuel Clusters
                    </h5>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {Object.entries(FUEL_TYPES).slice(0, 6).map(([key, fuel]) => (
                        <div key={key} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: fuel.color }} />
                          <span className="text-[10px] font-bold text-ink dark:text-[#E4E3DA] whitespace-nowrap">{fuel.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="mt-8 p-4 bg-bg-card dark:bg-[#242622] rounded-2xl border border-sand/10 flex items-start gap-4">
                  <Info className="h-5 w-5 text-sand shrink-0 mt-0.5" />
                  <p className="text-xs text-muted dark:text-muted leading-relaxed">
                    This heatmap visualizes estimated carbon emissions based on dominant cooking fuel usage in each community. 
                    <strong> Cooler zones (Green/Blue)</strong> indicate higher adoption of sustainable alternatives like Solar or Biogas, 
                    while <strong>Hotter zones (Red/Purple)</strong> indicate reliance on high-emission fuels like Biomass or Charcoal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
          <Card className="overflow-hidden border-none shadow-xl">
            <CardHeader className="p-8 border-b border-sand/10 bg-white dark:bg-[#1A1C18]">
              <CardTitle className="text-xl font-bold text-ink dark:text-[#E4E3DA]">Share Your Status</CardTitle>
            </CardHeader>
            <CardContent className="p-8 bg-bg-card dark:bg-[#242622]">
              <form onSubmit={handlePostCommunity} className="space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px] ml-1">Situation</label>
                  <Input 
                    placeholder="e.g. LPG delivery delayed by 2 days" 
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as string)}
                    className="h-14 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px] ml-1">Your Alternative</label>
                  <Select 
                    value={newAlternative}
                    onChange={(e) => setNewAlternative(e.target.value)}
                    className="h-14 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                    options={[
                      { value: 'Induction', label: 'Induction Cooktop' },
                      { value: 'Biogas', label: 'Biogas Plant' },
                      { value: 'Solar', label: 'Solar Cooker' },
                      { value: 'Electric Kettle', label: 'Electric Kettle' },
                    ]}
                  />
                </div>
                <Button type="submit" className="w-full h-16 rounded-2xl bg-olive-dark text-white font-bold shadow-xl shadow-olive-dark/20 transition-all hover:scale-[1.02] text-lg" disabled={!newStatus.trim()}>
                  <Send className="h-6 w-6 mr-3" /> Post Update
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="overflow-hidden flex-1 flex flex-col border-none shadow-xl">
            <CardHeader className="p-8 border-b border-sand/10 bg-white dark:bg-[#1A1C18]">
              <CardTitle className="text-xl font-bold text-ink dark:text-[#E4E3DA]">Recent Feed</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-y-auto max-h-[500px] scrollbar-hide bg-bg-card dark:bg-[#242622]">
              <div className="divide-y divide-sand/10">
                {communityPosts.map((post) => (
                  <div key={post.id} className="p-8 hover:bg-sand/5 transition-colors duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-ink dark:text-[#E4E3DA] text-base group-hover:text-olive-dark dark:group-hover:text-sand transition-colors">{post.user}</span>
                        <span className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[2px] mt-1.5">{post.location}</span>
                      </div>
                      <span className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[2px]">{post.timestamp}</span>
                    </div>
                    <p className="text-base text-ink/80 dark:text-[#E4E3DA]/80 mb-6 leading-relaxed font-medium">"{post.status}"</p>
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-olive-dark/10 text-olive-dark dark:text-sand text-[10px] font-bold rounded-full uppercase tracking-widest">
                      <ArrowUpRight className="h-4 w-4" /> Switched to {post.alternative}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
