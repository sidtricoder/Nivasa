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
import WhyNivasa from '@/components/landing/WhyNivasa';
import FAQSection from '@/components/landing/FAQSection';
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
    title: 'Smart Discovery',
    description: 'Our AI-powered search helps you find properties that match your lifestyle, budget, and preferences with precision.',
    icon: Sparkles,
    image: '/img1.png',
  },
  {
    title: 'Immersive Viewing',
    description: 'Experience properties through high-quality photos, detailed floor plans, and immersive 3D virtual tours from anywhere.',
    icon: Home,
    image: '/img2.png',
  },
  {
    title: 'Trusted Connection',
    description: 'Connect directly with verified property owners. No middlemen, no hidden fees, just transparent communication.',
    icon: Users,
    image: '/img3.png',
  },
  {
    title: 'Seamless Closing',
    description: 'Complete your transaction with confidence using verified documents, secure processes, and expert guidance.',
    icon: FileCheck,
    image: '/img4.png',
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

      {/* Why Choose Nivasa Section */}
      <WhyNivasa />

      {/* How It Works - Premium 2026 Design */}
      <section className="py-28 lg:py-36 bg-gradient-to-b from-slate-50 via-white to-slate-50/50 overflow-visible">
        <div className="container max-w-7xl px-6 lg:px-8">
          {/* Header with fluid typography */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center mb-20 lg:mb-28"
          >
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-primary text-sm font-semibold tracking-[0.2em] uppercase mb-5"
            >
              YOUR JOURNEY TO HOME OWNERSHIP
            </motion.p>
            <h2 className="font-premium text-fluid-3xl font-semibold text-foreground mb-6">
              How HavenHub Works
            </h2>
            <p className="text-fluid-body text-muted-foreground max-w-2xl mx-auto">
              From discovery to closing, we make finding your dream home simple, transparent, and stress-free.
            </p>
          </motion.div>

          {/* True Asymmetric Bento Grid */}
          <div className="space-y-6 lg:space-y-8">
            
            {/* Row 1: Hero Card - Smart Discovery (Full Width) */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="group perspective-1000"
            >
              <motion.div
                whileHover={{ 
                  rotateX: 1,
                  rotateY: 2,
                  scale: 1.01,
                  transition: { duration: 0.4 }
                }}
                className="preserve-3d"
              >
                <div className="glass-card ambient-shadow rounded-3xl p-8 lg:p-10 xl:p-12 transition-all duration-500 group-hover:ambient-shadow-hover relative overflow-visible">
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 via-transparent to-purple-500/0 group-hover:from-blue-500/5 group-hover:to-purple-500/5 transition-all duration-700 rounded-3xl" />
                  
                  <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
                    {/* Content */}
                    <div className="order-2 lg:order-1">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center mb-6"
                      >
                        <Sparkles className="h-7 w-7 text-primary" />
                      </motion.div>
                      <h3 className="font-premium text-fluid-xl font-semibold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                        Smart Discovery
                      </h3>
                      <p className="text-fluid-body text-muted-foreground leading-relaxed mb-6">
                        Our AI-powered search helps you find properties that match your lifestyle, budget, and preferences with precision. Get intelligent recommendations based on your unique needs.
                      </p>
                      {/* Feature chips */}
                      <div className="flex flex-wrap gap-3">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.6, type: "spring", stiffness: 400 }}
                          className="floating-accent floating-accent-success bg-green-500 text-white text-xs font-medium px-4 py-2 rounded-full"
                        >
                          AI-Powered
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, scale: 0.5 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.75, type: "spring", stiffness: 400 }}
                          className="floating-accent bg-blue-500 text-white text-xs font-medium px-4 py-2 rounded-full"
                        >
                          Lifestyle Match
                        </motion.span>
                      </div>
                    </div>
                    
                    {/* Image - bleeds outside card */}
                    <div className="order-1 lg:order-2 relative min-h-[280px] lg:min-h-[320px] flex items-center justify-center">
                      <motion.div 
                        className="relative"
                        whileHover={{ y: -8, scale: 1.02 }}
                        transition={{ duration: 0.4 }}
                      >
                        {/* Floating badges */}
                        <motion.div
                          initial={{ opacity: 0, x: 30, y: 20 }}
                          whileInView={{ opacity: 1, x: 0, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
                          className="absolute -top-4 right-0 lg:-right-4 z-30 floating-accent floating-accent-success bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold px-4 py-2 rounded-full animate-float"
                        >
                          Walk Score: High
                        </motion.div>
                        <motion.div
                          initial={{ opacity: 0, x: -30, y: 20 }}
                          whileInView={{ opacity: 1, x: 0, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 1.1, type: "spring", stiffness: 300 }}
                          className="absolute top-16 -left-4 lg:-left-8 z-30 floating-accent bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-full animate-float"
                          style={{ animationDelay: '0.5s' }}
                        >
                          Value: Good
                        </motion.div>
                        
                        {/* Main image */}
                        <motion.img 
                          src="/img1.png" 
                          alt="Smart Discovery"
                          className="w-full max-w-md h-auto object-contain"
                          style={{ 
                            filter: 'drop-shadow(0 30px 40px rgba(0,0,0,0.2))',
                            transform: 'translateZ(40px)'
                          }}
                        />
                        
                        {/* Pulse on map */}
                        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-4 h-4 bg-primary rounded-full animate-pulse-soft shadow-lg" />
                      </motion.div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            {/* Row 2: Three Cards - Asymmetric sizes */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              
              {/* Card 2: Immersive Viewing - Slides from left */}
              <motion.div
                initial={{ opacity: 0, x: -60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="group perspective-1000"
              >
                <motion.div
                  whileHover={{ rotateY: -5, scale: 1.02, transition: { duration: 0.3 } }}
                  className="preserve-3d h-full"
                >
                  <div className="h-full glass-card ambient-shadow rounded-3xl p-8 lg:p-10 transition-all duration-500 group-hover:ambient-shadow-hover relative overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 to-pink-500/0 group-hover:from-rose-500/5 group-hover:to-pink-500/5 transition-all duration-500 rounded-3xl" />
                    
                    <div className="relative z-10">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 flex items-center justify-center mb-5"
                      >
                        <Home className="h-6 w-6 text-rose-500" />
                      </motion.div>
                      <h3 className="font-premium text-xl lg:text-2xl font-semibold text-foreground mb-3 group-hover:text-rose-500 transition-colors duration-300">
                        Immersive Viewing
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-[15px] mb-6">
                        Experience properties through high-quality photos, floor plans, and 3D virtual tours.
                      </p>
                      
                      {/* Image with bleed effect */}
                      <div className="relative -mb-10 lg:-mb-12 -mx-4">
                        <motion.div
                          whileHover={{ y: -5, rotate: 2 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img 
                            src="/img2.png" 
                            alt="Immersive Viewing"
                            className="w-full h-auto object-contain"
                            style={{ 
                              filter: 'drop-shadow(0 25px 30px rgba(0,0,0,0.15))',
                              transform: 'translateY(20px)'
                            }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Card 3: Trusted Connection - Slides from bottom */}
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group perspective-1000"
              >
                <motion.div
                  whileHover={{ rotateX: 3, scale: 1.02, transition: { duration: 0.3 } }}
                  className="preserve-3d h-full"
                >
                  <div className="h-full glass-card ambient-shadow rounded-3xl p-8 lg:p-10 transition-all duration-500 group-hover:ambient-shadow-hover relative overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-500 rounded-3xl" />
                    
                    <div className="relative z-10">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-500/5 flex items-center justify-center mb-5"
                      >
                        <Users className="h-6 w-6 text-emerald-600" />
                      </motion.div>
                      <h3 className="font-premium text-xl lg:text-2xl font-semibold text-foreground mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                        Trusted Connection
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-[15px] mb-6">
                        Connect directly with verified property owners. No middlemen, no hidden fees.
                      </p>
                      
                      {/* Verified badge with shimmer */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, type: "spring", stiffness: 400 }}
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 text-white text-xs font-semibold px-4 py-2 rounded-full mb-6"
                      >
                        <Shield className="h-3.5 w-3.5" />
                        Verified Owner
                      </motion.div>
                      
                      {/* Image */}
                      <div className="relative -mb-10 lg:-mb-12">
                        <motion.div
                          whileHover={{ y: -5 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img 
                            src="/img3.png" 
                            alt="Trusted Connection"
                            className="w-full h-auto object-contain scale-105"
                            style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.12))' }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Card 4: Seamless Closing - Slides from right */}
              <motion.div
                initial={{ opacity: 0, x: 60 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="group perspective-1000 md:col-span-2 lg:col-span-1"
              >
                <motion.div
                  whileHover={{ rotateY: 5, scale: 1.02, transition: { duration: 0.3 } }}
                  className="preserve-3d h-full"
                >
                  <div className="h-full glass-card ambient-shadow rounded-3xl p-8 lg:p-10 transition-all duration-500 group-hover:ambient-shadow-hover relative overflow-visible">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 to-purple-500/0 group-hover:from-violet-500/5 group-hover:to-purple-500/5 transition-all duration-500 rounded-3xl" />
                    
                    <div className="relative z-10">
                      <motion.div 
                        initial={{ scale: 0, rotate: -180 }}
                        whileInView={{ scale: 1, rotate: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/15 to-violet-500/5 flex items-center justify-center mb-5"
                      >
                        <FileCheck className="h-6 w-6 text-violet-500" />
                      </motion.div>
                      <h3 className="font-premium text-xl lg:text-2xl font-semibold text-foreground mb-3 group-hover:text-violet-500 transition-colors duration-300">
                        Seamless Closing
                      </h3>
                      <p className="text-muted-foreground leading-relaxed text-[15px] mb-6">
                        Complete your transaction with verified documents and secure processes.
                      </p>
                      
                      {/* Animated checkmark */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.3 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 1, type: "spring", stiffness: 400 }}
                        className="flex items-center gap-2 mb-6"
                      >
                        <CheckCircle className="h-5 w-5 text-violet-500 animate-pulse-soft" />
                        <span className="text-sm text-muted-foreground font-medium">100% Secure Process</span>
                      </motion.div>
                      
                      {/* Image */}
                      <div className="relative -mb-10 lg:-mb-12">
                        <motion.div
                          whileHover={{ y: -5, rotate: -1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <img 
                            src="/img4.png" 
                            alt="Seamless Closing"
                            className="w-full h-auto object-contain"
                            style={{ filter: 'drop-shadow(0 20px 25px rgba(0,0,0,0.12))' }}
                          />
                        </motion.div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

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

      {/* FAQ Section */}
      <FAQSection />

      <Footer />
    </div>
  );
};

export default LandingPage;
