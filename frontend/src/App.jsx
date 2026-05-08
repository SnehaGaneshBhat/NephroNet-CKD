import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Activity, Brain, MessageSquare, ShieldCheck, Sparkles, UserCircle, Users } from "lucide-react";
import HeroCarousel from "./components/HeroCarousel";
import AboutCKD from "./components/AboutCKD";
import ReportAnalysis from "./components/ReportAnalysis";
import ResultsView from "./components/ResultsView";
import MeetTheTeam from "./components/MeetTheTeam";
import EndSection from "./components/EndSection";
import Chatbot from "./components/Chatbot";
import AuthPage from "./components/AuthPage";
import AccountPage from "./components/AccountPage";

const navItems = [
  { id: "about", label: "About", icon: Brain },
  { id: "upload", label: "Analyze", icon: Activity },
  { id: "team", label: "Team", icon: Users },
  { id: "end", label: "Feedback", icon: MessageSquare },
];

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const getViewFromHash = () => {
    const hash = window.location.hash.replace("#", "");
    if (hash === "login" || hash === "signup") return "auth";
    if (hash === "account") return "account";
    return "app";
  };

  const [activeView, setActiveView] = useState(getViewFromHash);
  const [accountUser, setAccountUser] = useState(null);

  const homeRef = useRef(null);
  const aboutRef = useRef(null);
  const uploadRef = useRef(null);
  const resultsRef = useRef(null);
  const teamRef = useRef(null);
  const endRef = useRef(null);

  const refs = {
    home: homeRef,
    about: aboutRef,
    upload: uploadRef,
    results: resultsRef,
    team: teamRef,
    end: endRef,
  };

  useEffect(() => {
    const sections = [
      { id: "home", ref: homeRef },
      { id: "about", ref: aboutRef },
      { id: "upload", ref: uploadRef },
      { id: "team", ref: teamRef },
      { id: "end", ref: endRef },
    ];

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.dataset?.section) {
          setActiveSection(visible.target.dataset.section);
        }
      },
      { threshold: [0.25, 0.4, 0.6], rootMargin: "-12% 0px -45% 0px" }
    );

    sections.forEach(({ ref }) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleHashChange = () => setActiveView(getViewFromHash());
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const navigateView = (view) => {
    if (view === "app") {
      window.history.pushState("", document.title, window.location.pathname + window.location.search);
      setActiveView("app");
      return;
    }

    window.location.hash = view === "auth" ? "login" : view;
    setActiveView(view);
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    refs[section]?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleUpload = async (patientProfile) => {
    if (!file) {
      alert("Please upload a PDF first.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("age", patientProfile.age);
    formData.append("culture", patientProfile.culture);
    formData.append("literacy", patientProfile.literacy);

    try {
      const res = await axios.post("http://127.0.0.1:8000/analyze-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data);
      setShowResults(true);
      setTimeout(() => scrollToSection("results"), 120);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Error analyzing report. Please make sure the API server is running.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAnalyzeAnother = () => {
    setShowResults(false);
    setResults(null);
    setFile(null);
    scrollToSection("upload");
  };

  const openAccount = () => {
    navigateView(accountUser ? "account" : "auth");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (activeView === "auth") {
    return (
      <AuthPage
        initialMode={window.location.hash === "#signup" ? "signup" : "login"}
        onBack={() => navigateView("app")}
        onAuthenticated={(user) => {
          setAccountUser(user);
          navigateView("account");
        }}
      />
    );
  }

  if (activeView === "account") {
    return (
      <AccountPage
        user={accountUser}
        onBack={() => navigateView("app")}
        onLogout={() => {
          setAccountUser(null);
          navigateView("auth");
        }}
      />
    );
  }

  return (
    <div className="app-shell min-h-screen">
      <section ref={homeRef} data-section="home" className="relative">
        <HeroCarousel scrollToSection={scrollToSection} onAccountClick={openAccount} />
      </section>

      <nav className="sticky-nav" aria-label="Primary navigation">
        <button className="brand-mark" onClick={() => scrollToSection("home")}>
          <span className="brand-orbit" />
          <span>NephroNet</span>
        </button>

        <div className="nav-actions">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => scrollToSection(id)}
              className={`nav-pill ${activeSection === id ? "is-active" : ""}`}
            >
              <Icon size={16} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <div className="nav-status">
          <ShieldCheck size={16} />
          <span>AI clinical preview</span>
        </div>

        <button className="account-button" onClick={openAccount} aria-label="Open account">
          <UserCircle size={22} />
        </button>
      </nav>

      <main>
        <section ref={aboutRef} data-section="about" className="page-band">
          <AboutCKD />
        </section>

        <section ref={uploadRef} data-section="upload" className="page-band page-band-dark">
          <ReportAnalysis
            onUpload={handleUpload}
            isUploading={isUploading}
            file={file}
            setFile={setFile}
          />
        </section>

        {showResults && results && (
          <section ref={resultsRef} data-section="results" className="page-band">
            <ResultsView results={results} onAnalyzeAnother={handleAnalyzeAnother} />
          </section>
        )}

        <section ref={teamRef} data-section="team" className="page-band">
          <MeetTheTeam />
        </section>

        <section ref={endRef} data-section="end">
          <EndSection />
        </section>
      </main>

      <div className="ambient-chip" aria-hidden="true">
        <Sparkles size={15} />
        <span>multi-agent CKD intelligence</span>
      </div>

      <Chatbot />
    </div>
  );
}

export default App;
