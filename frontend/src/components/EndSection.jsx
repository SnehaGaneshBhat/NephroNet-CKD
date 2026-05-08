import React, { useState } from "react";
import { HeartPulse, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";

const EndSection = () => {
  const [feedbackText, setFeedbackText] = useState("");

  const submitFeedback = () => {
    if (!feedbackText.trim()) return;
    console.log("Feedback submitted:", feedbackText);
    setFeedbackText("");
    alert("Thank you for your feedback.");
  };

  return (
    <footer className="footer-shell">
      <div className="section-wrap footer-layout">
        <div className="footer-brand">
          <div className="footer-logo">
            <HeartPulse size={28} />
            <span>NephroNet</span>
          </div>
          <p>AI-powered CKD report analysis for clearer, calmer kidney care conversations.</p>
        </div>

        <div className="footer-grid">
          <div className="footer-card">
            <h3>
              <Mail size={18} />
              Contact
            </h3>
            <p>
              <Mail size={16} />
              contact@nephronet.com
            </p>
            <p>
              <Phone size={16} />
              +1 (555) 123-4567
            </p>
            <p>
              <MapPin size={16} />
              123 Medical Center Dr, Boston, MA
            </p>
          </div>

          <div className="footer-card feedback-card">
            <h3>
              <MessageSquare size={18} />
              Feedback
            </h3>
            <textarea
              value={feedbackText}
              onChange={(event) => setFeedbackText(event.target.value)}
              placeholder="Share your thoughts..."
            />
            <button className="primary-btn" onClick={submitFeedback}>
              <Send size={16} />
              Submit
            </button>
          </div>
        </div>

        <div className="footer-bottom">
          <span>Copyright 2026 NephroNet. Informational use only.</span>
          <div>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">Support</a>
          </div>
        </div>
      </div>

      <style>{`
        .footer-shell {
          color: white;
          background:
            radial-gradient(circle at 20% 20%, rgba(204, 195, 235, 0.18), transparent 22rem),
            linear-gradient(135deg, #211829, var(--plum) 58%, #6f4d76);
        }

        .footer-layout {
          display: grid;
          gap: 2rem;
          padding-bottom: 2rem;
        }

        .footer-brand {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }

        .footer-logo {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          font-size: clamp(1.8rem, 4vw, 3rem);
          font-weight: 900;
          letter-spacing: 0;
          text-transform: none;
        }

        .footer-brand p {
          max-width: 440px;
          margin: 0;
          color: rgba(255, 255, 255, 0.72);
          line-height: 1.65;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 1rem;
        }

        .footer-card {
          border: 1px solid rgba(255, 255, 255, 0.16);
          border-radius: 8px;
          padding: 1.2rem;
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(18px);
        }

        .footer-card h3,
        .footer-card p {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }

        .footer-card h3 {
          margin: 0 0 1rem;
          font-size: 1rem;
          font-weight: 900;
        }

        .footer-card p {
          margin: 0.7rem 0;
          color: rgba(255, 255, 255, 0.72);
        }

        .feedback-card {
          display: grid;
          gap: 0.8rem;
        }

        .feedback-card textarea {
          min-height: 7rem;
          resize: vertical;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          color: white;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.85rem;
          outline: none;
        }

        .feedback-card textarea::placeholder {
          color: rgba(255, 255, 255, 0.48);
        }

        .feedback-card textarea:focus {
          border-color: rgba(255, 255, 255, 0.65);
        }

        .feedback-card .primary-btn {
          justify-self: start;
        }

        .footer-bottom {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          color: rgba(255, 255, 255, 0.58);
          font-size: 0.86rem;
        }

        .footer-bottom div {
          display: flex;
          gap: 1rem;
        }

        .footer-bottom a {
          color: rgba(255, 255, 255, 0.72);
          text-decoration: none;
        }

        .footer-bottom a:hover {
          color: white;
        }

        @media (max-width: 800px) {
          .footer-brand,
          .footer-bottom {
            align-items: start;
            flex-direction: column;
          }

          .footer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </footer>
  );
};

export default EndSection;
