import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../components/ui';
import { getProfile, getChatHistory, saveChatHistory, fetchProfileFromSupabase, fetchReports, saveReport, saveProfile, fetchChatHistoryFromSupabase } from '../lib/storage';
import { chatWithEnergyAdvisor } from '../lib/gemini';
import { UserProfile, ChatMessage } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Loader2, CheckCircle2, XCircle, Send, Download, Leaf, Zap, TrendingUp, Settings, Tag, Info, Newspaper, ExternalLink, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '../lib/supabase';
import { fetchEnergyNews, NewsArticle } from '../lib/news';

export const AIRecommendations = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [newsLoading, setNewsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      try {
        // Use getUser instead of getSession to avoid storage lock issues and ensure fresh data
        const { data: { user } } = await supabase.auth.getUser();
        let p: UserProfile | null = null;
        
        if (user) {
          // Pass the user object to avoid redundant getUser calls inside storage functions
          p = await fetchProfileFromSupabase(user);
          const r = await fetchReports(user);
          if (isMounted) setReports(r);
          
          // Fetch real-time news
          if (isMounted) setNewsLoading(true);
          const energyNews = await fetchEnergyNews();
          if (isMounted) {
            setNews(energyNews);
            setNewsLoading(false);
          }
        } else {
          p = getProfile();
        }
        
        if (isMounted) {
          setProfile(p);
          setIsProfileLoading(false);
        }

        let history = await fetchChatHistoryFromSupabase(user);
        if (history.length === 0) {
          history = getChatHistory();
        }
        
        // Check for old schema and clear if necessary to prevent crashes
        const hasOldSchema = history.some(msg => 
          msg.type === 'recommendation' && 
          msg.recommendationData && 
          (!msg.recommendationData.applianceRecommendation || typeof msg.recommendationData.solution === 'string')
        );

        if (hasOldSchema) {
          history = [];
          await saveChatHistory([]);
        }

        if (isMounted) {
          if (history.length === 0) {
            // Initial greeting
            const greeting: ChatMessage = {
              id: Date.now().toString(),
              role: 'assistant',
              type: 'text',
              content: "Hello! I'm your SES Energy Advisor. I've retrieved your profile and previous reports. How can I help you today?",
              timestamp: Date.now()
            };
            setMessages([greeting]);
            await saveChatHistory([greeting]);
          } else {
            setMessages(history);
          }
        }
      } catch (error) {
        console.error("Initialization error:", error);
        if (isMounted) setIsProfileLoading(false);
      }
    };
    init();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || !profile) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      type: 'text',
      content: input.trim(),
      timestamp: Date.now()
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    
    // Save user message immediately
    await saveChatHistory(newMessages);

    try {
      const response = await chatWithEnergyAdvisor(userMsg.content, messages, profile, reports, news);
      
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        type: response.type,
        content: response.content,
        recommendationData: response.recommendationData,
        timestamp: Date.now()
      };

      const updatedMessages = [...newMessages, assistantMsg];
      setMessages(updatedMessages);
      await saveChatHistory(updatedMessages);

      // Auto-update profile if AI detects changes
      if (response.content.includes("I will update your profile")) {
        // This is a simple heuristic. In a real app, we'd use function calling to get structured updates.
        // For now, we'll re-fetch the profile after a short delay to see if the user updated it elsewhere
        // or just assume the AI is handling the logic (which it isn't yet, so we should probably implement a basic parser)
        const updatedProfile = await fetchProfileFromSupabase();
        if (updatedProfile) setProfile(updatedProfile);
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = async () => {
    setMessages([]);
    await saveChatHistory([]);
  };

  const handleDownloadPDF = async (msg: ChatMessage) => {
    if (!reportRef.current || !msg.recommendationData) return;
    try {
      setLoading(true);
      const canvas = await html2canvas(reportRef.current, { 
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#FDFCFB',
        onclone: (clonedDoc) => {
          const elements = clonedDoc.getElementsByTagName('*');
          for (let i = 0; i < elements.length; i++) {
            const el = elements[i] as HTMLElement;
            const style = window.getComputedStyle(el);
            if (style.boxShadow && (style.boxShadow.includes('oklab') || style.boxShadow.includes('oklch'))) {
              el.style.boxShadow = 'none';
            }
            ['backgroundColor', 'color', 'borderColor'].forEach(prop => {
              const val = (style as any)[prop];
              if (val && (val.includes('oklab') || val.includes('oklch'))) {
                el.style[prop as any] = prop === 'backgroundColor' ? '#ffffff' : '#000000';
              }
            });
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      const fileName = `SES_Report_${msg.recommendationData.solution.primary}.pdf`;
      pdf.save(fileName);

      // Save report to Supabase
      await saveReport(
        `Recommendation: ${msg.recommendationData.solution.primary}`,
        msg.content,
        msg.recommendationData.whyBestForYou
      );
      
      // Refresh reports
      const r = await fetchReports();
      setReports(r);

    } catch (error) {
      console.error("Error generating PDF", error);
      alert("There was an error generating your PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col h-[calc(100vh-100px)] w-full max-w-6xl mx-auto"
    >
      <div className="mb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shrink-0 px-2">
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink dark:text-[#E4E3DA]">AI Switch Advisor</h2>
          <p className="text-muted dark:text-muted mt-1 text-base md:text-lg">Personalized alternative energy guidance.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleClearChat} className="h-10 md:h-12 rounded-2xl border-sand/30 text-olive-dark dark:text-sand text-sm">
            Clear Chat
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 overflow-hidden">
        <div className="lg:col-span-3 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            {isProfileLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center bg-bg-card dark:bg-[#242622] rounded-[32px] shadow-xl p-10 space-y-6"
              >
                <div className="relative">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-20 h-20 rounded-full border-4 border-sand/10 border-t-sand"
                  />
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-sand animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-bold text-ink dark:text-[#E4E3DA]">Syncing your profile...</h3>
                  <p className="text-muted dark:text-muted">Preparing your personalized energy insights.</p>
                </div>
                <div className="w-full max-w-xs bg-sand/10 h-1.5 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                    className="w-full h-full bg-sand"
                  />
                </div>
              </motion.div>
            ) : !profile ? (
              <motion.div
                key="no-profile"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center bg-bg-card dark:bg-[#242622] rounded-[32px] shadow-xl p-10 text-center"
              >
                <div className="bg-terracotta/10 p-6 rounded-full mb-6">
                  <AlertTriangle className="h-12 w-12 text-terracotta" />
                </div>
                <h3 className="text-2xl font-bold text-ink dark:text-[#E4E3DA] mb-4">Profile Required</h3>
                <p className="text-muted dark:text-muted max-w-md mb-8">
                  We need your energy profile to provide accurate recommendations. Please fill it out first.
                </p>
                <Button 
                  onClick={() => window.location.href = '/profile'}
                  className="h-14 px-10 rounded-2xl bg-olive-dark text-white font-bold text-lg shadow-xl shadow-olive-dark/20"
                >
                  Set Up Profile
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="advisor"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex-1 flex flex-col overflow-hidden"
              >
                <Card className="flex-1 flex flex-col overflow-hidden border-none shadow-xl">
                  <CardContent className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6 scrollbar-hide bg-bg-card dark:bg-[#242622]">
                    {messages.map((msg) => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`w-full md:max-w-[85%] ${msg.role === 'user' ? 'bg-sand text-white ml-auto md:w-auto shadow-md' : 'bg-white dark:bg-[#1A1C18] border border-sand/10 text-ink dark:text-[#E4E3DA] shadow-sm'} rounded-[28px] p-6 md:p-8`}>
                          {msg.role === 'assistant' && (
                            <div className="font-bold text-[10px] text-terracotta mb-4 md:mb-6 flex items-center gap-2 uppercase tracking-[3px]">
                              <Sparkles className="h-4 w-4" /> AI Switch Advisor
                            </div>
                          )}
                          
                          {msg.type === 'text' && (
                            <p className="text-base md:text-xl leading-relaxed whitespace-pre-wrap font-medium">{msg.content}</p>
                          )}

                          {msg.type === 'recommendation' && msg.recommendationData && (
                            <div className="space-y-8 md:space-y-10 mt-6" ref={reportRef}>
                              <p className="text-base md:text-xl leading-relaxed mb-6 md:mb-8 font-medium">{msg.content}</p>
                              
                              <div className="bg-beige/20 dark:bg-black/20 rounded-[32px] p-6 md:p-10 border border-sand/10 shadow-inner">
                                <div className="flex items-center gap-3 text-terracotta font-bold text-[10px] uppercase tracking-[4px] mb-6 md:mb-8">
                                  <Info className="h-4 w-4" /> Detailed Analysis
                                </div>
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8 mb-8 md:10">
                                  <div>
                                    <div className="text-[10px] uppercase tracking-[3px] font-bold text-muted dark:text-muted mb-3 md:mb-4">Primary Solution</div>
                                    <div className="text-3xl md:text-5xl font-serif font-bold text-ink dark:text-[#E4E3DA] tracking-tight">{msg.recommendationData.solution.primary}</div>
                                    {msg.recommendationData.solution.secondary && (
                                      <div className="text-sm md:text-base text-muted dark:text-muted mt-2 md:mt-3 font-bold flex items-center gap-3">
                                        <div className="w-2 h-2 bg-olive-dark dark:bg-sand rounded-full" />
                                        {msg.recommendationData.solution.secondary}
                                      </div>
                                    )}
                                  </div>
                                  <div className="bg-white dark:bg-[#1A1C18] p-4 md:p-6 rounded-3xl text-center min-w-[100px] md:min-w-[120px] border border-sand/10 shadow-sm">
                                    <div className="text-3xl md:text-4xl font-serif text-olive-dark dark:text-sand font-bold">
                                      {msg.recommendationData.confidenceScore}%
                                    </div>
                                    <div className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[2px] mt-1 md:mt-2">Match</div>
                                  </div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-8 md:10">
                                  <div className="bg-white dark:bg-[#1A1C18] p-4 md:p-6 rounded-2xl border border-sand/10 shadow-sm">
                                    <div className="flex items-center gap-3 font-bold text-ink dark:text-[#E4E3DA] mb-2 md:mb-3 text-xs uppercase tracking-widest">
                                      <Zap className="h-5 w-5 text-terracotta" /> Appliance
                                    </div>
                                    <div className="text-sm md:text-base font-bold text-muted dark:text-muted">
                                      {msg.recommendationData.applianceRecommendation.type}
                                    </div>
                                    <div className="text-[10px] text-muted dark:text-muted mt-1 md:mt-2 uppercase font-bold tracking-[2px]">
                                      {msg.recommendationData.applianceRecommendation.powerRating}
                                    </div>
                                  </div>
                                  <div className="bg-white dark:bg-[#1A1C18] p-4 md:p-6 rounded-2xl border border-sand/10 shadow-sm">
                                    <div className="flex items-center gap-3 font-bold text-ink dark:text-[#E4E3DA] mb-2 md:mb-3 text-xs uppercase tracking-widest">
                                      <Leaf className="h-5 w-5 text-olive-dark dark:text-sand" /> Sustainability
                                    </div>
                                    <div className="text-sm md:text-base font-bold text-muted dark:text-muted">
                                      {msg.recommendationData.ecoFriendlyImpact.sustainabilityLevel}
                                    </div>
                                    <div className="text-[10px] text-muted dark:text-muted mt-1 md:mt-2 uppercase font-bold tracking-[2px]">
                                      {msg.recommendationData.ecoFriendlyImpact.co2Reduction} reduction
                                    </div>
                                  </div>
                                </div>

                                <div className="relative pl-6 md:pl-8">
                                  <div className="absolute left-0 top-0 bottom-0 w-1 md:w-1.5 bg-olive-dark dark:bg-sand rounded-full" />
                                  <p className="text-base md:text-lg leading-relaxed text-ink/80 dark:text-[#E4E3DA]/80 italic font-medium">
                                    "{msg.recommendationData.whyBestForYou}"
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                                {[
                                  { label: 'Initial Cost', value: msg.recommendationData.priceBreakdown.initialCost, icon: Tag },
                                  { label: 'Monthly Cost', value: msg.recommendationData.priceBreakdown.monthlyCost, icon: TrendingUp },
                                  { label: 'Maintenance', value: msg.recommendationData.priceBreakdown.maintenanceCost, icon: Settings },
                                  { label: 'Est. Savings', value: msg.recommendationData.priceBreakdown.estimatedSavings || 'N/A', icon: Leaf }
                                ].map((item) => (
                                  <div key={item.label} className="p-4 md:p-6 bg-white dark:bg-[#1A1C18] border border-sand/10 rounded-[24px] md:rounded-[28px] shadow-sm">
                                    <span className="text-[9px] md:text-[10px] uppercase font-bold block mb-2 md:mb-3 text-muted dark:text-muted tracking-widest">{item.label}</span>
                                    <strong className="text-xl md:text-2xl text-ink dark:text-[#E4E3DA] font-serif">{item.value}</strong>
                                  </div>
                                ))}
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="p-6 md:p-8 bg-white dark:bg-[#1A1C18] border border-sand/10 rounded-[28px] md:rounded-[32px] shadow-sm">
                                  <h4 className="font-bold text-olive-dark dark:text-sand flex items-center gap-3 mb-4 md:mb-6 text-xs md:text-sm uppercase tracking-widest">
                                    <CheckCircle2 className="h-5 w-5" /> Advantages
                                  </h4>
                                  <ul className="space-y-3 md:space-y-4">
                                    {msg.recommendationData.advantages.map((adv, i) => (
                                      <li key={i} className="text-sm md:text-base text-ink dark:text-[#E4E3DA] font-medium flex items-start gap-3 md:gap-4">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-olive-dark dark:bg-sand rounded-full mt-1.5 md:mt-2 shrink-0" /> {adv}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="p-6 md:p-8 bg-white dark:bg-[#1A1C18] border border-sand/10 rounded-[28px] md:rounded-[32px] shadow-sm">
                                  <h4 className="font-bold text-terracotta flex items-center gap-3 mb-4 md:mb-6 text-xs md:text-sm uppercase tracking-widest">
                                    <XCircle className="h-5 w-5" /> Considerations
                                  </h4>
                                  <ul className="space-y-3 md:space-y-4">
                                    {msg.recommendationData.disadvantages.map((dis, i) => (
                                      <li key={i} className="text-sm md:text-base text-ink dark:text-[#E4E3DA] font-medium flex items-start gap-3 md:gap-4">
                                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-terracotta rounded-full mt-1.5 md:mt-2 shrink-0" /> {dis}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>

                              <Button onClick={() => handleDownloadPDF(msg)} className="w-full flex items-center justify-center gap-3 md:gap-4 h-14 md:h-16 rounded-2xl bg-olive-dark text-white hover:bg-olive-dark/90 font-bold text-base md:text-lg transition-all shadow-lg shadow-olive-dark/20">
                                <Download className="h-5 w-5 md:h-6 md:w-6" /> Download Transition Roadmap (PDF)
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {loading && (
                      <div className="flex justify-start">
                        <div className="bg-white dark:bg-[#1A1C18] border border-sand/10 text-ink dark:text-[#E4E3DA] rounded-[28px] p-6 md:p-8 shadow-sm flex items-center gap-4 md:gap-6">
                          <div className="flex gap-2">
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 md:w-2.5 md:h-2.5 bg-sand rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 md:w-2.5 md:h-2.5 bg-sand rounded-full" />
                            <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 md:w-2.5 md:h-2.5 bg-sand rounded-full" />
                          </div>
                          <span className="text-xs md:text-sm font-bold text-muted dark:text-muted uppercase tracking-widest">Expert is analyzing...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </CardContent>
                  <div className="pt-4 pb-6 md:pt-6 md:pb-8 px-4 md:px-12 bg-white dark:bg-[#1A1C18] border-t border-sand/10 shrink-0">
                    <form 
                      onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                      className="flex gap-4 md:gap-6 max-w-4xl mx-auto w-full md:w-[90%]"
                    >
                      <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value as string)}
                        placeholder="Ask about energy alternatives, costs, or safety..."
                        className="flex-1 h-14 md:h-16 text-base md:text-lg rounded-2xl bg-bg-card dark:bg-[#242622] border-2 border-sand/10 px-6 md:px-10 focus:border-sand text-ink dark:text-[#E4E3DA]"
                      />
                      <Button type="submit" disabled={loading || !input.trim()} className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-olive-dark hover:bg-olive-dark/90 text-white shadow-xl shadow-olive-dark/20 shrink-0">
                        <Send className="h-6 w-6 md:h-7 md:w-7" />
                      </Button>
                    </form>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="hidden lg:flex flex-col gap-6 overflow-y-auto pr-2 scrollbar-hide">
          <Card className="border-none shadow-lg overflow-hidden shrink-0">
            <CardHeader className="p-6 bg-terracotta/5 border-b border-terracotta/10">
              <CardTitle className="text-lg font-bold flex items-center gap-3 text-terracotta">
                <AlertTriangle className="h-5 w-5" /> Live Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="p-4 bg-white dark:bg-[#1A1C18] rounded-2xl border border-sand/10 shadow-sm">
                <div className="text-[10px] font-bold text-terracotta uppercase tracking-[2px] mb-1">Market Update</div>
                <div className="text-xs font-medium text-ink dark:text-[#E4E3DA]">LPG prices expected to rise by 5% next month.</div>
              </div>
              <div className="p-4 bg-white dark:bg-[#1A1C18] rounded-2xl border border-sand/10 shadow-sm">
                <div className="text-[10px] font-bold text-olive-dark dark:text-sand uppercase tracking-[2px] mb-1">Subsidy Alert</div>
                <div className="text-xs font-medium text-ink dark:text-[#E4E3DA]">New solar rooftop subsidies announced in your region.</div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg overflow-hidden flex-1 flex flex-col">
            <CardHeader className="p-6 bg-olive-dark/5 border-b border-olive-dark/10">
              <CardTitle className="text-lg font-bold flex items-center gap-3 text-olive-dark dark:text-sand">
                <Newspaper className="h-5 w-5" /> Energy News
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6 overflow-y-auto flex-1 scrollbar-hide">
              {newsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-sand" />
                  <span className="text-xs font-bold text-muted uppercase tracking-widest">Fetching news...</span>
                </div>
              ) : news.length > 0 ? (
                news.map((article, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group"
                  >
                    <a 
                      href={article.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="block p-4 bg-white dark:bg-[#1A1C18] rounded-2xl border border-sand/10 shadow-sm hover:shadow-md hover:border-sand/30 transition-all"
                    >
                      <div className="text-[10px] font-bold text-muted uppercase tracking-[2px] mb-2 flex justify-between items-center">
                        <span>{article.source_id}</span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <h4 className="text-sm font-bold text-ink dark:text-[#E4E3DA] leading-snug group-hover:text-olive-dark dark:group-hover:text-sand transition-colors line-clamp-2">
                        {article.title}
                      </h4>
                      <p className="text-[11px] text-muted mt-2 line-clamp-2 leading-relaxed">
                        {article.description}
                      </p>
                    </a>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-10">
                  <p className="text-xs font-bold text-muted uppercase tracking-widest">No news found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </motion.div>
  );
};
