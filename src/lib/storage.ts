import { UserProfile, ChatMessage } from '../types';
import { supabase } from './supabase';

const PROFILE_KEY = 'ses_user_profile';
const CHAT_KEY = 'ses_chat_history';

export const saveProfile = async (profile: UserProfile) => {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  
  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  
  if (user) {
    console.log('Syncing profile to Supabase for user:', user.id);
    
    // Update energy_profiles table
    const { error: profileError } = await supabase
      .from('energy_profiles')
      .upsert({
        id: user.id,
        name: profile.name || '',
        email: profile.email || user.email || '',
        location: profile.location || '',
        family_size: profile.familySize || { adults: 2, children: 1 },
        cooking_frequency: profile.cookingFrequency || 'Medium',
        food_preference: profile.foodPreference || 'Both',
        electricity_availability: profile.electricityAvailability || 'Average',
        budget: profile.budget || 0,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });
    
    if (profileError) {
      console.error('Error syncing profile to Supabase (energy_profiles table):', profileError.message, profileError.details);
    } else {
      console.log('Successfully synced to energy_profiles table');
    }

    // Update login_profiles table
    const { error: loginError } = await supabase
      .from('login_profiles')
      .upsert({
        id: user.id,
        email: profile.email || user.email || '',
      }, { onConflict: 'id' });
      
    if (loginError) {
      console.error('Error syncing profile to Supabase (login_profiles table):', loginError.message, loginError.details);
    } else {
      console.log('Successfully synced to login_profiles table');
    }
  } else {
    console.warn('No active session found. Profile saved to local storage only.');
  }
};

export const getProfile = (): UserProfile | null => {
  const data = localStorage.getItem(PROFILE_KEY);
  if (!data) return null;
  const profile = JSON.parse(data);
  return {
    name: profile.name || '',
    email: profile.email || '',
    location: profile.location || '',
    familySize: profile.familySize || { adults: 2, children: 1 },
    cookingFrequency: profile.cookingFrequency || 'Medium',
    foodPreference: profile.foodPreference || 'Both',
    electricityAvailability: profile.electricityAvailability || 'Average',
    budget: profile.budget || 0,
  };
};

export const fetchProfileFromSupabase = async (existingUser?: any): Promise<UserProfile | null> => {
  const user = existingUser || (await supabase.auth.getUser()).data.user;
  if (!user) return null;

  const { data, error } = await supabase
    .from('energy_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error || !data) return null;

  const profile: UserProfile = {
    name: data.name || '',
    email: data.email || user.email || '',
    location: data.location || '',
    familySize: data.family_size || { adults: 2, children: 1 },
    cookingFrequency: data.cooking_frequency || 'Medium',
    foodPreference: data.food_preference || 'Both',
    electricityAvailability: data.electricity_availability || 'Average',
    budget: data.budget || 0,
  };

  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
};

// --- Saved Reports ---
export const saveReport = async (title: string, content: string, decisionSummary: string) => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from('saved_reports')
    .insert({
      user_id: user.id,
      report_data: {
        title,
        content,
        decision_summary: decisionSummary
      }
    });

  if (error) console.error('Error saving report:', error);
};

export const fetchReports = async (existingUser?: any) => {
  const user = existingUser || (await supabase.auth.getUser()).data.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from('saved_reports')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    return [];
  }
  
  // Map the new structure to the expected flat structure for UI compatibility if needed
  return data.map(item => ({
    ...item,
    title: item.report_data?.title || 'Untitled Report',
    content: item.report_data?.content || '',
    decision_summary: item.report_data?.decision_summary || ''
  }));
};

export const clearProfile = () => {
  localStorage.removeItem(PROFILE_KEY);
};

export const saveChatHistory = async (messages: ChatMessage[]) => {
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages));

  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const { error } = await supabase
      .from('chat_history')
      .upsert({
        user_id: user.id,
        messages: messages,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    if (error) console.error('Error syncing chat history to Supabase:', error);
  }
};

export const getChatHistory = (): ChatMessage[] => {
  const data = localStorage.getItem(CHAT_KEY);
  return data ? JSON.parse(data) : [];
};

export const fetchChatHistoryFromSupabase = async (existingUser?: any): Promise<ChatMessage[]> => {
  const user = existingUser || (await supabase.auth.getUser()).data.user;
  if (!user) return [];

  const { data, error } = await supabase
    .from('chat_history')
    .select('messages')
    .eq('user_id', user.id)
    .single();

  if (error || !data) return [];

  const messages = data.messages as ChatMessage[];
  localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  return messages;
};

export const clearChatHistory = () => {
  localStorage.removeItem(CHAT_KEY);
};
