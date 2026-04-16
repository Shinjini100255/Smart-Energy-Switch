-- =========================================
-- SMART ENERGY SWITCH (SES) FINAL DB SCHEMA
-- =========================================

-- 1) LOGIN PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.login_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 2) ENERGY PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.energy_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  name TEXT,
  location TEXT,
  family_size JSONB DEFAULT '{"adults": 0, "children": 0}'::jsonb,
  cooking_frequency TEXT,
  food_preference TEXT,
  electricity_availability TEXT,
  budget NUMERIC,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 3) CHAT HISTORY TABLE (SMART MEMORY)
CREATE TABLE IF NOT EXISTS public.chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  messages JSONB DEFAULT '[]'::jsonb NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- 4) SAVED REPORTS TABLE (DOWNLOADABLE PDF HISTORY)
CREATE TABLE IF NOT EXISTS public.saved_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  report_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()) NOT NULL
);

-- =========================================
-- ENABLE RLS
-- =========================================
ALTER TABLE public.login_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;

-- =========================================
-- RLS POLICIES
-- =========================================
CREATE POLICY "Users manage own login profile"
ON public.login_profiles
FOR ALL
USING (auth.uid() = id);

CREATE POLICY "Users manage own energy profile"
ON public.energy_profiles
FOR ALL
USING (auth.uid() = id);

CREATE POLICY "Users manage own chat history"
ON public.chat_history
FOR ALL
USING (auth.uid() = user_id);

CREATE POLICY "Users manage own saved reports"
ON public.saved_reports
FOR ALL
USING (auth.uid() = user_id);

-- =========================================
-- SMART USER AUTO-CREATION TRIGGER
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.login_profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.energy_profiles (id, email)
  VALUES (NEW.id, NEW.email);

  INSERT INTO public.chat_history (user_id, messages)
  VALUES (NEW.id, '[]'::jsonb);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- CLEAN OLD TRIGGER IF EXISTS
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- CREATE NEW TRIGGER
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
