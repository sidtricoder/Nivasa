import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const faqs = [
  {
    question: 'Is Nivasa free to use?',
    answer: 'Yes! Nivasa is completely free for buyers. For sellers, we offer zero brokerage listings which means you save thousands in commission fees that you would normally pay to traditional brokers.',
  },
  {
    question: 'How long does the sales process take?',
    answer: 'The timeline varies based on market conditions and property type. On average, properties listed on Nivasa receive inquiries within the first week. Most sales are completed within 30-90 days from listing.',
  },
  {
    question: 'Is listing on your platform free?',
    answer: 'Absolutely! Listing your property on Nivasa is 100% free. We believe in making property transactions accessible to everyone without hidden fees or charges.',
  },
  {
    question: 'How do I know if a property is verified?',
    answer: 'All properties on Nivasa go through our verification process. Look for the "Verified" badge on listings. We verify ownership documents, property details, and seller authenticity.',
  },
  {
    question: 'Can I schedule property visits through Nivasa?',
    answer: 'Yes! You can directly connect with property owners through our platform to schedule visits at your convenience. No middlemen involved.',
  },
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 lg:py-28 bg-[#F5F5F5]">
      <div className="container max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Side - Title and CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-semibold text-[#2B2F36] mb-4">
              Frequently Asked
              <br />
              Questions
            </h2>
            <p className="text-[#6B7280] mb-8">
              Can't find an answer to your question? Contact us,
              <br />
              we will be happy to answer your questions.
            </p>
            <Link to="/contact">
              <Button 
                className="bg-[#3B7BFF] hover:bg-[#2563EB] text-white rounded-full px-6 py-5"
              >
                Ask Questions
              </Button>
            </Link>
          </motion.div>

          {/* Right Side - FAQ Accordion */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-3"
          >
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="text-[#2B2F36] font-medium pr-4">
                    {faq.question.includes('Nivasa') ? (
                      <>
                        {faq.question.split('Nivasa')[0]}
                        <span className="text-[#F97316]">Nivasa</span>
                        {faq.question.split('Nivasa')[1]}
                      </>
                    ) : faq.question.includes('sales') ? (
                      <>
                        {faq.question.split('sales')[0]}
                        <span className="text-[#F97316]">sales</span>
                        {faq.question.split('sales')[1]}
                      </>
                    ) : faq.question.includes('platform') ? (
                      <>
                        {faq.question.split('platform')[0]}
                        <span className="text-[#F97316]">platform</span>
                        {faq.question.split('platform')[1]}
                      </>
                    ) : (
                      faq.question
                    )}
                  </span>
                  <motion.div
                    animate={{ rotate: openIndex === index ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex-shrink-0"
                  >
                    <ChevronDown className="h-5 w-5 text-[#6B7280]" />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {openIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-[#6B7280] text-sm leading-relaxed">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
