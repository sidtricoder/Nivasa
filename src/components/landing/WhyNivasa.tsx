import React from 'react';
import { motion } from 'framer-motion';

// Spring animation config
const springConfig = { stiffness: 300, damping: 30 };

const features = [
  {
    title: 'Supercharge Your Home\'s Sale with Nivasa!',
    description: 'List your property on Nivasa and watch the magic happen. Your listing receives maximum exposure, sparking interest which leads to the best offers.',
  },
  {
    title: 'Save Thousands in Commission!',
    description: 'Nivasa does not charge sellers ANY commissions or fees. A typical seller will save ₹2,70,000! (based on a ₹90,00,000 sales price and a 3% real estate commission).',
  },
  {
    title: 'Optimize Your Time, Minimize Your Effort!',
    description: 'Easily craft a tailored, all-inclusive listing complete with photos, videos, and detailed property information in under 5 minutes. Interested buyers can conveniently reach out to you at YOUR convenience without the need to disclose your personal contact information.',
  },
];

const WhyNivasa: React.FC = () => {
  return (
    <section className="py-24 lg:py-32 bg-white">
      <div className="container max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16 lg:mb-20"
        >
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#2B2F36] leading-tight">
            Sell your property for the highest possible price
            <br />
            and{' '}
            <span className="text-[#3B7BFF] italic">avoid paying any commissions.</span>
          </h2>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left: Pill-shaped Image Grid */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex gap-5 justify-center lg:justify-start items-start"
          >
            {/* First Pill - TALL (Left) - House */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, type: 'spring', ...springConfig }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="relative w-44 md:w-52 h-[380px] md:h-[520px] rounded-[100px] overflow-hidden shadow-xl flex-shrink-0"
            >
              <img 
                src="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&h=900&fit=crop"
                alt="Beautiful modern home"
                className="w-full h-full object-cover"
              />
            </motion.div>

            {/* Right Column - Two stacked images */}
            <div className="flex flex-col gap-5 pt-4">
              {/* Second Pill - LONG (Top Right) - Family */}
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35, type: 'spring', ...springConfig }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative w-36 md:w-44 h-52 md:h-[300px] rounded-[80px] overflow-hidden shadow-xl"
              >
                <img 
                  src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=500&h=600&fit=crop"
                  alt="Happy family"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
              </motion.div>

              {/* Third - Oval (Bottom Right) - Key */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: 'spring', ...springConfig }}
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="relative w-32 md:w-40 h-40 md:h-48 rounded-[60px] overflow-hidden shadow-xl ml-2"
              >
                <img 
                  src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=400&h=500&fit=crop"
                  alt="House key"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Feature Cards - Simple Gray Boxes */}
          <div className="space-y-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ 
                  delay: 0.2 + index * 0.15, 
                  type: 'spring', 
                  ...springConfig 
                }}
                className="p-6 bg-[#F5F5F5] rounded-xl"
              >
                <h3 className="text-lg md:text-xl font-semibold text-[#2B2F36] mb-3">
                  {feature.title}
                </h3>
                <p className="text-[#6B7280] text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyNivasa;
