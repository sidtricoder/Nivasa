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
  FileCheck
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/20" />
        <div className="container relative py-20 lg:py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <Badge variant="secondary" className="gap-1">
              <Sparkles className="h-3 w-3" />
              India's Most Trusted P2P Platform
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
              Find Your Perfect{' '}
              <span className="text-primary">Haven</span>
              <br />
              Without the Middleman
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Connect directly with verified property owners. No brokerage fees, 
              no hidden charges — just transparent home buying.
            </p>

            {/* Search Bar */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              onSubmit={handleSearch}
              className="relative max-w-2xl mx-auto mt-8"
            >
              <div className="flex items-center bg-card border border-border rounded-xl shadow-lg p-2">
                <Search className="h-5 w-5 text-muted-foreground ml-3" />
                <Input
                  type="text"
                  placeholder="Search by location, lifestyle, or property type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus-visible:ring-0 text-base"
                />
                <Button type="submit" size="lg" className="rounded-lg">
                  Search
                </Button>
              </div>
            </motion.form>

            {/* Lifestyle Filters */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="flex flex-wrap items-center justify-center gap-2 mt-4"
            >
              <span className="text-sm text-muted-foreground">Popular:</span>
              {lifestyleFilters.map(({ label, icon: Icon, query }) => (
                <Link key={query} to={`/discover?filter=${query}`}>
                  <Badge
                    variant="outline"
                    className="gap-1 cursor-pointer hover:bg-secondary transition-colors"
                  >
                    <Icon className="h-3 w-3" />
                    {label}
                  </Badge>
                </Link>
              ))}
            </motion.div>
          </motion.div>
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
