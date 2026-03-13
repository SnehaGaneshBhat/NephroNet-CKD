import React from 'react';

const HeroBanner = ({ scrollToSection }) => {
  const handleNavClick = (section) => {
    scrollToSection?.(section);
  };

  return (
    <div className="w-full relative" style={{ backgroundColor: '#CCC3EB' }}>
      <img
        src="/NephroNet_banner.png"
        alt="NephroNet Banner"
        className="w-full h-10 object-cover transition-opacity duration-500 hover:opacity-90"
      />
      
      {/* Navigation Section */}
      <div className="w-full py-3 px-4" style={{ backgroundColor: '#4E3B53' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <button
              onClick={() => handleNavClick('about')}
              className="px-4 py-2 text-white font-medium hover:bg-white/20 rounded-lg transition-all duration-300 text-sm md:text-base"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              About CKD
            </button>
            <button
              onClick={() => handleNavClick('upload')}
              className="px-4 py-2 text-white font-medium hover:bg-white/20 rounded-lg transition-all duration-300 text-sm md:text-base"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Analyze Reports
            </button>
            <button
              onClick={() => handleNavClick('team')}
              className="px-4 py-2 text-white font-medium hover:bg-white/20 rounded-lg transition-all duration-300 text-sm md:text-base"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              The Team
            </button>
            <button
              onClick={() => handleNavClick('end')}
              className="px-4 py-2 text-white font-medium hover:bg-white/20 rounded-lg transition-all duration-300 text-sm md:text-base"
              style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
            >
              Feedback
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;