import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { motion, AnimatePresence } from 'motion/react';
import { Landmark, ExternalLink, Info, CheckCircle2, Gift, Zap, ChevronDown, ChevronUp, FileText, Calendar, Users } from 'lucide-react';
import { GovernmentScheme } from '../types';

interface EnhancedScheme extends GovernmentScheme {
  detailedEligibility: string[];
  detailedBenefits: string[];
  documentsRequired: string[];
  deadline?: string;
}

const GOV_SCHEMES: EnhancedScheme[] = [
  { 
    id: '1', 
    title: 'PM Surya Ghar Muft Bijli Yojana', 
    description: 'Provides free electricity up to 300 units per month through rooftop solar.', 
    eligibility: 'All residential households with a suitable roof.', 
    detailedEligibility: [
      'Must be an Indian citizen',
      'Must own a house with a suitable roof for solar panels',
      'Must have a valid electricity connection',
      'Should not have availed any other solar subsidy'
    ],
    benefits: 'Up to ₹78,000 subsidy for 3kW installation.',
    detailedBenefits: [
      'Free electricity up to 300 units per month',
      'Subsidy of ₹30,000 per kW for up to 2 kW',
      'Additional subsidy of ₹18,000 per kW for additional capacity up to 3 kW',
      'Total subsidy capped at ₹78,000'
    ],
    documentsRequired: [
      'Electricity Bill (last 6 months)',
      'Identity Proof (Aadhaar/Voter ID)',
      'Address Proof',
      'Photograph of the roof'
    ],
    status: 'Active',
    url: 'https://pmsuryaghar.gov.in/',
    type: 'solar' 
  },
  {
    id: '2',
    title: 'Pradhan Mantri Ujjwala Yojana (PMUY)',
    description: 'Aims to safeguard the health of women & children by providing them with a clean cooking fuel – LPG.', 
    eligibility: 'Women belonging to BPL households.',
    detailedEligibility: [
      'Applicant must be a woman aged 18+',
      'Must belong to a BPL (Below Poverty Line) household',
      'No other LPG connection should exist in the same household',
      'Must belong to SC/ST, Most Backward Classes, or other specified categories'
    ],
    benefits: 'Financial support of ₹1600 for each LPG connection.',
    detailedBenefits: [
      'Cash assistance of ₹1600 for a new connection',
      'Free first refill and stove (hotplate) provided by OMCs',
      'Interest-free loan for stove and refill costs if needed',
      'Access to clean cooking fuel'
    ],
    documentsRequired: [
      'BPL Certificate / Ration Card',
      'Aadhaar Card of all family members',
      'Bank Account details (Jan Dhan account preferred)',
      'KYC Form'
    ],
    status: 'Active',
    url: 'https://www.pmuy.gov.in/',
    type: 'gas'
  },
  {
    id: '3',
    title: 'PAHAL (DBTL)',
    description: 'Direct Benefit Transfer of LPG subsidy to the bank account of the consumers.',
    eligibility: 'All LPG consumers in India.',
    detailedEligibility: [
      'Must be a registered LPG consumer',
      'Must have a bank account linked to Aadhaar (preferred)',
      'Non-Aadhaar holders can also link bank account directly to LPG ID'
    ],
    benefits: 'Subsidy amount directly credited to bank account.',
    detailedBenefits: [
      'Elimination of middle-men and leakage',
      'Market price payment at delivery, subsidy credited later',
      'Transparent tracking of subsidy payments',
      'Convenience of direct bank transfer'
    ],
    documentsRequired: [
      'LPG Connection ID',
      'Aadhaar Card',
      'Bank Passbook / Cancelled Cheque',
      'Form 3 (for Aadhaar) or Form 4 (for non-Aadhaar)'
    ],
    status: 'Active',
    url: 'http://mylpg.in/',
    type: 'gas'
  }
];

export const GovernmentSchemes = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto space-y-10 pb-12"
    >
      <div className="px-2">
        <h2 className="font-serif text-4xl font-bold text-ink dark:text-[#E4E3DA]">Government Schemes</h2>
        <p className="text-muted dark:text-muted mt-3 text-lg">Explore subsidies and financial assistance programs for clean energy.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {GOV_SCHEMES.map((scheme) => (
          <div key={scheme.id} className="flex flex-col">
            <Card className={`overflow-hidden border-none shadow-xl transition-all duration-500 ${expandedId === scheme.id ? 'ring-2 ring-olive-dark/20' : ''}`}>
              <div 
                className="cursor-pointer hover:bg-sand/5 dark:hover:bg-white/5 transition-colors"
                onClick={() => toggleExpand(scheme.id)}
              >
                <CardHeader className="p-8 border-none">
                  <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-6">
                    <div className="p-4 bg-olive-dark/10 rounded-2xl">
                      <Landmark className="h-8 w-8 text-olive-dark" />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <CardTitle className="text-2xl font-bold text-ink dark:text-[#E4E3DA]">{scheme.title}</CardTitle>
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {scheme.status}
                        </span>
                      </div>
                      <p className="text-muted dark:text-muted line-clamp-1">{scheme.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end mr-4">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted">Benefit</span>
                      <span className="text-sm font-bold text-terracotta">{scheme.benefits}</span>
                    </div>
                    {expandedId === scheme.id ? <ChevronUp className="h-6 w-6 text-muted" /> : <ChevronDown className="h-6 w-6 text-muted" />}
                  </div>
                </div>
              </CardHeader>
            </div>

              <AnimatePresence>
                {expandedId === scheme.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: 'easeInOut' }}
                  >
                    <CardContent className="p-8 bg-bg-card dark:bg-[#242622] border-t border-sand/10">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                        {/* Left Column: Detailed Info */}
                        <div className="lg:col-span-2 space-y-10">
                          <section>
                            <div className="flex items-center gap-3 mb-4">
                              <Users className="h-5 w-5 text-olive-dark" />
                              <h4 className="text-lg font-bold text-ink dark:text-[#E4E3DA]">Eligibility Criteria</h4>
                            </div>
                            <ul className="space-y-3 ml-8 list-disc text-muted dark:text-muted">
                              {scheme.detailedEligibility.map((item, index) => (
                                <li key={index} className="leading-relaxed">{item}</li>
                              ))}
                            </ul>
                          </section>

                          <section>
                            <div className="flex items-center gap-3 mb-4">
                              <Gift className="h-5 w-5 text-terracotta" />
                              <h4 className="text-lg font-bold text-ink dark:text-[#E4E3DA]">Key Benefits</h4>
                            </div>
                            <ul className="space-y-3 ml-8 list-disc text-muted dark:text-muted">
                              {scheme.detailedBenefits.map((item, index) => (
                                <li key={index} className="leading-relaxed">{item}</li>
                              ))}
                            </ul>
                          </section>
                        </div>

                        {/* Right Column: Requirements & Action */}
                        <div className="space-y-10">
                          <section className="bg-white dark:bg-white/5 p-6 rounded-3xl border border-sand/10">
                            <div className="flex items-center gap-3 mb-6">
                              <FileText className="h-5 w-5 text-sand" />
                              <h4 className="text-base font-bold text-ink dark:text-[#E4E3DA]">Documents Needed</h4>
                            </div>
                            <ul className="space-y-4">
                              {scheme.documentsRequired.map((doc, index) => (
                                <li key={index} className="flex items-start gap-3 text-sm text-muted">
                                  <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                                  {doc}
                                </li>
                              ))}
                            </ul>
                          </section>

                          <div className="space-y-4">
                            <Button 
                              className="w-full h-14 rounded-2xl bg-olive-dark text-white font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
                              onClick={() => window.open(scheme.url, '_blank')}
                            >
                              Official Portal <ExternalLink className="h-5 w-5" />
                            </Button>
                            <p className="text-[10px] text-center text-muted uppercase tracking-widest">
                              Redirects to government website
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </div>
        ))}
      </div>

      <Card className="bg-beige/20 dark:bg-white/5 border-dashed border-2 border-sand/30 p-10 rounded-[40px]">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="p-5 bg-white dark:bg-white/10 rounded-3xl shadow-sm">
            <Zap className="h-10 w-10 text-olive-dark" />
          </div>
          <div className="text-center md:text-left">
            <h4 className="text-2xl font-bold text-ink dark:text-[#E4E3DA] mb-2">Not sure which one fits?</h4>
            <p className="text-muted dark:text-muted text-lg">Our AI Advisor analyzes your profile to find the most profitable schemes for your household.</p>
          </div>
          <Button 
            variant="outline" 
            className="md:ml-auto h-16 px-10 rounded-2xl border-2 border-sand/30 text-olive-dark dark:text-sand font-bold text-lg"
            onClick={() => window.location.href = '/recommendations'}
          >
            Check Eligibility
          </Button>
        </div>
      </Card>
    </motion.div>
  );
};
