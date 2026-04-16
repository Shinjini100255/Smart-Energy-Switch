import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Input } from '../components/ui';
import { Vendor } from '../types';
import { motion } from 'motion/react';
import { MapPin, Star, Truck, Tag, Search, ExternalLink, Map as MapIcon, List } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icon in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Extended Vendor type for map coordinates
interface MapVendor extends Vendor {
  appliance: string;
  lat?: number;
  lng?: number;
}

const MOCK_VENDORS: MapVendor[] = [
  { id: '1', name: 'Reliance Digital', price: 2499, distance: 2.5, rating: 4.5, reviews: 120, availability: 'In Stock', tags: ['Best Value'], isOnline: false, locationQuery: 'Reliance Digital Mumbai', appliance: 'Induction Cooktop', lat: 19.0760, lng: 72.8777 },
  { id: '2', name: 'Local Electronics Hub', price: 2100, distance: 1.2, rating: 4.0, reviews: 45, availability: 'Limited Stock', tags: ['Lowest Price'], isOnline: false, locationQuery: 'Electronics Store Mumbai', appliance: 'Induction Cooktop', lat: 19.0820, lng: 72.8810 },
  { id: '3', name: 'Amazon Prime Local', price: 2650, distance: 5.0, rating: 4.8, reviews: 500, availability: 'Delivery in 2 hrs', tags: ['Fastest Availability'], isOnline: true, locationQuery: '', url: 'https://www.amazon.in/s?k=induction+cooktop', appliance: 'Induction Cooktop' },
  { id: '4', name: 'Croma', price: 2800, distance: 3.0, rating: 4.6, reviews: 210, availability: 'In Stock', tags: [], isOnline: false, locationQuery: 'Croma Mumbai', appliance: 'Induction Cooktop', lat: 19.0650, lng: 72.8900 },
  { id: '5', name: 'Green Energy Solutions', price: 4500, distance: 4.2, rating: 4.7, reviews: 85, availability: 'In Stock', tags: ['Eco Friendly'], isOnline: false, locationQuery: 'Solar Store Mumbai', appliance: 'Solar Cooker', lat: 19.0500, lng: 72.9000 },
  { id: '6', name: 'Saurya Solar', price: 4200, distance: 6.0, rating: 4.3, reviews: 32, availability: 'Pre-order', tags: [], isOnline: true, locationQuery: '', url: 'https://www.amazon.in/s?k=solar+cooker', appliance: 'Solar Cooker' },
  { id: '7', name: 'Home Appliances Co.', price: 1500, distance: 1.8, rating: 4.2, reviews: 90, availability: 'In Stock', tags: ['Budget Friendly'], isOnline: false, locationQuery: 'Appliance Store Mumbai', appliance: 'Electric Rice Cooker', lat: 19.0900, lng: 72.8600 },
  { id: '8', name: 'Sharma Electronics', price: 1950, distance: 0.8, rating: 4.1, reviews: 28, availability: 'In Stock', tags: ['Nearest'], isOnline: false, locationQuery: 'Sharma Electronics Mumbai', appliance: 'Induction Cooktop', lat: 19.0700, lng: 72.8800 },
  { id: '9', name: 'EcoTech Solar', price: 3800, distance: 3.5, rating: 4.4, reviews: 65, availability: 'In Stock', tags: ['Best Value'], isOnline: false, locationQuery: 'EcoTech Solar Mumbai', appliance: 'Solar Cooker', lat: 19.0600, lng: 72.8750 },
  { id: '10', name: 'Patel Utensils & Appliances', price: 1350, distance: 1.5, rating: 3.9, reviews: 112, availability: 'Limited Stock', tags: ['Lowest Price'], isOnline: false, locationQuery: 'Patel Utensils Mumbai', appliance: 'Electric Rice Cooker', lat: 19.0850, lng: 72.8700 },
  { id: '11', name: 'Vijay Sales', price: 2550, distance: 2.8, rating: 4.6, reviews: 340, availability: 'In Stock', tags: ['Trusted'], isOnline: false, locationQuery: 'Vijay Sales Mumbai', appliance: 'Induction Cooktop', lat: 19.0720, lng: 72.8950 },
];

export const VendorComparison = () => {
  const [appliance, setAppliance] = useState('Induction Cooktop');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  // Smart Search: If search query is present, ignore appliance tab filter to allow searching anything
  const filteredVendors = MOCK_VENDORS.filter(v => {
    if (searchQuery.trim() !== '') {
      return v.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             v.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
             v.appliance.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return v.appliance === appliance;
  });

  // Find the best vendor for the smart suggestion (e.g., highest rating + lowest price)
  const bestVendor = filteredVendors.length > 0 
    ? [...filteredVendors].sort((a, b) => (b.rating / b.price) - (a.rating / a.price))[0]
    : null;

  const handleVendorAction = (vendor: Vendor) => {
    if (vendor.isOnline && vendor.url) {
      window.open(vendor.url, '_blank');
    } else {
      window.open(`https://maps.google.com/?q=${encodeURIComponent(vendor.locationQuery)}`, '_blank');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto space-y-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <div>
          <h2 className="font-serif text-4xl font-bold text-ink dark:text-[#E4E3DA]">Marketplace</h2>
          <p className="text-muted dark:text-muted mt-3 text-lg">Find local vendors and best deals for your energy switch.</p>
        </div>
        <div className="flex bg-white dark:bg-[#1A1C18] p-1.5 rounded-2xl border-2 border-sand/10 shadow-sm">
          <Button 
            variant={viewMode === 'list' ? 'primary' : 'secondary'} 
            className="h-12 px-6 rounded-xl font-bold"
            onClick={() => setViewMode('list')}
          >
            <List className="h-5 w-5 mr-2" /> List
          </Button>
          <Button 
            variant={viewMode === 'map' ? 'primary' : 'secondary'} 
            className="h-12 px-6 rounded-xl font-bold"
            onClick={() => setViewMode('map')}
          >
            <MapIcon className="h-5 w-5 mr-2" /> Map
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 justify-between items-center bg-bg-card dark:bg-[#242622] p-8 rounded-[32px] border-none shadow-xl">
        <div className="flex gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['Induction Cooktop', 'Solar Cooker', 'Electric Rice Cooker'].map((item) => (
            <Button
              key={item}
              variant={appliance === item && !searchQuery ? 'primary' : 'outline'}
              onClick={() => { setAppliance(item); setSearchQuery(''); }}
              className="whitespace-nowrap rounded-full h-12 px-8 border-2 border-sand/30 text-ink dark:text-[#E4E3DA] font-bold"
            >
              {item}
            </Button>
          ))}
        </div>
        <div className="w-full md:w-96 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted dark:text-muted" />
          <Input 
            placeholder="Search products or brands..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value as string)}
            className="pl-14 h-14 rounded-full bg-white dark:bg-[#1A1C18] border-2 border-sand/10 text-ink dark:text-[#E4E3DA] focus:border-sand"
          />
        </div>
      </div>

      {/* Smart Buy Suggestion */}
      {!searchQuery && bestVendor && (
        <Card className="bg-white dark:bg-[#1A1C18] text-ink dark:text-[#E4E3DA] border-2 border-sand/10 hover:bg-gradient-to-r hover:from-olive-dark hover:to-[#5A5A40] hover:text-white transition-all duration-500 shadow-2xl rounded-[32px] overflow-hidden group cursor-pointer">
          <CardContent className="p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-olive-dark dark:text-sand group-hover:text-sand font-bold text-sm uppercase tracking-[3px] transition-colors">
                <Star className="h-5 w-5 fill-current" /> Smart Buy Suggestion
              </div>
              <h3 className="text-3xl font-bold leading-tight">Best product under your budget</h3>
              <p className="text-muted dark:text-muted group-hover:text-beige/80 text-lg transition-colors">
                Recommended model: <span className="font-bold text-ink dark:text-[#E4E3DA] group-hover:text-white">{bestVendor.name} - {bestVendor.appliance}</span>
              </p>
            </div>
            <div className="text-center md:text-right space-y-4">
              <div className="text-5xl font-serif font-bold">₹{bestVendor.price}</div>
              <Button 
                className="h-14 px-10 rounded-2xl bg-white text-ink border-2 border-sand/10 group-hover:bg-olive-dark group-hover:text-white group-hover:border-transparent hover:scale-105 transition-all font-bold text-lg" 
                onClick={() => handleVendorAction(bestVendor)}
              >
                View Details
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {viewMode === 'map' ? (
        <Card className="overflow-hidden border-none shadow-2xl rounded-[32px]">
          <div className="h-[600px] w-full relative z-0">
            <MapContainer center={[19.0760, 72.8777]} zoom={11} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {filteredVendors.filter(v => !v.isOnline && v.lat && v.lng).map((vendor) => (
                <Marker key={vendor.id} position={[vendor.lat!, vendor.lng!]}>
                  <Popup>
                    <div className="p-4 min-w-[200px] space-y-3">
                      <h3 className="font-bold text-base text-ink">{vendor.name}</h3>
                      <p className="text-terracotta font-bold text-2xl">₹{vendor.price}</p>
                      <div className="flex items-center gap-2 text-sm text-muted font-bold">
                        <Star className="h-4 w-4 text-terracotta fill-current" /> {vendor.rating}
                      </div>
                      <Button className="w-full h-11 rounded-xl text-sm mt-4 bg-olive-dark text-white font-bold" onClick={() => handleVendorAction(vendor)}>
                        Get Directions
                      </Button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredVendors.map((vendor, index) => (
            <motion.div
              key={vendor.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -10 }}
              className="h-full"
            >
              <Card className={`h-full flex flex-col overflow-hidden group transition-all duration-300 border-none shadow-xl bg-bg-card dark:bg-[#242622] ${vendor.tags.length > 0 ? 'ring-2 ring-olive-dark/20' : ''}`}>
                <CardContent className="p-8 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6 border-b border-sand/10 pb-6">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2 mb-2">
                        {vendor.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 bg-olive-dark/10 text-olive-dark dark:text-sand text-[8px] font-bold rounded-full uppercase tracking-widest border border-sand/5">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <h3 className="text-2xl font-bold text-ink dark:text-[#E4E3DA] group-hover:text-olive-dark dark:group-hover:text-sand transition-colors leading-tight">{vendor.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-muted dark:text-muted uppercase tracking-[2px]">{vendor.appliance}</span>
                        <div className="w-1 h-1 rounded-full bg-sand/30" />
                        <span className="text-[10px] font-bold text-olive-dark/70 dark:text-sand/70 uppercase tracking-[2px]">{vendor.availability}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-serif font-bold text-ink dark:text-[#E4E3DA]">₹{vendor.price}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6 mb-10">
                    <div className="flex items-center gap-3 text-sm font-bold text-muted dark:text-muted">
                      <div className="p-3 bg-white dark:bg-[#1A1C18] rounded-xl border border-sand/10 shadow-sm">
                        {vendor.isOnline ? <ExternalLink className="h-4 w-4 text-olive-dark dark:text-sand" /> : <MapPin className="h-4 w-4 text-olive-dark dark:text-sand" />}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-wider opacity-60">Location</span>
                        {vendor.isOnline ? 'Online Store' : `${vendor.distance}km away`}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-muted dark:text-muted">
                      <div className="p-3 bg-white dark:bg-[#1A1C18] rounded-xl border border-sand/10 shadow-sm">
                        <Star className="h-4 w-4 text-terracotta fill-current" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] uppercase tracking-wider opacity-60">Avg Rating</span>
                        {vendor.rating} ({vendor.reviews} reviews)
                      </div>
                    </div>
                  </div>

                  {vendor.isOnline && vendor.url && (
                    <div className="mb-6 px-4 py-2 bg-sand/5 dark:bg-white/5 rounded-xl border border-sand/10 overflow-hidden">
                      <div className="text-[8px] font-bold text-muted uppercase tracking-widest mb-1">Store Link</div>
                      <div className="text-[10px] text-olive-dark dark:text-sand truncate font-medium underline decoration-sand/20">{vendor.url}</div>
                    </div>
                  )}

                  <Button 
                    className={`w-full h-14 rounded-2xl font-bold transition-all text-base ${
                      vendor.isOnline 
                        ? 'bg-olive-dark text-white hover:bg-olive-dark/90 shadow-lg shadow-olive-dark/20' 
                        : 'bg-white dark:bg-[#1A1C18] text-ink dark:text-[#E4E3DA] hover:bg-sand/10 dark:hover:bg-white/5 border-2 border-sand/10'
                    }`} 
                    onClick={() => handleVendorAction(vendor)}
                  >
                    {vendor.isOnline ? 'Order Online' : 'View Details'}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
      
      {filteredVendors.length === 0 && (
        <div className="text-center py-20 text-muted dark:text-muted bg-bg-card dark:bg-[#242622] rounded-[40px] border-none shadow-xl">
          <Search className="h-20 w-20 mx-auto mb-6 opacity-20" />
          <p className="text-xl font-medium">No vendors found matching your search.</p>
        </div>
      )}
    </motion.div>
  );
};
