import React from "react";
import { motion } from "framer-motion";
import { AlertTriangle, BookOpen, CheckCircle2, Download, HeartPulse, Pill, RotateCcw, ShieldCheck, Utensils } from "lucide-react";

const riskLabel = (risk) => {
  if (risk === 0) return "Low";
  if (risk === 1) return "Mild";
  if (risk === 2) return "Moderate";
  return "High";
};

const normalizeBullets = (text = "") => text.replaceAll("â€¢", "-").split("\n").filter(Boolean);

const ResultsView = ({ results, onAnalyzeAnother }) => {
  const agentAFeedback = results.AgentA?.feedback || [];
  const drugResults = results.AgentB?.drug_results || [];
  const handout = results.AgentC?.handout || "";
  const foodPrescription = results.AgentC?.food_prescription || {};
  const foodsToAvoid = foodPrescription.avoid || [];
  const foodsToAdd = foodPrescription.add || [];
  const lifestyleChanges = results.AgentC?.lifestyle_changes || [];
  const personalizationNotes = results.AgentC?.personalization_notes || [];
  const fallbackHandout =
    handout.includes("Error generating narrative") || handout.includes("404 models") || !handout;
  const hasStructuredAgentC = foodsToAvoid.length || foodsToAdd.length || lifestyleChanges.length;

  const downloadReport = () => {
    const pdfContent = `
NEPHRONET KIDNEY DISEASE ANALYSIS REPORT
========================================

Date: ${new Date().toLocaleDateString()}
Patient ID: ${results.patient_id || "N/A"}

AGENT A: CKD RISK ASSESSMENT
${agentAFeedback.join("\n\n")}

AGENT B: DRUG RISK ANALYSIS
${drugResults
  .map(
    (drug) => `Drug: ${drug.DrugName || "Unknown Drug"}
Risk Level: ${drug.RiskLevel || "N/A"}
Notes: ${drug.Notes || "No notes available"}
${drug.AlternativeName && drug.AlternativeName !== "None" ? `Safer Alternative: ${drug.AlternativeName}` : ""}`
  )
  .join("\n\n")}

AGENT C: PATIENT EDUCATION
${hasStructuredAgentC ? `
Food Prescription - Avoid/Limit:
${foodsToAvoid.map((item) => `- ${item}`).join("\n")}

Food Prescription - Add/Prefer:
${foodsToAdd.map((item) => `- ${item}`).join("\n")}

Lifestyle Changes:
${lifestyleChanges.map((item) => `- ${item}`).join("\n")}
` : fallbackHandout ? "Maintain regular follow-ups, review medications with a clinician, and follow personalized diet guidance." : handout}

This AI-generated report is informational and does not replace medical advice.
`;

    const blob = new Blob([pdfContent], { type: "text/plain" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `NephroNet_Analysis_Report_${new Date().toISOString().split("T")[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="section-wrap results-layout">
      <div className="results-header">
        <div>
          <span className="eyebrow">
            <ShieldCheck size={16} />
            analysis complete
          </span>
          <h2 className="section-title">A concise readout from your clinical agents.</h2>
          <p className="section-copy">
            The report is organized by risk, medications, and patient education so each decision point has a clear place.
          </p>
        </div>
        <button className="secondary-btn" onClick={downloadReport}>
          <Download size={18} />
          Download
        </button>
      </div>

      <div className="results-grid">
        <motion.article
          className="surface-card result-card result-card-wide"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="result-heading">
            <span className="card-icon">
              <HeartPulse size={24} />
            </span>
            <div>
              <h3>Agent A: The Sifter</h3>
              <p>CKD risk assessment</p>
            </div>
          </div>

          {agentAFeedback.some((fb) => fb.includes("Error generating narrative") || fb.includes("404 models")) ? (
            <div className="risk-grid">
              {(results.AgentA?.risk || []).map((risk, index) => (
                <div className={`risk-tile risk-${risk}`} key={`${risk}-${index}`}>
                  <span>{riskLabel(risk)}</span>
                  <strong>Risk signal</strong>
                </div>
              ))}
            </div>
          ) : (
            <div className="result-copy">
              {agentAFeedback.map((fb, index) => (
                <p key={index}>{fb}</p>
              ))}
            </div>
          )}
        </motion.article>

        <motion.article
          className="surface-card result-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.08 }}
        >
          <div className="result-heading">
            <span className="card-icon">
              <Pill size={24} />
            </span>
            <div>
              <h3>Agent B: Pharmacist</h3>
              <p>drug risk analysis</p>
            </div>
          </div>

          <div className="drug-list">
            {drugResults.length ? (
              drugResults.map((drug, index) => (
                <div className="drug-row" key={`${drug.DrugName}-${index}`}>
                  <div>
                    <strong>{drug.DrugName || "Unknown drug"}</strong>
                    <p>{drug.Notes || "No notes available"}</p>
                    {drug.AlternativeName && drug.AlternativeName !== "None" && (
                      <span>Alternative: {drug.AlternativeName}</span>
                    )}
                  </div>
                  <em className={`risk-badge ${String(drug.RiskLevel || "").toLowerCase()}`}>
                    {drug.RiskLevel === "Medium" ? "Moderate" : drug.RiskLevel || "N/A"}
                  </em>
                </div>
              ))
            ) : (
              <p className="empty-copy">No medication risks were returned for this report.</p>
            )}
          </div>
        </motion.article>

        <motion.article
          className="surface-card result-card result-card-wide agent-c-card"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.16 }}
        >
          <div className="result-heading">
            <span className="card-icon">
              <Utensils size={24} />
            </span>
            <div>
              <h3>Agent C: Educator</h3>
              <p>food prescription and lifestyle plan</p>
            </div>
          </div>

          {hasStructuredAgentC ? (
            <div className="agent-c-prescription">
              <div className="food-column avoid">
                <h4>
                  <AlertTriangle size={17} />
                  Things to avoid or limit
                </h4>
                <div className="education-list">
                  {foodsToAvoid.map((line, index) => (
                    <div key={`avoid-${line}-${index}`}>
                      <AlertTriangle size={16} />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="food-column add">
                <h4>
                  <CheckCircle2 size={17} />
                  Things to add to diet
                </h4>
                <div className="education-list">
                  {foodsToAdd.map((line, index) => (
                    <div key={`add-${line}-${index}`}>
                      <CheckCircle2 size={16} />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="food-column lifestyle">
                <h4>
                  <BookOpen size={17} />
                  Lifestyle changes
                </h4>
                <div className="education-list">
                  {lifestyleChanges.map((line, index) => (
                    <div key={`life-${line}-${index}`}>
                      <BookOpen size={16} />
                      <span>{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {personalizationNotes.length > 0 && (
                <div className="personalization-strip">
                  <strong>Personalized from this report</strong>
                  <div>
                    {personalizationNotes.map((note, index) => (
                      <span key={`${note}-${index}`}>{note}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="education-list">
              {(fallbackHandout
                ? [
                    "Maintain a balanced diet low in sodium and processed foods.",
                    "Keep regular follow-ups with your healthcare provider.",
                    "Review medications before starting new painkillers or supplements.",
                    "Track blood pressure and kidney labs as advised.",
                  ]
                : normalizeBullets(handout)
              ).map((line, index) => (
                <div key={`${line}-${index}`}>
                  <AlertTriangle size={16} />
                  <span>{line.replace(/^-/, "").trim()}</span>
                </div>
              ))}
            </div>
          )}
        </motion.article>
      </div>

      <div className="results-actions">
        <button className="primary-btn" onClick={onAnalyzeAnother}>
          <RotateCcw size={18} />
          Analyze another report
        </button>
      </div>

      <style>{`
        .results-layout {
          display: grid;
          gap: 2rem;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          padding-left: 0;
          padding-right: 0;
        }

        .results-header {
          display: flex;
          align-items: end;
          justify-content: space-between;
          gap: 1.5rem;
        }

        .results-header,
        .results-grid,
        .results-actions {
          width: min(1180px, calc(100% - 2rem));
          margin-left: auto;
          margin-right: auto;
        }

        .results-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 1rem;
        }

        .result-card {
          padding: 1.25rem;
        }

        .result-card-wide {
          grid-column: 1 / -1;
        }

        .result-heading {
          display: flex;
          align-items: center;
          gap: 0.9rem;
          margin-bottom: 1rem;
        }

        .result-heading h3 {
          margin: 0;
          color: var(--ink);
          font-size: 1.18rem;
          font-family: "Times New Roman", serif;
          font-weight: 700;
        }

        .result-heading p {
          margin: 0.2rem 0 0;
          color: var(--muted);
          font-size: 0.84rem;
          font-family: "Times New Roman", serif;
          font-weight: 700;
          text-transform: uppercase;
        }

        .result-copy {
          display: grid;
          gap: 0.8rem;
          color: var(--muted);
          line-height: 1.65;
          white-space: pre-line;
        }

        .risk-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
          gap: 0.75rem;
        }

        .risk-tile {
          padding: 1rem;
          border-radius: 8px;
          background: #fff;
          border: 1px solid var(--line);
        }

        .risk-tile span,
        .risk-tile strong {
          display: block;
        }

        .risk-tile span {
          color: var(--plum);
          font-size: 1.3rem;
          font-weight: 900;
        }

        .risk-tile strong {
          margin-top: 0.3rem;
          color: var(--muted);
          font-size: 0.78rem;
          text-transform: uppercase;
        }

        .drug-list,
        .education-list {
          display: grid;
          gap: 0.75rem;
        }

        .agent-c-card {
          min-height: 100svh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          width: 100vw;
          margin-left: calc(50% - 50vw);
          border-left: 0;
          border-right: 0;
          border-radius: 0;
          padding: clamp(2rem, 5vw, 4rem) clamp(1rem, 4vw, 3rem);
          background:
            radial-gradient(circle at top right, rgba(120, 215, 198, 0.18), transparent 20rem),
            rgba(255, 255, 255, 0.82);
        }

        .agent-c-card .result-heading,
        .agent-c-card .agent-c-prescription {
          width: min(1400px, calc(100% - 2rem));
          margin-left: auto;
          margin-right: auto;
        }

        .agent-c-prescription {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: clamp(1rem, 2vw, 1.5rem);
          flex: 1;
          align-items: stretch;
        }

        .food-column {
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: clamp(1.1rem, 2vw, 1.6rem);
          background: rgba(255, 255, 255, 0.64);
          min-height: 26rem;
        }

        .food-column h4 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 0.85rem;
          color: var(--ink);
          font-size: 1rem;
          font-weight: 900;
        }

        .food-column .education-list {
          gap: 0.9rem;
        }

        .food-column .education-list div {
          min-height: 4.1rem;
          padding: 1rem;
          font-size: 1rem;
        }

        .food-column.avoid h4,
        .food-column.avoid .education-list svg {
          color: #8f1d35;
        }

        .food-column.add h4,
        .food-column.add .education-list svg {
          color: #1f6b5d;
        }

        .food-column.lifestyle h4,
        .food-column.lifestyle .education-list svg {
          color: var(--plum);
        }

        .personalization-strip {
          grid-column: 1 / -1;
          padding: 1rem;
          border: 1px solid rgba(78, 59, 83, 0.12);
          border-radius: 8px;
          background: linear-gradient(135deg, rgba(204, 195, 235, 0.34), rgba(120, 215, 198, 0.14));
        }

        .personalization-strip strong {
          display: block;
          margin-bottom: 0.7rem;
          color: var(--plum);
          font-size: 0.84rem;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .personalization-strip div {
          display: flex;
          flex-wrap: wrap;
          gap: 0.55rem;
        }

        .personalization-strip span {
          display: inline-flex;
          padding: 0.48rem 0.62rem;
          border-radius: 999px;
          color: var(--plum);
          background: rgba(255, 255, 255, 0.72);
          font-size: 0.84rem;
          font-weight: 750;
        }

        .drug-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 0.8rem;
          padding: 0.9rem;
          border: 1px solid var(--line);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.62);
        }

        .drug-row strong {
          color: var(--ink);
        }

        .drug-row p {
          margin: 0.35rem 0;
          color: var(--muted);
          line-height: 1.55;
        }

        .drug-row span {
          color: #287565;
          font-size: 0.84rem;
          font-weight: 800;
        }

        .risk-badge {
          align-self: start;
          padding: 0.4rem 0.62rem;
          border-radius: 999px;
          color: var(--plum);
          background: var(--lilac);
          font-size: 0.74rem;
          font-style: normal;
          font-weight: 900;
          text-transform: uppercase;
        }

        .risk-badge.high {
          color: #8f1d35;
          background: #ffe0e7;
        }

        .risk-badge.moderate,
        .risk-badge.medium {
          color: #7d4c00;
          background: #fff0c7;
        }

        .risk-badge.low {
          color: #1f6b5d;
          background: #dff8f2;
        }

        .education-list div {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          padding: 0.85rem;
          border: 1px solid var(--line);
          border-radius: 8px;
          color: var(--muted);
          background: rgba(255, 255, 255, 0.62);
          line-height: 1.55;
        }

        .education-list svg {
          flex: 0 0 auto;
          margin-top: 0.2rem;
          color: var(--plum);
        }

        .empty-copy {
          margin: 0;
          color: var(--muted);
        }

        .results-actions {
          display: flex;
          justify-content: center;
        }

        @media (max-width: 850px) {
          .results-header,
          .drug-row {
            grid-template-columns: 1fr;
          }

          .results-header {
            align-items: start;
            flex-direction: column;
          }

          .results-grid {
            grid-template-columns: 1fr;
          }

          .agent-c-prescription {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsView;
