import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

const HeroCarousel = ({ scrollToSection }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      title: "NephroNet",
      subtitle: "Revolutionizing kidney care with AI-powered insights",
      image: "/heading.png"
    },
    {
      title: "Revolutionary CKD Care",
      subtitle: "AI-powered analysis for better kidney health outcomes",
      image: "/banner1.png"
    },
    {
      title: "Multi-Agent Intelligence",
      subtitle: "Comprehensive analysis through specialized AI agents",
      image: "/banner2.png"
    },
    {
      title: "Patient-Centric Approach",
      subtitle: "Personalized insights for better health decisions",
      image: "/banner3.png"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7000); // Increased from 5000ms to 7000ms (7 seconds)
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <div className="w-full">
      {/* Carousel Section */}
      <section className="relative min-h-screen w-screen overflow-hidden">
        {/* Background with neon gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 w-screen">
          {/* Tech grid pattern */}
          <div className="absolute inset-0 opacity-20 w-screen">
            <div className="h-full w-full" style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '100px 100px'
            }}></div>
          </div>
          
          {/* Animated neon glow */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-purple-600/20 blur-3xl w-screen"
            animate={{
              background: [
                'linear-gradient(45deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(147, 51, 234, 0.2) 100%)',
                'linear-gradient(90deg, rgba(236, 72, 153, 0.2) 0%, rgba(147, 51, 234, 0.2) 50%, rgba(236, 72, 153, 0.2) 100%)',
                'linear-gradient(135deg, rgba(147, 51, 234, 0.2) 0%, rgba(236, 72, 153, 0.2) 50%, rgba(147, 51, 234, 0.2) 100%)',
              ]
            }}
            transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
          />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center w-screen"
          >
            <div className="h-full w-full relative min-h-screen w-screen">
              {/* Banner Image */}
              <img 
                src={slides[currentSlide].image} 
                alt={slides[currentSlide].title}
                className="w-screen h-full object-cover min-h-screen"
                style={{ 
                  minHeight: '100vh',
                  width: '100vw',
                  objectFit: 'cover'
                }}
              />
              
              {/* Overlay with text content */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-900/80 via-purple-900/60 to-transparent flex items-center">
                <div className="text-left text-white px-4 md:px-16 max-w-4xl">
                  <motion.h1 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent drop-shadow-2xl"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  >
                    {slides[currentSlide].title}
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-xl md:text-2xl mb-8 text-purple-100 font-light"
                    style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>
                  {currentSlide > 0 && (
                    <motion.button
                      initial={{ y: 50, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      onClick={() => scrollToSection?.('upload')}
                      className="bg-white text-purple-600 px-8 py-4 rounded-full font-semibold hover:bg-purple-50 transition-colors inline-flex items-center space-x-2 shadow-2xl hover:shadow-purple-500/50"
                      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
                    >
                      <span>Get Started</span>
                      <ArrowRight className="h-5 w-5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel Controls - Now above navigation */}
        <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 z-30">
          <button
            onClick={prevSlide}
            className="bg-purple-300/80 backdrop-blur-md text-purple-900 p-4 rounded-full hover:bg-purple-400/90 transition-all border border-purple-400 hover:scale-110 shadow-lg"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          {/* Enhanced slide indicators */}
          <div className="flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-16 h-4 rounded-full transition-all duration-300 ${
                  currentSlide === index 
                    ? 'bg-gradient-to-r from-purple-400 to-pink-400 shadow-xl shadow-purple-500/50 scale-125 border-2 border-white' 
                    : 'bg-purple-300/50 hover:bg-purple-300/70 border border-purple-400'
                }`}
              />
            ))}
          </div>
          
          <button
            onClick={nextSlide}
            className="bg-purple-300/80 backdrop-blur-md text-purple-900 p-4 rounded-full hover:bg-purple-400/90 transition-all border border-purple-400 hover:scale-110 shadow-lg"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </section>
    </div>
  );
};

export default HeroCarousel;
