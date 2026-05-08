import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, FileSearch, ShieldCheck, Sparkles, UserCircle } from "lucide-react";

const slides = [
  {
    kicker: "NephroNet Intelligence",
    title: "Kidney care, clarified by AI.",
    subtitle: "A modern clinical assistant for report analysis, medication risk review, and patient-friendly CKD education.",
    image: "/NephroNet_banner.png",
  },
  {
    kicker: "NephroNet Identity",
    title: "Built around the original NephroNet banner.",
    subtitle: "The provided visual system stays front and center while the interface around it becomes cleaner and more useful.",
    image: "/heading.png",
  },
  {
    kicker: "Risk Detection",
    title: "Spot CKD signals before they hide.",
    subtitle: "The Sifter analyzes lab patterns and converts dense reports into readable risk context.",
    image: "/banner1.png",
  },
  {
    kicker: "Multi-Agent Analysis",
    title: "Three specialist agents. One clean answer.",
    subtitle: "Risk assessment, drug safety, and education work together in a guided review flow.",
    image: "/banner2.png",
  },
  {
    kicker: "Patient Centered",
    title: "Personalized guidance that feels human.",
    subtitle: "Tailored recommendations adapt to age, culture, and health literacy without overwhelming the patient.",
    image: "/banner3.png",
  },
];

const HeroCarousel = ({ scrollToSection, onAccountClick }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const current = slides[currentSlide];

  const stats = useMemo(
    () => [
      { label: "AI agents", value: "3" },
      { label: "report workflow", value: "PDF" },
      { label: "review mode", value: "guided" },
    ],
    []
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

  return (
    <section className="hero-stage">
      <button className="hero-account" onClick={onAccountClick} aria-label="Open account">
        <UserCircle size={22} />
        <span>Account</span>
      </button>

      <AnimatePresence mode="wait">
        <motion.img
          key={current.image}
          src={current.image}
          alt={current.title}
          className="hero-image"
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </AnimatePresence>

      <div className="hero-overlay" />
      <div className="hero-scan" />

      <div className="hero-content">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="hero-copy"
        >
          <div className="hero-kicker">
            <Sparkles size={16} />
            <span>{current.kicker}</span>
          </div>
          <h1>{current.title}</h1>
          <p>{current.subtitle}</p>

          <div className="hero-actions">
            <button className="primary-btn" onClick={() => scrollToSection?.("upload")}>
              <FileSearch size={18} />
              Analyze a report
            </button>
            <button className="secondary-btn" onClick={() => scrollToSection?.("about")}>
              <ShieldCheck size={18} />
              Learn CKD basics
            </button>
          </div>
        </motion.div>

        <motion.div
          className="hero-console"
          initial={{ opacity: 0, x: 28 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <div className="console-topline">
            <span />
            <span />
            <span />
          </div>
          <div className="console-title">Live Clinical Pipeline</div>
          <div className="console-grid">
            {stats.map((stat) => (
              <div key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
          <div className="signal-stack">
            <span style={{ width: "92%" }} />
            <span style={{ width: "68%" }} />
            <span style={{ width: "81%" }} />
          </div>
        </motion.div>
      </div>

      <div className="hero-controls">
        <button className="hero-ctrl" onClick={prevSlide} aria-label="Previous banner">
          <ChevronLeft size={21} />
        </button>
        <div className="hero-dots" aria-label="Choose banner">
          {slides.map((slide, index) => (
            <button
              key={slide.image}
              onClick={() => setCurrentSlide(index)}
              className={currentSlide === index ? "is-active" : ""}
              aria-label={`Show ${slide.kicker}`}
            />
          ))}
        </div>
        <button className="hero-ctrl" onClick={nextSlide} aria-label="Next banner">
          <ChevronRight size={21} />
        </button>
      </div>

      <style>{`
        .hero-stage {
          position: relative;
          min-height: 100svh;
          overflow: hidden;
          isolation: isolate;
          background: #211829;
        }

        .hero-account {
          position: absolute;
          z-index: 8;
          top: 1.1rem;
          right: clamp(1rem, 4vw, 3rem);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.24);
          border-radius: 999px;
          padding: 0.72rem 0.95rem;
          color: white;
          background: rgba(255, 255, 255, 0.13);
          box-shadow: 0 16px 35px rgba(0, 0, 0, 0.18);
          font-weight: 850;
          backdrop-filter: blur(16px);
          transition: transform 180ms ease, background 180ms ease;
        }

        .hero-account:hover {
          background: rgba(255, 255, 255, 0.22);
          transform: translateY(-2px);
        }

        .hero-image {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          z-index: -3;
        }

        .hero-overlay {
          position: absolute;
          inset: 0;
          z-index: -2;
          background:
            linear-gradient(90deg, rgba(33, 24, 41, 0.78) 0%, rgba(78, 59, 83, 0.46) 46%, rgba(78, 59, 83, 0.08) 100%),
            radial-gradient(circle at 72% 22%, rgba(204, 195, 235, 0.12), transparent 26rem);
        }

        .hero-scan {
          position: absolute;
          inset: 0;
          z-index: -1;
          background-image:
            linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 72px 72px;
          mask-image: linear-gradient(90deg, black, transparent 72%);
        }

        .hero-scan::after {
          content: "";
          position: absolute;
          top: 0;
          bottom: 0;
          width: 34%;
          background: linear-gradient(90deg, transparent, rgba(204, 195, 235, 0.18), transparent);
          animation: scan 6s linear infinite;
        }

        .hero-content {
          display: grid;
          grid-template-columns: minmax(0, 1.12fr) minmax(18rem, 0.58fr);
          align-items: center;
          gap: clamp(2rem, 5vw, 5rem);
          width: min(1180px, calc(100% - 2rem));
          min-height: 100svh;
          margin: 0 auto;
          padding: clamp(6rem, 10vw, 8rem) 0 7rem;
        }

        .hero-copy {
          max-width: 760px;
        }

        .hero-kicker {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          margin-bottom: 1.15rem;
          padding: 0.5rem 0.72rem;
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 999px;
          color: rgba(255, 255, 255, 0.82);
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(16px);
          font-size: 0.78rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .hero-copy h1 {
          margin: 0;
          max-width: 850px;
          color: white;
          font-size: clamp(3.5rem, 8vw, 7.8rem);
          font-weight: 900;
          letter-spacing: 0;
          line-height: 0.88;
        }

        .hero-copy p {
          max-width: 660px;
          margin: 1.3rem 0 0;
          color: rgba(255, 255, 255, 0.78);
          font-size: clamp(1.05rem, 1.8vw, 1.35rem);
          line-height: 1.7;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.85rem;
          margin-top: 2rem;
        }

        .hero-console {
          position: relative;
          align-self: end;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          padding: 1rem;
          color: white;
          background: rgba(255, 255, 255, 0.1);
          box-shadow: 0 34px 90px rgba(0, 0, 0, 0.34);
          backdrop-filter: blur(20px);
        }

        .console-topline {
          display: flex;
          gap: 0.35rem;
          margin-bottom: 1.15rem;
        }

        .console-topline span {
          width: 0.55rem;
          height: 0.55rem;
          border-radius: 50%;
          background: var(--lavender);
        }

        .console-title {
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .console-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.6rem;
          margin: 1rem 0;
        }

        .console-grid div {
          padding: 0.8rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.08);
        }

        .console-grid strong,
        .console-grid span {
          display: block;
        }

        .console-grid strong {
          font-size: 1.5rem;
          line-height: 1;
        }

        .console-grid span {
          margin-top: 0.35rem;
          color: rgba(255, 255, 255, 0.64);
          font-size: 0.72rem;
        }

        .signal-stack {
          display: grid;
          gap: 0.55rem;
        }

        .signal-stack span {
          height: 0.52rem;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--aqua), var(--lavender), var(--rose));
          animation: pulse-ring 2.6s ease-in-out infinite;
        }

        .hero-controls {
          position: absolute;
          left: 50%;
          bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          transform: translateX(-50%);
          padding: 0.5rem;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 999px;
          background: rgba(33, 24, 41, 0.46);
          backdrop-filter: blur(18px);
        }

        .hero-ctrl {
          width: 2.55rem;
          height: 2.55rem;
          border-radius: 50%;
          color: white;
          background: rgba(255, 255, 255, 0.14);
          transition: background 180ms ease, transform 180ms ease;
        }

        .hero-ctrl:hover {
          background: rgba(255, 255, 255, 0.24);
        }

        .hero-dots {
          display: flex;
          gap: 0.45rem;
        }

        .hero-dots button {
          width: 0.56rem;
          height: 0.56rem;
          border: 0;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.38);
          transition: width 180ms ease, background 180ms ease;
        }

        .hero-dots button.is-active {
          width: 2.2rem;
          background: white;
        }

        @media (max-width: 900px) {
          .hero-content {
            grid-template-columns: 1fr;
            align-content: center;
          }

          .hero-console {
            display: none;
          }
        }

        @media (max-width: 640px) {
          .hero-account span {
            display: none;
          }

          .hero-stage {
            min-height: 92svh;
          }

          .hero-content {
            min-height: 92svh;
          }
        }
      `}</style>
    </section>
  );
};

export default HeroCarousel;
