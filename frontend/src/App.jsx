import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import Navigation from './components/Navigation';
import HeroCarousel from './components/HeroCarousel';
import AboutCKD from './components/AboutCKD';
import ReportAnalysis from './components/ReportAnalysis';
import ResultsView from './components/ResultsView';
import MeetTheTeam from './components/MeetTheTeam';
import EndSection from './components/EndSection';
import Chatbot from './components/Chatbot';

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [visibleSections, setVisibleSections] = useState(new Set(['home']));

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const uploadRef = useRef(null);
  const resultsRef = useRef(null);
  const teamRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    const observers = [];
    
    const sectionRefs = [
      { id: 'home', ref: homeRef },
      { id: 'about', ref: aboutRef },
      { id: 'upload', ref: uploadRef },
      { id: 'results', ref: resultsRef },
      { id: 'team', ref: teamRef }
    ];

    const createObserver = (sectionId) => {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              setVisibleSections(prev => new Set([...prev, sectionId]));
            } else {
              setVisibleSections(prev => {
                const newSet = new Set(prev);
                newSet.delete(sectionId);
                return newSet;
              });
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '-50px 0px -50px 0px'
        }
      );

      if (sectionRefs.find(s => s.id === sectionId)?.ref.current) {
        observer.observe(sectionRefs.find(s => s.id === sectionId).ref.current);
      }

      return observer;
    };

    // Create observers for each section
    sectionRefs.forEach(section => {
      observers.push(createObserver(section.id));
    });

    // Handle active section based on scroll position
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100;
      
      for (const section of sectionRefs) {
        if (section.ref.current) {
          const { offsetTop } = section.ref.current;
          if (scrollPosition >= offsetTop) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      observers.forEach(observer => observer.disconnect());
    };
  }, []);

  const scrollToSection = (section) => {
    const refs = {
      home: homeRef,
      about: aboutRef,
      upload: uploadRef,
      results: resultsRef,
      team: teamRef,
      end: endRef
    };
    
    setActiveSection(section);
    if (section === 'end') {
      refs[section]?.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      refs[section]?.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleUpload = async () => {
    if (!file) return alert("Please upload a PDF first!");

    console.log('Starting upload with file:', file.name);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("age", 45);
    formData.append("culture", "Indian");
    formData.append("literacy", "basic");

    try {
      console.log('Sending request to API...');
      const res = await axios.post("http://127.0.0.1:8000/analyze-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log('API response received:', res.data);
      setResults(res.data);
      setShowResults(true);
      setTimeout(() => scrollToSection('results'), 100);
    } catch (err) {
      console.error('Upload error:', err);
      alert("Error analyzing report");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setShowResults(false);
    setResults(null);
    setFile(null);
    scrollToSection('upload');
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Hero Carousel - Full Screen Section */}
      <section ref={homeRef} className="transition-all duration-700">
        <HeroCarousel scrollToSection={scrollToSection} />
      </section>

      {/* Navigation Bar */}
      <div className="w-full py-3 px-4" style={{ backgroundColor: '#4E3B53' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-8">
            <button
              onClick={() => scrollToSection('about')}
              className="px-4 py-2 font-medium rounded-lg transition-all duration-300 text-sm md:text-base"
              style={{ 
                fontFamily: 'Inter, system-ui, sans-serif',
                backgroundColor: '#E6E6FA',
                color: '#4B0082',
                border: '1px solid #DDA0DD'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#DDA0DD';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#E6E6FA';
              }}
            >
              About CKD
            </button>
            <button
              onClick={() => scrollToSection('upload')}
              className="px-4 py-2 font-medium rounded-lg transition-all duration-300 text-sm md:text-base"
              style={{ 
                fontFamily: 'Inter, system-ui, sans-serif',
                backgroundColor: '#E6E6FA',
                color: '#4B0082',
                border: '1px solid #DDA0DD'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#DDA0DD';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#E6E6FA';
              }}
            >
              Analyze Reports
            </button>
            <button
              onClick={() => scrollToSection('team')}
              className="px-4 py-2 font-medium rounded-lg transition-all duration-300 text-sm md:text-base"
              style={{ 
                fontFamily: 'Inter, system-ui, sans-serif',
                backgroundColor: '#E6E6FA',
                color: '#4B0082',
                border: '1px solid #DDA0DD'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#DDA0DD';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#E6E6FA';
              }}
            >
              The Team
            </button>
            <button
              onClick={() => scrollToSection('end')}
              className="px-4 py-2 font-medium rounded-lg transition-all duration-300 text-sm md:text-base"
              style={{ 
                fontFamily: 'Inter, system-ui, sans-serif',
                backgroundColor: '#E6E6FA',
                color: '#4B0082',
                border: '1px solid #DDA0DD'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#DDA0DD';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#E6E6FA';
              }}
            >
              Feedback
            </button>
          </div>
        </div>
      </div>

      {/* About CKD Section - Slides in from right, replaces above content */}
      <section 
        ref={aboutRef} 
        className={`transition-all duration-700 border-b-4 ${
          visibleSections.has('about') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        style={{ borderColor: '#4E3B53' }}
      >
        <AboutCKD />
      </section>

      {/* Report Analysis Section - Slides in from right, replaces above content */}
      <section 
        ref={uploadRef} 
        className={`transition-all duration-700 border-b-4 ${
          visibleSections.has('upload') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        style={{ borderColor: '#4E3B53' }}
      >
        <ReportAnalysis 
          onUpload={handleUpload}
          isUploading={isUploading}
          file={file}
          setFile={setFile}
        />
      </section>

      {/* Results Section - Slides in from right, replaces above content */}
      {showResults && results && (
        <section 
          ref={resultsRef} 
          className={`transition-all duration-700 border-b-4 opacity-100 translate-y-0`}
          style={{ borderColor: '#4E3B53' }}
        >
          <ResultsView 
            results={results}
            onAnalyzeAnother={handleAnalyzeAnother}
          />
        </section>
      )}

      {/* Team Section - Slides in from right, replaces above content */}
      <section 
        ref={teamRef} 
        className={`transition-all duration-700 border-b-4 ${
          visibleSections.has('team') 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-full pointer-events-none'
        }`}
        style={{ borderColor: '#4E3B53' }}
      >
        <MeetTheTeam style={{ width: '100%' }} />
      </section>

      {/* End Section - Always Visible with transition */}
      <section ref={endRef} className={`transition-all duration-700 border-t-4 ${
        visibleSections.has('team') 
          ? 'opacity-100 translate-y-0' 
          : 'opacity-0 translate-y-10 pointer-events-none'
      }`} style={{ borderTopColor: '#4E3B53' }}>
        <EndSection />
      </section>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}

export default App;