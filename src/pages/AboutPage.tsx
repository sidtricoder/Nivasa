import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Building2, 
  Users, 
  Shield, 
  Award,
  Target,
  Heart,
  Sparkles,
  ArrowRight,
  Star,
  TrendingUp,
  CheckCircle,
  Globe,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const AboutPage: React.FC = () => {
  const stats = [
    { value: '50K+', label: 'Properties Listed', icon: Building2 },
    { value: '25K+', label: 'Happy Customers', icon: Users },
    { value: '100+', label: 'Cities Covered', icon: Globe },
    { value: '₹0', label: 'Brokerage Fee', icon: Zap },
  ];

  const values = [
    {
      icon: Shield,
      title: 'Trust & Transparency',
      description: 'Every property is verified. Every transaction is transparent. We believe in building trust through honesty.',
      color: 'from-blue-500/20 to-cyan-500/10',
      iconColor: 'text-blue-500',
    },
    {
      icon: Heart,
      title: 'Customer First',
      description: 'Your dream home journey is our priority. We go above and beyond to ensure your satisfaction.',
      color: 'from-rose-500/20 to-pink-500/10',
      iconColor: 'text-rose-500',
    },
    {
      icon: Target,
      title: 'Innovation',
      description: 'From AI-powered search to virtual tours, we leverage cutting-edge technology to simplify real estate.',
      color: 'from-purple-500/20 to-violet-500/10',
      iconColor: 'text-purple-500',
    },
    {
      icon: Award,
      title: 'Excellence',
      description: 'We strive for excellence in everything we do, from customer service to platform experience.',
      color: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-500',
    },
  ];

  const team = [
    {
      name: 'Aditya Mittal',
      role: 'Founder & CEO',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
      bio: 'Visionary leader with 10+ years in real estate tech',
    },
    {
      name: 'Priya Sharma',
      role: 'Chief Technology Officer',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
      bio: 'Tech innovator building the future of proptech',
    },
    {
      name: 'Rahul Verma',
      role: 'Head of Operations',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop',
      bio: 'Ensuring seamless experiences across all touchpoints',
    },
    {
      name: 'Sneha Patel',
      role: 'Head of Customer Success',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
      bio: 'Dedicated to making every customer journey delightful',
    },
  ];

  const milestones = [
    { year: '2020', title: 'Founded', description: 'Started with a vision to transform real estate in India' },
    { year: '2021', title: '10K Users', description: 'Reached our first major milestone of 10,000 users' },
    { year: '2022', title: 'Series A', description: 'Raised $10M to expand operations across India' },
    { year: '2023', title: '100 Cities', description: 'Expanded to cover 100+ cities nationwide' },
    { year: '2024', title: 'AI Launch', description: 'Introduced AI-powered property recommendations' },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Soft flowing gradient background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            linear-gradient(135deg, 
              rgba(230, 210, 220, 0.6) 0%,
              rgba(240, 238, 233, 0.9) 25%,
              rgba(245, 243, 240, 1) 50%,
              rgba(220, 225, 240, 0.7) 75%,
              rgba(210, 200, 220, 0.5) 100%
            )
          `
        }}
      />
      
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(200, 190, 230, 0.6) 0%, rgba(180, 170, 220, 0.3) 50%, transparent 70%)'
          }}
        />
        <div 
          className="absolute -bottom-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(255, 200, 180, 0.6) 0%, rgba(255, 180, 160, 0.3) 50%, transparent 70%)'
          }}
        />
      </div>

      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="container max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur border border-[#3B7BFF]/20 text-[#3B7BFF] text-sm font-medium mb-8 shadow-lg shadow-blue-500/10"
            >
              <Sparkles className="h-4 w-4" />
              Transforming Real Estate Since 2020
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#2B2F36] mb-8 leading-tight">
              Building Dreams,
              <br />
              <span className="bg-gradient-to-r from-[#3B7BFF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent">
                One Home at a Time
              </span>
            </h1>
            
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed mb-10">
              We're on a mission to make finding your perfect home as simple and 
              joyful as it should be. Zero brokerage, complete transparency, 
              and technology that works for you.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/discover">
                <Button 
                  size="lg"
                  className="bg-[#3B7BFF] hover:bg-[#2563EB] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                >
                  Explore Properties
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button 
                  variant="outline"
                  size="lg"
                  className="px-8 py-6 text-lg rounded-xl border-2 hover:bg-white/50"
                >
                  Get in Touch
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 text-center border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#3B7BFF]/10 to-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="h-6 w-6 text-[#3B7BFF]" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-[#2B2F36] mb-1">
                    {stat.value}
                  </div>
                  <p className="text-sm text-[#6B7280] font-medium">{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container max-w-7xl px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-[#3B7BFF] font-semibold text-sm tracking-wider uppercase mb-4 block">
                Our Story
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-[#2B2F36] mb-6 leading-tight">
                From a Simple Idea to 
                <span className="text-[#3B7BFF]"> India's Most Trusted</span> Property Platform
              </h2>
              <div className="space-y-4 text-[#6B7280] text-lg leading-relaxed">
                <p>
                  It all started with a frustrating house hunting experience. Endless broker calls, 
                  hidden charges, and properties that looked nothing like the photos.
                </p>
                <p>
                  We knew there had to be a better way. So we built Nivasa — a platform where 
                  transparency isn't just a promise, it's a principle. Where every listing is verified, 
                  every photo is real, and every price is final.
                </p>
                <p>
                  Today, we've helped over 25,000 families find their perfect homes, and we're 
                  just getting started.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&h=600&fit=crop"
                  alt="Modern home"
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-2 text-white">
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">4.9/5 Customer Rating</span>
                  </div>
                </div>
              </div>
              
              {/* Floating card */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="absolute -bottom-8 -left-8 bg-white rounded-2xl p-5 shadow-xl border border-gray-100"
              >
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-green-500/10 flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-green-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-[#2B2F36]">₹500Cr+</p>
                    <p className="text-sm text-[#6B7280]">Property Transactions</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#3B7BFF] font-semibold text-sm tracking-wider uppercase mb-4 block">
              Our Values
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2B2F36] mb-6">
              What We Stand For
            </h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              These principles guide everything we do, from product decisions to customer interactions
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <motion.div
                key={value.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <value.icon className={`h-7 w-7 ${value.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-bold text-[#2B2F36] mb-3">{value.title}</h3>
                  <p className="text-[#6B7280] leading-relaxed">{value.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#3B7BFF] font-semibold text-sm tracking-wider uppercase mb-4 block">
              Our Journey
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2B2F36]">
              Milestones We're Proud Of
            </h2>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#3B7BFF] via-[#8B5CF6] to-[#EC4899]" />
            
            <div className="space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={milestone.year}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg inline-block">
                      <span className="text-[#3B7BFF] font-bold text-lg">{milestone.year}</span>
                      <h3 className="text-xl font-bold text-[#2B2F36] mt-1">{milestone.title}</h3>
                      <p className="text-[#6B7280] mt-2">{milestone.description}</p>
                    </div>
                  </div>
                  
                  <div className="hidden md:flex h-12 w-12 rounded-full bg-white border-4 border-[#3B7BFF] items-center justify-center z-10 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-[#3B7BFF]" />
                  </div>
                  
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-[#3B7BFF] font-semibold text-sm tracking-wider uppercase mb-4 block">
              Our Team
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-[#2B2F36] mb-6">
              Meet the Dreamers
            </h2>
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto">
              Passionate people building the future of real estate
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className="relative h-64 overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-[#2B2F36]">{member.name}</h3>
                    <p className="text-[#3B7BFF] font-medium text-sm mb-2">{member.role}</p>
                    <p className="text-[#6B7280] text-sm">{member.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-3xl overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#3B7BFF] via-[#8B5CF6] to-[#EC4899]" />
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200')] bg-cover bg-center opacity-10" />
            
            <div className="relative py-16 px-8 md:py-20 md:px-16 text-center">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Ready to Find Your Dream Home?
              </h2>
              <p className="text-xl text-white/80 max-w-2xl mx-auto mb-10">
                Join thousands of happy customers who found their perfect home with Nivasa
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/discover">
                  <Button 
                    size="lg"
                    className="bg-white text-[#3B7BFF] hover:bg-white/90 px-8 py-6 text-lg rounded-xl shadow-lg"
                  >
                    Start Exploring
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button 
                    size="lg"
                    className="bg-white/20 backdrop-blur border-2 border-white text-white hover:bg-white hover:text-[#3B7BFF] px-8 py-6 text-lg rounded-xl transition-all"
                  >
                    Contact Us
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default AboutPage;
