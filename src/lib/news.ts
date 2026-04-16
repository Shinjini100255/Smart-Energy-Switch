import { supabase } from './supabase';

const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const BASE_URL = 'https://newsdata.io/api/1/news';

export interface NewsArticle {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  source_id: string;
}

export const fetchEnergyNews = async (query: string = 'energy crisis India'): Promise<NewsArticle[]> => {
  if (!NEWS_API_KEY) {
    console.warn('News API key is missing. Skipping news fetch.');
    return [];
  }

  try {
    const response = await fetch(`${BASE_URL}?apikey=${NEWS_API_KEY}&q=${encodeURIComponent(query)}&language=en&category=environment,technology`);
    const data = await response.json();
    
    if (data.status === 'success' && data.results) {
      return data.results.slice(0, 5).map((article: any) => ({
        title: article.title,
        link: article.link,
        description: article.description,
        pubDate: article.pubDate,
        source_id: article.source_id
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};
