import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { Phone, AlertTriangle, Truck, Flame, Zap, Info, ArrowLeft, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const EMERGENCY_CONTACTS = [
  {
    id: '1',
    name: 'LPG Emergency Helpline (All India)',
    number: '1906',
    description: '24/7 dedicated helpline for LPG leakage, safety concerns, and immediate assistance across India.',
    type: 'Emergency',
    icon: AlertTriangle,
    color: 'text-red-500 bg-red-50'
  },
  {
    id: '2',
    name: 'Bharat Gas Support',
    number: '1800-22-4344',
    description: 'Contact for booking issues, delivery delays, and distributor complaints for Bharat Gas customers.',
    type: 'Support',
    icon: Truck,
    color: 'text-blue-500 bg-blue-50'
  },
  {
    id: '3',
    name: 'Indane Gas Helpline',
    number: '1800-2333-555',
    description: 'Official customer care for Indane Gas. Use for refill tracking and service requests.',
    type: 'Support',
    icon: Flame,
    color: 'text-orange-500 bg-orange-50'
  },
  {
    id: '4',
    name: 'HP Gas Customer Care',
    number: '1800-2333-555',
    description: 'Support line for HP Gas consumers. Report delivery issues or request new connections.',
    type: 'Support',
    icon: Info,
    color: 'text-blue-600 bg-blue-50'
  },
  {
    id: '5',
    name: 'Local Biogas Support (Greenway)',
    number: '+919123456789',
    description: 'Technical support for household biogas plants. Installation, maintenance, and repair services.',
    type: 'Alternative',
    icon: Zap,
    color: 'text-green-500 bg-green-50'
  },
  {
    id: '6',
    name: 'Solar Energy Helpline (MNRE)',
    number: '1800-11-2233',
    description: 'Government helpline for solar rooftop subsidies, technical queries, and approved vendor lists.',
    type: 'Alternative',
    icon: Zap,
    color: 'text-yellow-500 bg-yellow-50'
  },
  {
    id: '7',
    name: 'Emergency Fuel Delivery (Private)',
    number: '+918888877777',
    description: 'Private emergency service for immediate fuel/cylinder delivery in major metro areas.',
    type: 'Emergency',
    icon: Truck,
    color: 'text-terracotta bg-terracotta/10'
  }
];

export const EmergencyContacts = () => {
  const navigate = useNavigate();

  const handleCall = (number: string) => {
    window.location.href = `tel:${number}`;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      <div className="flex items-center gap-4 px-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate('/dashboard')}
          className="rounded-full border-sand/30"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-ink dark:text-[#E4E3DA]">Emergency Solutions</h2>
          <p className="text-muted dark:text-muted mt-1">Immediate contacts for fuel shortages and alternatives.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {EMERGENCY_CONTACTS.map((contact) => (
          <motion.div
            key={contact.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: parseInt(contact.id) * 0.1 }}
          >
            <Card className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`md:w-24 flex items-center justify-center p-6 md:p-0 ${contact.color}`}>
                    <contact.icon className="h-10 w-10" />
                  </div>
                  <div className="flex-1 p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-ink dark:text-[#E4E3DA]">{contact.name}</h3>
                        <span className="px-3 py-1 bg-sand/10 text-sand text-[10px] font-bold rounded-full uppercase tracking-wider">
                          {contact.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted dark:text-muted leading-relaxed max-w-xl">
                        {contact.description}
                      </p>
                      <div className="text-2xl font-serif font-bold text-olive-dark dark:text-sand mt-2">
                        {contact.number}
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleCall(contact.number)}
                      className="w-full md:w-auto h-14 px-10 rounded-2xl bg-olive-dark text-white font-bold shadow-lg flex items-center gap-3 group-hover:scale-105 transition-transform"
                    >
                      <Phone className="h-5 w-5" /> Call Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <Card className="bg-red-50 dark:bg-red-900/10 border-none p-8 rounded-[32px]">
        <div className="flex items-start gap-6">
          <div className="p-4 bg-red-100 dark:bg-red-900/20 rounded-2xl">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">Safety First</h4>
            <p className="text-sm text-red-600/80 dark:text-red-400/80 leading-relaxed">
              If you suspect a gas leak, immediately turn off the regulator, open all windows, and do not switch on any electrical appliances. Call 1906 immediately from a safe distance.
            </p>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
