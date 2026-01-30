import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  Sparkles,
  ArrowRight,
  Building2,
  Users,
  Headphones,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
    }, 3000);
  };

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Us',
      description: 'We respond within 24 hours',
      value: 'support@nivasa.in',
      secondaryValue: 'hello@nivasa.in',
      color: 'from-blue-500/20 to-cyan-500/10',
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
    },
    {
      icon: Phone,
      title: 'Call Us',
      description: 'Mon-Sat, 9 AM to 7 PM',
      value: '+91 98765 43210',
      secondaryValue: '+91 91234 56789',
      color: 'from-green-500/20 to-emerald-500/10',
      iconColor: 'text-green-500',
      iconBg: 'bg-green-500/10',
    },
    {
      icon: MapPin,
      title: 'Visit Us',
      description: 'Our headquarters',
      value: '123, Brigade Road',
      secondaryValue: 'Bangalore, Karnataka 560001',
      color: 'from-orange-500/20 to-amber-500/10',
      iconColor: 'text-orange-500',
      iconBg: 'bg-orange-500/10',
    },
    {
      icon: Clock,
      title: 'Working Hours',
      description: 'When we\'re available',
      value: 'Mon - Sat: 9 AM - 7 PM',
      secondaryValue: 'Sunday: 10 AM - 5 PM',
      color: 'from-purple-500/20 to-violet-500/10',
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10',
    },
  ];

  const quickHelp = [
    { question: 'How do I list my property for free?', icon: Building2 },
    { question: 'What documents are needed for verification?', icon: CheckCircle },
    { question: 'How does the zero brokerage model work?', icon: Users },
    { question: 'How can I schedule a property visit?', icon: MapPin },
  ];

  const stats = [
    { value: '< 24h', label: 'Response Time', icon: Clock },
    { value: '50+', label: 'Support Agents', icon: Headphones },
    { value: '100+', label: 'Cities Covered', icon: Globe },
    { value: '4.9/5', label: 'Customer Rating', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Soft flowing gradient background */}
      <div 
        className="fixed inset-0 -z-10"
        style={{
          background: `
            linear-gradient(225deg, 
              rgba(220, 225, 240, 0.7) 0%,
              rgba(245, 243, 240, 1) 25%,
              rgba(240, 238, 233, 0.9) 50%,
              rgba(230, 210, 220, 0.6) 75%,
              rgba(200, 220, 230, 0.5) 100%
            )
          `
        }}
      />
      
      {/* Animated gradient blobs */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div 
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(180, 200, 240, 0.6) 0%, rgba(160, 190, 230, 0.3) 50%, transparent 70%)'
          }}
        />
        <div 
          className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full opacity-40 blur-3xl"
          style={{
            background: 'radial-gradient(circle, rgba(230, 200, 220, 0.6) 0%, rgba(220, 180, 210, 0.3) 50%, transparent 70%)'
          }}
        />
      </div>

      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
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
              <MessageSquare className="h-4 w-4" />
              We're Here to Help
            </motion.div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-[#2B2F36] mb-8 leading-tight">
              Get in
              <span className="bg-gradient-to-r from-[#3B7BFF] via-[#8B5CF6] to-[#EC4899] bg-clip-text text-transparent"> Touch</span>
            </h1>
            
            <p className="text-xl text-[#6B7280] max-w-2xl mx-auto leading-relaxed">
              Have questions about buying or selling property? We're here to help. 
              Reach out and we'll respond as soon as we can.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-8">
        <div className="container max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="bg-white/60 backdrop-blur-xl rounded-2xl p-5 text-center border border-white/50 shadow-lg"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#3B7BFF]/10 to-[#8B5CF6]/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="h-5 w-5 text-[#3B7BFF]" />
                </div>
                <div className="text-2xl font-bold text-[#2B2F36]">{stat.value}</div>
                <p className="text-sm text-[#6B7280]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-12">
        <div className="container max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactMethods.map((method, index) => (
              <motion.div
                key={method.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-lg hover:shadow-xl transition-all hover:-translate-y-2">
                  <div className={`h-14 w-14 rounded-2xl ${method.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                    <method.icon className={`h-7 w-7 ${method.iconColor}`} />
                  </div>
                  <h3 className="text-lg font-bold text-[#2B2F36] mb-1">{method.title}</h3>
                  <p className="text-sm text-[#6B7280] mb-4">{method.description}</p>
                  <p className="font-medium text-[#2B2F36]">{method.value}</p>
                  <p className="text-sm text-[#6B7280]">{method.secondaryValue}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Form Section */}
      <section className="py-16">
        <div className="container max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            
            {/* Left: Quick Help & Map */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Quick Help */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 border border-white/50 shadow-lg">
                <h3 className="text-xl font-bold text-[#2B2F36] mb-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-[#3B7BFF]/10 flex items-center justify-center">
                    <Sparkles className="h-5 w-5 text-[#3B7BFF]" />
                  </div>
                  Frequently Asked
                </h3>
                <div className="space-y-4">
                  {quickHelp.map((item, index) => (
                    <motion.button
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100/50 hover:from-[#3B7BFF]/5 hover:to-[#8B5CF6]/5 transition-all group text-left"
                    >
                      <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow">
                        <item.icon className="h-5 w-5 text-[#6B7280] group-hover:text-[#3B7BFF] transition-colors" />
                      </div>
                      <span className="text-[#2B2F36] font-medium group-hover:text-[#3B7BFF] transition-colors">
                        {item.question}
                      </span>
                    </motion.button>
                  ))}
                </div>
                <Link to="/about">
                  <Button 
                    variant="outline" 
                    className="w-full mt-6 gap-2 border-2 hover:bg-[#3B7BFF]/5 hover:border-[#3B7BFF]/30"
                  >
                    Learn More About Us
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              {/* Map Placeholder */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/50 shadow-lg">
                <div className="relative h-64">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.0095730792814!2d77.60678931579953!3d12.970598190854766!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670c9b44e6d%3A0xf8dfc3e8517e4fe0!2sBrigade%20Road%2C%20Bengaluru%2C%20Karnataka!5e0!3m2!1sen!2sin!4v1625000000000!5m2!1sen!2sin"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="grayscale hover:grayscale-0 transition-all duration-500"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 to-transparent p-4">
                    <p className="text-sm font-medium text-[#2B2F36]">📍 123, Brigade Road, Bangalore</p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 md:p-10 border border-white/50 shadow-xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#3B7BFF] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-blue-500/25">
                    <Send className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#2B2F36]">Send us a Message</h2>
                    <p className="text-[#6B7280]">We'll get back to you within 24 hours</p>
                  </div>
                </div>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16"
                  >
                    <motion.div 
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200 }}
                      className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/30"
                    >
                      <CheckCircle className="h-10 w-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-bold text-[#2B2F36] mb-3">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-[#6B7280] text-lg">
                      We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#2B2F36]">
                          Your Name *
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-[#3B7BFF] focus:ring-2 focus:ring-[#3B7BFF]/20 bg-white/50 backdrop-blur transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#2B2F36]">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-[#3B7BFF] focus:ring-2 focus:ring-[#3B7BFF]/20 bg-white/50 backdrop-blur transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#2B2F36]">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-[#3B7BFF] focus:ring-2 focus:ring-[#3B7BFF]/20 bg-white/50 backdrop-blur transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-[#2B2F36]">
                          Subject *
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-[#3B7BFF] focus:ring-2 focus:ring-[#3B7BFF]/20 bg-white/50 backdrop-blur transition-all appearance-none cursor-pointer"
                        >
                          <option value="">Select a topic</option>
                          <option value="buying">Buying a Property</option>
                          <option value="selling">Selling a Property</option>
                          <option value="verification">Property Verification</option>
                          <option value="support">Technical Support</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-[#2B2F36]">
                        Your Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us how we can help you..."
                        className="w-full px-5 py-4 rounded-xl border-2 border-gray-100 focus:border-[#3B7BFF] focus:ring-2 focus:ring-[#3B7BFF]/20 bg-white/50 backdrop-blur resize-none transition-all"
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-r from-[#3B7BFF] to-[#8B5CF6] hover:from-[#2563EB] hover:to-[#7C3AED] text-white py-7 rounded-xl font-semibold text-lg flex items-center justify-center gap-3 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ContactPage;
