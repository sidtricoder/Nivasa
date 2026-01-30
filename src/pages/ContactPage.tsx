import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Send,
  MessageSquare,
  Clock,
  CheckCircle
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

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#F5F5F5] to-white">
        <div className="container max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-semibold text-[#2B2F36] mb-6">
              Get in Touch
            </h1>
            <p className="text-lg text-[#6B7280] max-w-2xl mx-auto">
              Have questions about buying or selling property? We're here to help.
              Reach out and we'll respond as soon as we can.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 lg:py-24">
        <div className="container max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left: Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-2xl md:text-3xl font-semibold text-[#2B2F36] mb-8">
                Contact Information
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#3B7BFF]/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="h-5 w-5 text-[#3B7BFF]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2B2F36] mb-1">Email Us</h3>
                    <p className="text-[#6B7280]">support@nivasa.in</p>
                    <p className="text-[#6B7280]">hello@nivasa.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="h-5 w-5 text-[#10B981]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2B2F36] mb-1">Call Us</h3>
                    <p className="text-[#6B7280]">+91 98765 43210</p>
                    <p className="text-[#6B7280]">+91 91234 56789</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#F97316]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-5 w-5 text-[#F97316]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2B2F36] mb-1">Visit Us</h3>
                    <p className="text-[#6B7280]">
                      123, Brigade Road<br />
                      Bangalore, Karnataka 560001
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="h-5 w-5 text-[#8B5CF6]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#2B2F36] mb-1">Working Hours</h3>
                    <p className="text-[#6B7280]">Monday - Saturday: 9 AM - 7 PM</p>
                    <p className="text-[#6B7280]">Sunday: 10 AM - 5 PM</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-12 p-6 bg-[#F5F5F5] rounded-2xl">
                <h3 className="font-semibold text-[#2B2F36] mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-[#3B7BFF]" />
                  Quick Help
                </h3>
                <ul className="space-y-3 text-[#6B7280]">
                  <li>• How do I list my property for free?</li>
                  <li>• What documents are needed for verification?</li>
                  <li>• How does the zero brokerage model work?</li>
                  <li>• How can I schedule a property visit?</li>
                </ul>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <h2 className="text-2xl font-semibold text-[#2B2F36] mb-6">
                  Send us a Message
                </h2>

                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-[#10B981]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-8 w-8 text-[#10B981]" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#2B2F36] mb-2">
                      Message Sent!
                    </h3>
                    <p className="text-[#6B7280]">
                      We'll get back to you within 24 hours.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-[#2B2F36] mb-2">
                          Your Name *
                        </label>
                        <Input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="John Doe"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B7BFF] focus:ring-1 focus:ring-[#3B7BFF]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#2B2F36] mb-2">
                          Email Address *
                        </label>
                        <Input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="john@example.com"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B7BFF] focus:ring-1 focus:ring-[#3B7BFF]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-[#2B2F36] mb-2">
                          Phone Number
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+91 98765 43210"
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B7BFF] focus:ring-1 focus:ring-[#3B7BFF]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#2B2F36] mb-2">
                          Subject *
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B7BFF] focus:ring-1 focus:ring-[#3B7BFF] bg-white"
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

                    <div>
                      <label className="block text-sm font-medium text-[#2B2F36] mb-2">
                        Your Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us how we can help you..."
                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-[#3B7BFF] focus:ring-1 focus:ring-[#3B7BFF] resize-none"
                      />
                    </div>

                    <Button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#3B7BFF] hover:bg-[#2563EB] text-white py-6 rounded-lg font-medium flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
