import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, FileText, Loader2, SlidersHorizontal, UploadCloud } from "lucide-react";

const profileFields = [
  {
    id: "age",
    label: "Age",
    type: "number",
    props: { min: 1, max: 120 },
  },
  {
    id: "culture",
    label: "Cultural context",
    options: ["Indian", "American", "Mediterranean", "Asian", "Generic"],
  },
  {
    id: "literacy",
    label: "Health literacy",
    options: ["basic", "moderate", "advanced"],
  },
];

const ReportAnalysis = ({ onUpload, isUploading, file, setFile }) => {
  const [patientProfile, setPatientProfile] = useState({
    age: 45,
    culture: "Indian",
    literacy: "basic",
  });
  const [isDragging, setIsDragging] = useState(false);

  const updateProfile = (field, value) => {
    setPatientProfile((prev) => ({
      ...prev,
      [field]: field === "age" ? Number(value) || 45 : value,
    }));
  };

  const setPdfFile = (selectedFile) => {
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      alert("Please choose a PDF report.");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    setPdfFile(event.dataTransfer.files?.[0]);
  };

  return (
    <div className="section-wrap report-layout">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.55 }}
      >
        <span className="eyebrow light">
          <SlidersHorizontal size={16} />
          report workflow
        </span>
        <h2 className="section-title light">Upload once. Let the agents do the clinical sorting.</h2>
        <p className="section-copy light">
          Add a PDF lab report, tune the patient context, and NephroNet routes the evidence through risk,
          medication, and education checks.
        </p>

        <div className="analysis-rail">
          {["Extract labs", "Assess CKD risk", "Review medications", "Generate guidance"].map((step, index) => (
            <div key={step}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        className="glass-panel upload-panel"
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.55, delay: 0.1 }}
      >
        <label
          htmlFor="file-upload"
          className={`drop-zone ${isDragging ? "is-dragging" : ""}`}
          onDragOver={(event) => {
            event.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
        >
          <input
            id="file-upload"
            type="file"
            accept="application/pdf"
            onChange={(event) => setPdfFile(event.target.files?.[0])}
          />
          <span className="upload-icon">
            <UploadCloud size={34} />
          </span>
          <strong>{file ? "Report ready for analysis" : "Drop your PDF report here"}</strong>
          <p>{file ? file.name : "or click to browse your files"}</p>
          {file && (
            <span className="file-chip">
              <FileText size={15} />
              {(file.size / 1024).toFixed(1)} KB
            </span>
          )}
        </label>

        <div className="profile-grid">
          {profileFields.map((field) => (
            <label key={field.id} className="profile-field">
              <span>{field.label}</span>
              {field.options ? (
                <select value={patientProfile[field.id]} onChange={(event) => updateProfile(field.id, event.target.value)}>
                  {field.options.map((option) => (
                    <option key={option} value={option}>
                      {option[0].toUpperCase() + option.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type={field.type}
                  value={patientProfile[field.id]}
                  onChange={(event) => updateProfile(field.id, event.target.value)}
                  {...field.props}
                />
              )}
            </label>
          ))}
        </div>

        <button className="primary-btn analyze-btn" onClick={() => onUpload?.(patientProfile)} disabled={!file || isUploading}>
          {isUploading ? <Loader2 className="spin" size={19} /> : <ArrowRight size={19} />}
          {isUploading ? "Analyzing report" : "Run multi-agent analysis"}
        </button>
      </motion.div>

      <style>{`
        .report-layout {
          display: grid;
          grid-template-columns: minmax(0, 0.9fr) minmax(22rem, 1fr);
          gap: clamp(2rem, 5vw, 4rem);
          align-items: center;
        }

        .analysis-rail {
          display: grid;
          gap: 0.7rem;
          margin-top: 2rem;
        }

        .analysis-rail div {
          display: flex;
          align-items: center;
          gap: 0.8rem;
          padding: 0.85rem 1rem;
          border: 1px solid rgba(255, 255, 255, 0.18);
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.1);
        }

        .analysis-rail span {
          color: rgba(255, 255, 255, 0.54);
          font-size: 0.78rem;
          font-weight: 900;
        }

        .analysis-rail strong {
          color: white;
        }

        .upload-panel {
          padding: clamp(1rem, 3vw, 1.45rem);
          border-radius: 8px;
        }

        .drop-zone {
          position: relative;
          display: grid;
          place-items: center;
          min-height: 18rem;
          padding: 2rem;
          border: 1px dashed rgba(255, 255, 255, 0.42);
          border-radius: 8px;
          color: white;
          text-align: center;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.14), rgba(255, 255, 255, 0.06)),
            radial-gradient(circle at top, rgba(204, 195, 235, 0.2), transparent 20rem);
          overflow: hidden;
          transition: transform 180ms ease, border-color 180ms ease, background 180ms ease;
        }

        .drop-zone:hover,
        .drop-zone.is-dragging {
          border-color: white;
          transform: translateY(-2px);
        }

        .drop-zone input {
          position: absolute;
          inset: 0;
          opacity: 0;
          cursor: pointer;
        }

        .upload-icon {
          display: grid;
          width: 4.8rem;
          height: 4.8rem;
          place-items: center;
          margin-bottom: 1rem;
          border-radius: 50%;
          color: var(--plum);
          background: white;
          box-shadow: 0 24px 55px rgba(0, 0, 0, 0.18);
        }

        .drop-zone strong {
          font-size: 1.3rem;
        }

        .drop-zone p {
          margin: 0.45rem 0 0;
          color: rgba(255, 255, 255, 0.7);
        }

        .file-chip {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          margin-top: 0.9rem;
          padding: 0.48rem 0.7rem;
          border-radius: 999px;
          color: var(--plum);
          background: white;
          font-size: 0.78rem;
          font-weight: 850;
        }

        .profile-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 0.9rem;
        }

        .profile-field {
          display: grid;
          gap: 0.42rem;
        }

        .profile-field span {
          color: rgba(255, 255, 255, 0.72);
          font-size: 0.75rem;
          font-family: "Times New Roman", serif;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .profile-field input,
        .profile-field select {
          width: 100%;
          height: 2.9rem;
          border: 1px solid rgba(255, 255, 255, 0.22);
          border-radius: 8px;
          color: white;
          background: rgba(255, 255, 255, 0.12);
          padding: 0 0.8rem;
          outline: none;
        }

        .profile-field option {
          color: var(--ink);
        }

        .profile-field input:focus,
        .profile-field select:focus {
          border-color: white;
          box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
        }

        .analyze-btn {
          width: 100%;
          margin-top: 1rem;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 900px) {
          .report-layout,
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default ReportAnalysis;
