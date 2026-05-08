import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2, HeartPulse, Microscope, Stethoscope } from "lucide-react";

const ckdCards = [
  {
    icon: Microscope,
    title: "What is CKD?",
    text: "Chronic Kidney Disease is a gradual loss of kidney filtering function. It can stay quiet for years, which makes routine screening especially important.",
  },
  {
    icon: HeartPulse,
    title: "Common causes",
    text: "Diabetes and high blood pressure are the leading drivers. Genetics, autoimmune disease, and long-term medication exposure can also contribute.",
  },
  {
    icon: CheckCircle2,
    title: "Early detection",
    text: "Blood pressure checks, urine albumin, creatinine, and eGFR can reveal risk while there is still time to slow progression.",
  },
  {
    icon: AlertCircle,
    title: "Warning signs",
    text: "Fatigue, swelling, urination changes, and persistent hypertension can appear later. Many patients have no early symptoms.",
  },
];

const metrics = [
  ["eGFR", "kidney filtration"],
  ["ACR", "urine protein signal"],
  ["BP", "pressure control"],
];

const AboutCKD = () => {
  return (
    <div className="section-wrap about-layout">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.55 }}
      >
        <span className="eyebrow">
          <Stethoscope size={16} />
          CKD foundation
        </span>
        <h2 className="section-title">Complex kidney signals, made easier to read.</h2>
        <p className="section-copy">
          NephroNet keeps the medical depth visible while stripping away the noise. The experience is designed for quick
          scanning first, then deeper understanding when a patient or clinician needs it.
        </p>

        <div className="metric-strip">
          {metrics.map(([value, label]) => (
            <div key={value}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      <div className="ckd-grid">
        {ckdCards.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.article
              key={item.title}
              className="surface-card ckd-card"
              initial={{ opacity: 0, y: 26 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.45, delay: index * 0.08 }}
              whileHover={{ y: -6 }}
            >
              <div className="card-icon">
                <Icon size={24} />
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </motion.article>
          );
        })}
      </div>

      <style>{`
        .about-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.84fr) minmax(0, 1.16fr);
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
        }

        .metric-strip {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.7rem;
          margin-top: 2rem;
        }

        .metric-strip div {
          padding: 1rem;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.72);
        }

        .metric-strip strong,
        .metric-strip span {
          display: block;
        }

        .metric-strip strong {
          color: var(--plum);
          font-size: 1.5rem;
          line-height: 1;
        }

        .metric-strip span {
          margin-top: 0.35rem;
          color: var(--muted);
          font-size: 0.78rem;
          font-weight: 700;
        }

        .ckd-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .ckd-card {
          min-height: 15.5rem;
          padding: 1.35rem;
          transition: box-shadow 180ms ease;
        }

        .ckd-card:hover {
          box-shadow: 0 30px 90px rgba(78, 59, 83, 0.2);
        }

        .card-icon {
          display: inline-flex;
          width: 3rem;
          height: 3rem;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
          border-radius: 8px;
          color: white;
          background: linear-gradient(135deg, var(--plum), var(--plum-2), var(--lavender));
          box-shadow: 0 16px 35px rgba(78, 59, 83, 0.22);
        }

        .ckd-card h3 {
          margin: 0 0 0.65rem;
          color: var(--ink);
          font-size: 1.1rem;
          font-weight: 850;
        }

        .ckd-card p {
          margin: 0;
          color: var(--muted);
          line-height: 1.65;
        }

        @media (max-width: 900px) {
          .about-layout,
          .ckd-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .metric-strip {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutCKD;
