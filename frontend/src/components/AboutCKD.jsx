import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, Heart, CheckCircle } from 'lucide-react';

const AboutCKD = () => {
  const chatItems = [
    {
      icon: <AlertCircle className="h-8 w-8 text-white" />,
      title: "What is CKD?",
      text: "Chronic Kidney Disease is a progressive condition where the kidneys gradually lose their filtering ability over time. It affects millions worldwide and often goes undetected until advanced stages."
    },
    {
      icon: <Heart className="h-8 w-8 text-white" />,
      title: "Common Causes",
      text: "Diabetes and high blood pressure are the leading causes of CKD. Other factors include genetics, autoimmune diseases, and prolonged use of certain medications."
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-white" />,
      title: "Early Detection",
      text: "Regular screening through blood tests, urine tests, and blood pressure monitoring can help detect CKD early when interventions are most effective."
    },
    {
      icon: <AlertCircle className="h-8 w-8 text-white" />,
      title: "Symptoms",
      text: "Common symptoms include fatigue, swelling in hands/feet, changes in urination, and high blood pressure. Many people experience no symptoms until later stages."
    },
    {
      icon: <Heart className="h-8 w-8 text-white" />,
      title: "Risk Factors",
      text: "Age over 60, family history, diabetes, high blood pressure, and cardiovascular disease increase CKD risk. Regular monitoring is crucial for at-risk individuals."
    }
  ];

  return (
    <section className="py-20 px-4 relative w-full" style={{ minHeight: '800px' }}>
      {/* Plum backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-950 via-purple-900 to-pink-950 opacity-90"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ fontFamily: 'Times New Roman, serif' }}>
            Understanding Chronic Kidney Disease
          </h2>
          <p className="text-lg text-white max-w-2xl mx-auto font-light" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Comprehensive insights into CKD, its causes, symptoms, and importance of early detection through regular screening
          </p>
        </motion.div>

        {/* Chat bubbles */}
        <div className="relative max-w-3xl mx-auto px-8" style={{ height: '700px' }}>
          {chatItems.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -15 : 15 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              viewport={{ once: true, margin: "-100px" }}
              className="absolute"
              style={{
                left: i % 2 === 0 ? '25%' : 'auto',
                right: i % 2 === 0 ? 'auto' : '25%',
                top: `${i * 130}px`
              }}
            >
              <div className="bg-[#E6E6FA] rounded-2xl shadow-2xl p-5 w-[280px] md:w-[380px] relative flex items-start space-x-3">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-semibold text-purple-900 mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
                    {item.title}
                  </h3>
                  <p className="text-white text-sm leading-relaxed" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
                    {item.text}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutCKD;