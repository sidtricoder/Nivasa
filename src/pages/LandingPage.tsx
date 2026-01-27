import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Home, 
  Shield, 
  DollarSign, 
  CheckCircle, 
  ArrowRight,
  PawPrint,
  Train,
  Briefcase,
  Trees,
  Sparkles,
  Users,
  FileCheck,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PropertyCard from '@/components/property/PropertyCard';
import CompareModal from '@/components/property/CompareModal';
import { mockListings } from '@/data/listings';

const lifestyleFilters = [
  { label: 'Pet Friendly', icon: PawPrint, query: 'pet-friendly' },
  { label: 'Near Metro', icon: Train, query: 'near-metro' },
  { label: 'Office Ready', icon: Briefcase, query: 'office-ready' },
  { label: 'Garden View', icon: Trees, query: 'garden-view' },
];

const stats = [
  { value: '500+', label: 'Direct Sales', icon: Home },
  { value: '₹0', label: 'Brokerage Fees', icon: DollarSign },
  { value: '100%', label: 'Verified Properties', icon: Shield },
];

const howItWorks = [
  {
    step: 1,
    title: 'Search & Discover',
    description: 'Browse verified listings with detailed information, photos, and virtual tours.',
    icon: Search,
  },
  {
    step: 2,
    title: 'Connect Directly',
    description: 'Chat with property owners directly. No middlemen, no hidden fees.',
    icon: Users,
  },
  {
    step: 3,
    title: 'Close with Confidence',
    description: 'Complete your transaction with verified documents and secure processes.',
    icon: FileCheck,
  },
];

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const featuredListings = mockListings.filter(p => p.isNewListing).slice(0, 6);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to discover page with search query
    window.location.href = `/discover?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CompareModal />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#5E23DC]">
        {/* Background Pattern/Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#5E23DC] to-[#7B46F6]" />
        
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-indigo-300 blur-3xl" />
        </div>

        <div className="container relative pt-16 pb-0 lg:pt-24 lg:pb-0">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            {/* Left Content - Search & Text */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="z-10 pb-12 lg:pb-24"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 leading-tight">
                Properties to buy in <span className="inline-block relative">
                  Bengaluru
                  <svg className="absolute w-full h-2 bottom-1 left-0 text-yellow-400 opacity-80" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0,5 Q50,10 100,5" stroke="currentColor" strokeWidth="4" fill="none" />
                  </svg>
                </span>
              </h1>
              <p className="text-indigo-100 text-lg mb-8">
                Yaha Search Khatam Karen
              </p>

              {/* Search Box Container */}
              <div className="bg-white rounded-2xl shadow-2xl p-2 max-w-xl">
                {/* Search Tabs */}
                <div className="flex gap-4 px-4 py-2 border-b border-gray-100 mb-2 overflow-x-auto">
                  {['Buy', 'Rent', 'Commercial', 'Plots'].map((tab, i) => (
                    <button 
                      key={tab}
                      className={`text-sm font-semibold pb-2 border-b-2 transition-colors ${i === 0 ? 'text-[#5E23DC] border-[#5E23DC]' : 'text-gray-500 border-transparent hover:text-gray-800'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Search Input Area */}
                <div className="flex flex-col sm:flex-row gap-2 p-2">
                  <div className="flex-1 flex bg-gray-50 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-[#5E23DC]/20 transition-all">
                    {/* City Dropdown Trigger */}
                    <div className="flex items-center gap-2 px-3 border-r border-gray-200 text-gray-700 min-w-[120px] cursor-pointer hover:bg-gray-100 rounded-l-lg transition-colors">
                      <MapPin className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium">Bengaluru</span>
                    </div>
                    
                    {/* Main Input */}
                    <Input
                      type="text"
                      placeholder="Search for locality, landmark, project..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 border-0 bg-transparent focus-visible:ring-0 text-base h-12 px-4 shadow-none"
                    />
                  </div>
                  
                  <Button 
                    onClick={handleSearch}
                    className="bg-[#2cdb9d] hover:bg-[#25c18a] text-white font-bold px-8 h-12 rounded-lg shadow-md transition-all hover:shadow-lg"
                  >
                    Search
                  </Button>
                </div>
              </div>
              
              {/* Quick Tags */}
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="text-indigo-100/80 text-sm font-medium">Quick Links:</span>
                {['New Launch', 'Owner Properties', 'Budget Homes'].map(tag => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="bg-white/10 text-white border-white/20 hover:bg-white/20 cursor-pointer transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </motion.div>

            {/* Right Content - Hero Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative hidden lg:block h-full min-h-[500px]"
            >
             {/* Main Masked Image */}
              <div className="absolute right-0 bottom-0 w-[120%] h-[110%] z-0 translate-x-12 translate-y-12">
                <div className="relative w-full h-full">
                   {/* Abstract Shape Background */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/0 rounded-full blur-3xl transform scale-110" />
                   
                   {/* Couple Image with Cutout Effect */}
                   <img 
                      src="https://images.unsplash.com/photo-1516156008625-3a9d60da480f?q=80&w=1000&auto=format&fit=crop" 
                      alt="Happy family looking at dream home"
                      className="absolute right-0 bottom-0 max-h-[600px] object-contain drop-shadow-2xl z-10"
                      style={{
                        maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                        WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)'
                      }}
                   />
                   
                   {/* Floating Card 1 */}
                   <motion.div 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute top-20 left-10 bg-white p-3 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20 max-w-[200px]"
                   >
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span className="text-xs font-bold text-gray-600">Verified Listing</span>
                      </div>
                      <div className="h-16 w-full bg-gray-100 rounded-lg mb-2 overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=300&h=200&fit=crop" className="w-full h-full object-cover" alt="Property" />
                      </div>
                      <div className="text-xs font-medium text-gray-800">3BHK in Indiranagar</div>
                      <div className="text-xs text-[#5E23DC] font-bold mt-1">₹1.2 Cr</div>
                   </motion.div>

                   {/* Floating Card 2 */}
                   <motion.div 
                      animate={{ y: [0, 15, 0] }}
                      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                      className="absolute bottom-40 right-10 bg-white p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-20"
                   >
                      <div className="flex items-center gap-2">
                         <div className="bg-green-100 p-2 rounded-full">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                         </div>
                         <div>
                            <div className="text-sm font-bold text-gray-800">500+</div>
                            <div className="text-xs text-gray-500">New Listings</div>
                         </div>
                      </div>
                   </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-secondary/30">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stats.map(({ value, label, icon: Icon }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-center gap-4 p-6"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                  <Icon className="h-7 w-7 text-primary" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-foreground">{value}</p>
                  <p className="text-sm text-muted-foreground">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-end justify-between mb-8"
          >
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Featured Properties
              </h2>
              <p className="text-muted-foreground">
                Hand-picked homes from verified owners
              </p>
            </div>
            <Link to="/discover">
              <Button variant="outline" className="gap-2 hidden sm:flex">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredListings.map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-8 sm:hidden">
            <Link to="/discover">
              <Button variant="outline" className="gap-2">
                View All Properties
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 lg:py-24 bg-secondary/30">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How HavenHub Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Three simple steps to find and buy your dream home directly from owners
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {howItWorks.map(({ step, title, description, icon: Icon }, index) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
              >
                <Card className="relative h-full text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-8 pb-6">
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                        {step}
                      </div>
                    </div>
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mx-auto mb-4">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 lg:p-12 text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
              Ready to Find Your Haven?
            </h2>
            <p className="text-primary-foreground/80 max-w-xl mx-auto mb-8">
              Join thousands of happy homeowners who found their perfect property 
              through direct connections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/discover">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Search className="h-5 w-5" />
                  Browse Homes
                </Button>
              </Link>
              <Link to="/seller">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary"
                >
                  <Home className="h-5 w-5" />
                  List Your Property
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
