import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '../components/ui';
import { getProfile } from '../lib/storage';
import { UserProfile, CommunityPost } from '../types';
import { motion } from 'motion/react';
import { MapPin, Users, Send, ArrowUpRight } from 'lucide-react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

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
                  {/* Shortage Heatmap points */}
                  <CircleMarker center={[19.0500, 72.9000]} radius={20} pathOptions={{ color: 'transparent', fillColor: '#D97706', fillOpacity: 0.4 }}>
                    <Popup>High LPG Shortage Reported</Popup>
                  </CircleMarker>
                  <CircleMarker center={[19.1000, 72.8500]} radius={30} pathOptions={{ color: 'transparent', fillColor: '#D97706', fillOpacity: 0.3 }}>
                    <Popup>Medium LPG Shortage Reported</Popup>
                  </CircleMarker>
                  
                  {/* Alternative Usage points */}
                  <CircleMarker center={[19.0800, 72.8800]} radius={15} pathOptions={{ color: 'transparent', fillColor: '#4A5D4E', fillOpacity: 0.6 }}>
                    <Popup>High Induction Usage</Popup>
                  </CircleMarker>
                  <CircleMarker center={[19.0200, 72.8400]} radius={25} pathOptions={{ color: 'transparent', fillColor: '#4A5D4E', fillOpacity: 0.5 }}>
                    <Popup>High Solar/Biogas Usage</Popup>
                  </CircleMarker>
                </MapContainer>
              </div>
              <div className="p-8 flex flex-wrap gap-10 text-[10px] font-bold text-muted dark:text-muted justify-center bg-beige/10 dark:bg-black/20 border-t border-sand/10 uppercase tracking-[2px]">
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-terracotta opacity-60"></div> 
                  LPG Shortage Reports
                </span>
                <span className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-olive-dark opacity-60"></div> 
                  Alternative Adoption
                </span>
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
