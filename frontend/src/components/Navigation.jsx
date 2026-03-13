import React, { useState, useEffect, useRef } from 'react';

const Navigation = ({ scrollToSection, activeSection }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About CKD' },
    { id: 'upload', label: 'Analyze' },
    { id: 'team', label: 'Team' }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 h-16 shadow-2xl z-50 border-b transition-all duration-300 ${
      isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : ''
    }`} style={{ backgroundColor: isScrolled ? 'rgba(204, 195, 235, 0.95)' : '#CCC3EB' }}>
      <div className="h-full max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex justify-between items-center">
          {/* Left side - Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: '#4E3B53' }}></div>
            </div>
            <span className={`text-xl font-bold tracking-wider transition-colors duration-300 ${
              isScrolled ? 'text-purple-800' : 'text-white'
            }`}>
              NEPHRONET
            </span>
          </div>
          
          {/* Right side - Navigation Links */}
          <div className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`transition-all duration-300 font-medium px-3 py-1 rounded-lg ${
                  activeSection === item.id 
                    ? 'bg-purple-600 text-white' 
                    : isScrolled 
                      ? 'text-purple-800 hover:bg-purple-100' 
                      : 'text-white hover:bg-white/10'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-1" style={{ background: 'linear-gradient(90deg, #4E3B53, #CCC3EB)' }}></div>
    </nav>
  );
};

export default Navigation;
