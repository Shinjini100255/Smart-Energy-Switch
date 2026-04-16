import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Select } from '../components/ui';
import { saveProfile, getProfile, fetchProfileFromSupabase } from '../lib/storage';
import { UserProfile } from '../types';
import { motion } from 'motion/react';
import { MapPin, Phone, Loader2, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';

const EMERGENCY_CONTACTS = [
  { name: 'Bharat Gas', number: '1800-22-4344' },
  { name: 'Indian Oil (Indane)', number: '1800-2333-555' },
  { name: 'HP Gas', number: '1800-2333-555' },
  { name: 'MGL (Mumbai)', number: '1916' },
];

export const ProfileSetup = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: '',
    email: '',
    location: '',
    familySize: { adults: 2, children: 1 },
    cookingFrequency: 'Medium',
    foodPreference: 'Both',
    electricityAvailability: 'Average',
  });

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        console.warn('No active session found in ProfileSetup');
      }

      let existing = getProfile();
      
      // If no local profile, try fetching from Supabase
      if (!existing && user) {
        existing = await fetchProfileFromSupabase();
      }
      
      if (existing) {
        setProfile(prev => ({
          ...prev,
          ...existing,
          familySize: existing?.familySize || prev.familySize,
          email: user?.email || existing?.email || prev.email || '',
        }));
      } else if (user) {
        setProfile(prev => ({
          ...prev,
          email: user.email || '',
        }));
      }
    };
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await saveProfile(profile);
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const detectLocation = () => {
    setProfile({ ...profile, location: 'Mumbai, Maharashtra' });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-10"
    >
      <div className="px-2">
        <h2 className="font-serif text-4xl font-bold text-ink dark:text-[#E4E3DA]">Energy Profile</h2>
        <p className="text-muted dark:text-muted mt-3 text-lg">Manage your household details and energy preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden border-none shadow-xl">
            <CardHeader className="p-8 border-b border-sand/10 bg-white dark:bg-[#1A1C18]">
              <CardTitle className="text-2xl font-bold text-ink dark:text-[#E4E3DA]">Profile Details</CardTitle>
            </CardHeader>
            <CardContent className="p-10 bg-bg-card dark:bg-[#242622]">
              <form onSubmit={handleSave} className="space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-olive-dark dark:bg-sand rounded-full" />
                    <h4 className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px]">Basic Information</h4>
                  </div>
                  <Input
                    label="Full Name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value as string })}
                    placeholder="Enter your name"
                    required
                    className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                  />
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-olive-dark dark:bg-sand rounded-full" />
                    <h4 className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px]">Household & Location</h4>
                  </div>
                  
                  <div className="flex flex-col md:flex-row gap-6 items-end">
                    <div className="flex-1 w-full">
                      <Input
                        label="Location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value as string })}
                        placeholder="Enter city or area"
                        required
                        className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                      />
                    </div>
                    <Button type="button" variant="outline" onClick={detectLocation} className="h-16 px-10 rounded-2xl border-2 border-sand/30 text-olive-dark dark:text-sand font-bold flex items-center gap-3 hover:bg-sand/10">
                      <MapPin className="h-6 w-6" /> Auto Detect
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      label="Adults"
                      type="number"
                      value={profile.familySize.adults}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        familySize: { ...profile.familySize, adults: parseInt(e.target.value as string) || 0 } 
                      })}
                      required
                      className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                    />
                    <Input
                      label="Children"
                      type="number"
                      value={profile.familySize.children}
                      onChange={(e) => setProfile({ 
                        ...profile, 
                        familySize: { ...profile.familySize, children: parseInt(e.target.value as string) || 0 } 
                      })}
                      required
                      className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                    />
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-2 h-2 bg-olive-dark dark:bg-sand rounded-full" />
                    <h4 className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[3px]">Cooking & Energy</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Select
                      label="Cooking Frequency"
                      value={profile.cookingFrequency}
                      onChange={(e) => setProfile({ ...profile, cookingFrequency: e.target.value as any })}
                      options={[
                        { value: 'Low', label: 'Low (1-2 times/day)' },
                        { value: 'Medium', label: 'Medium (3-4 times/day)' },
                        { value: 'High', label: 'High (5+ times/day)' },
                      ]}
                      className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                    />
                    <Select
                      label="Food Preference"
                      value={profile.foodPreference}
                      onChange={(e) => setProfile({ ...profile, foodPreference: e.target.value as any })}
                      options={[
                        { value: 'Veg', label: 'Vegetarian' },
                        { value: 'Non-Veg', label: 'Non-Vegetarian' },
                        { value: 'Both', label: 'Both' },
                      ]}
                      className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                    />
                    <Input
                      label="Budget (₹)"
                      type="number"
                      value={profile.budget}
                      onChange={(e) => setProfile({ ...profile, budget: parseInt(e.target.value as string) || 0 })}
                      required
                      className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 text-ink dark:text-[#E4E3DA] focus:border-sand"
                    />
                    <Select
                      label="Electricity Availability"
                      value={profile.electricityAvailability}
                      onChange={(e) => setProfile({ ...profile, electricityAvailability: e.target.value as any })}
                      options={[
                        { value: 'Poor', label: 'Poor (< 12 hrs/day)' },
                        { value: 'Average', label: 'Average (12-18 hrs/day)' },
                        { value: 'Good', label: 'Good (18-22 hrs/day)' },
                        { value: 'Excellent', label: 'Excellent (24 hrs)' },
                      ]}
                      className="h-16 rounded-2xl bg-white dark:bg-[#1A1C18] border-2 border-sand/10 px-8 md:col-span-2 text-ink dark:text-[#E4E3DA] focus:border-sand"
                    />
                  </div>
                </div>

                <div className="pt-10 flex flex-col md:flex-row gap-6">
                  <Button type="button" variant="outline" onClick={() => navigate(-1)} disabled={loading} className="flex-1 h-16 rounded-2xl border-2 border-sand/30 font-bold text-ink dark:text-sand text-lg">Back</Button>
                  <Button type="submit" disabled={loading} className="flex-1 h-16 rounded-2xl bg-olive-dark text-white font-bold shadow-xl shadow-olive-dark/20 transition-all hover:scale-[1.02] text-lg flex items-center justify-center gap-3">
                    {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Save Profile'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-10">
          <Card className="overflow-hidden border-none shadow-xl">
            <CardHeader className="p-8 bg-terracotta/5 dark:bg-terracotta/10 border-b border-terracotta/10">
              <CardTitle className="text-2xl font-bold flex items-center gap-4 text-terracotta">
                <ShieldAlert className="h-8 w-8" /> Emergency Contacts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6 bg-bg-card dark:bg-[#242622]">
              {EMERGENCY_CONTACTS.map((contact, i) => (
                <div key={i} className="flex items-center justify-between p-6 bg-white dark:bg-[#1A1C18] border border-sand/10 rounded-[28px] group hover:bg-beige/10 dark:hover:bg-white/5 hover:shadow-lg transition-all duration-300">
                  <div>
                    <div className="font-bold text-ink dark:text-[#E4E3DA] text-base group-hover:text-terracotta transition-colors">{contact.name}</div>
                    <div className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[2px] mt-2">{contact.number}</div>
                  </div>
                  <a href={`tel:${contact.number}`} className="p-4 bg-beige/20 dark:bg-white/10 text-terracotta rounded-2xl shadow-sm hover:bg-terracotta hover:text-white transition-all">
                    <Phone className="h-5 w-5" />
                  </a>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
