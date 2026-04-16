# Household Energy Demand & Alternative Recommendation System
*Smart Cooking Fuel Choices for Every Home*

## 📖 Introduction / Overview
During LPG shortages, households struggle to find alternative cooking solutions. This web platform allows users to input their usage patterns and receive AI-powered recommendations for alternatives such as **electric induction, biogas, and solar cookers**. It also provides **cost comparisons, vendor search, government scheme integration, community insights, and emergency support**, making it a holistic household energy advisor.

## 🌟 Features
- **AI Switch Advisor (Agentic AI)** → Personalized recommendations with memory, integrates external APIs (live news, fuel prices, weather).  
- **Vendor Search System** → Smart product matching, “Best Product” heading, vendor details (shop name, model, distance, rating, availability), map integration.  
- **Cost-Saving Comparison** → Side-by-side fuel breakdown with price, savings, CO₂ emissions, and graphs.  
- **Community Insights** → Nearby community posts, heatmap of fuel usage clusters, CO₂ emission visualization.  
- **Government Schemes** → List of schemes, benefits, application portal links, AI eligibility check.  
- **Dashboard** → LPG price, grid stability, crisis level, current fuel used, community insights, schemes.  
- **Recent News & Alerts** → Live energy-related news feeds and crisis alerts.  
- **Emergency Solutions & Contacts** → Alternative cooking methods + contact directory of Bharat Gas, Indian Oil, HP Gas, MGL, etc.  
- **Daily Tip (Kitchen Hack)** → Small, actionable cooking or energy-saving hacks.  
- **AI Chatbot with Smart Memory (Backend)** → Learns from user history, stores past queries, provides evolving advice.  

## 🛠️ Tech Stack
- **Frontend:** React, TypeScript, HTML, CSS  
- **Backend:** Node.js, Express  
- **Database:** Supabase  
- **APIs:** Google Maps, OpenWeatherMap, Carbon Interface, NewsAPI, Spoonacular  
- **Hosting/Deployment:** Vercel / Netlify  

## 🏗️ Architecture / Workflow
User → Frontend (React/TypeScript) → Backend (Node.js/Express) → Supabase (Data Storage)  
↘ External APIs (Maps, Weather, Carbon, News, Recipes)  
↘ AI Switch Advisor (Agentic AI with memory + external data)  
Output → Dashboard (Insights, Vendor Search, Cost Comparison, Community Heatmap, Schemes, Emergency Mode)  

## 🛠️ Installation & Setup

```bash
git clone https://github.com/your-username/smart-energy-switch.git
cd smart-energy-switch
npm install
```

Create a file named `.env.local` in the root directory and add:

```env
GEMINI_API_KEY=your_gemini_api_key_here
SUPABASE_URL=your_supabase_url_here
SUPABASE_ANON_KEY=your_supabase_anon_key_here
NEWS_API_KEY=your_news_api_key_here
```

Run the development server:

```bash
npm run dev
```

Open in browser:

```text
http://localhost:3000
```

---

