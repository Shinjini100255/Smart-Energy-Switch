export interface UserProfile {
  name: string;
  email: string;
  location: string;
  familySize: {
    adults: number;
    children: number;
  };
  cookingFrequency: 'Low' | 'Medium' | 'High';
  foodPreference: 'Veg' | 'Non-Veg' | 'Both';
  electricityAvailability: 'Poor' | 'Average' | 'Good' | 'Excellent';
  budget?: number;
}

export interface AdvancedRecommendation {
  solution: {
    primary: string;
    secondary?: string;
  };
  applianceRecommendation: {
    type: string;
    powerRating: string;
  };
  priceBreakdown: {
    initialCost: string;
    monthlyCost: string;
    maintenanceCost: string;
    estimatedSavings?: string;
  };
  comparison: {
    costDifference: string;
    efficiency: string;
    convenience: string;
  };
  advantages: string[];
  disadvantages: string[];
  whyBestForYou: string;
  whyNotOthers: string;
  ecoFriendlyImpact: {
    co2Reduction: string;
    sustainabilityLevel: 'Low' | 'Medium' | 'High';
  };
  confidenceScore: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  type: 'text' | 'recommendation';
  content: string;
  recommendationData?: AdvancedRecommendation;
  timestamp: number;
}

export interface Vendor {
  id: string;
  name: string;
  price: number;
  distance: number; // in km
  rating: number;
  reviews: number;
  availability: string;
  tags: string[];
  isOnline: boolean;
  locationQuery: string;
  url?: string;
}

export interface Recipe {
  title: string;
  time: string;
  steps: string[];
  appliance: string;
  dietType: string;
}

export interface NewsItem {
  id: string;
  headline: string;
  source: string;
  timestamp: string;
  type: 'alert' | 'update' | 'news';
  category: 'Price' | 'Policy' | 'Crisis';
}

export interface GovernmentScheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  benefits: string;
  status: 'Active' | 'Ongoing';
  url: string;
  type: 'solar' | 'biogas' | 'electricity' | 'gas';
}

export interface TrendingSolution {
  name: string;
  percentage: number;
  trend: 'up' | 'down' | 'stable';
}

export interface CommunityPost {
  id: string;
  user: string;
  location: string;
  status: string;
  alternative: string;
  timestamp: string;
}
