import React, { useState, useEffect, useRef } from 'react';
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
import MinimalPropertyCard from '@/components/property/MinimalPropertyCard';
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

// CountUp Component for animated counting
const CountUp: React.FC<{ end: number; suffix?: string; prefix?: string; duration?: number }> = ({ 
  end, 
  suffix = '', 
  prefix = '', 
  duration = 1200 
}) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let startTime: number;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuad = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easeOutQuad * end));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return <span ref={ref}>{prefix}{count}{suffix}</span>;
};

const LandingPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Navigate to discover page with search query
    window.location.href = `/discover?search=${encodeURIComponent(searchQuery)}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <CompareModal />

      {/* Hero Section with Video Background */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'transform' }}
        >
          <source src="/vid 1.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay - Slightly darker */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center text-white px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-light italic leading-tight">
              Your Dream Home, Direct From Owner-Zero Brokerage, 100% Trust
            </h1>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Link to="/discover">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="px-8 py-6 text-base font-medium border border-white text-white bg-transparent rounded-none hover:bg-white hover:text-black transition-all duration-300"
                >
                  EXPLORE
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Selling Fast Section */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="container">
          {/* Section Header - Minimal like HavenHub */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-foreground">
              Selling Fast
            </h2>
          </motion.div>

          {/* Property Grid - Only 3 properties, seamless cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {mockListings.slice(0, 3).map((property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
              >
                <MinimalPropertyCard property={property} />
              </motion.div>
            ))}
          </div>

          {/* CTA Button - Centered */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-12"
          >
            <Link to="/discover">
              <Button 
                variant="outline" 
                size="lg"
                className="px-8 py-6 text-base font-medium border border-foreground rounded-none hover:bg-foreground hover:text-background transition-all duration-300"
              >
                VIEW INVENTORY
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Stats Section with Background Image */}
      <section className="relative py-24 lg:py-32 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/Whisk_c33eab9a8ec0f7aa3044aa8957f6e418dr.jpeg')" }}
        />
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/60" />
        
        {/* Content */}
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center text-white max-w-4xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light italic mb-6">
              Building Dreams Into Reality — One Home At A Time
            </h2>
            <p className="text-lg md:text-xl text-white/80 mb-16">
              With a commitment to transparency and trust, we connect homebuyers directly with verified property owners across India's most sought-after locations.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-center"
              >
                <p className="text-5xl md:text-6xl font-light mb-2">
                  <CountUp end={500} suffix="+" />
                </p>
                <p className="text-sm uppercase tracking-widest text-white/70">HAPPY HOMEOWNERS</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="text-center"
              >
                <p className="text-5xl md:text-6xl font-light mb-2">
                  <CountUp end={0} prefix="₹" />
                </p>
                <p className="text-sm uppercase tracking-widest text-white/70">BROKERAGE FEES</p>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-center"
              >
                <p className="text-5xl md:text-6xl font-light mb-2">
                  <CountUp end={100} suffix="%" />
                </p>
                <p className="text-sm uppercase tracking-widest text-white/70">VERIFIED PROPERTIES</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* White Spacer */}
      <div className="py-12 lg:py-16 bg-background" />

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

      {/* White Spacer before CTA */}
      <div className="py-12 lg:py-16 bg-background" />

      {/* CTA Section with Video Background */}
      <section className="relative py-32 lg:py-44 overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          style={{ willChange: 'transform' }}
        >
          <source src="/vid 2.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Overlay */}
        <div className="absolute inset-0 bg-black/50" />
        
        {/* Content */}
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="text-center text-white max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-light italic mb-6">
              Ready to Find Your Haven?
            </h2>
            <p className="text-lg md:text-xl text-white/80 max-w-xl mx-auto mb-10">
              Join thousands of happy homeowners who found their perfect property 
              through direct connections.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/discover">
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2 px-8 py-6 text-base font-medium border border-white text-white bg-transparent rounded-none hover:bg-white hover:text-black transition-all duration-300"
                >
                  <Search className="h-5 w-5" />
                  Browse Homes
                </Button>
              </Link>
              <Link to="/seller">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="gap-2 px-8 py-6 text-base font-medium border border-white text-white bg-transparent rounded-none hover:bg-white hover:text-black transition-all duration-300"
                >
                  <Home className="h-5 w-5" />
                  List Your Property
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* White Spacer before Footer */}
      <div className="py-12 lg:py-16 bg-background" />

      <Footer />
    </div>
  );
};

export default LandingPage;
