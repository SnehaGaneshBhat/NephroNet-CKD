import React, { useState } from "react";
import axios from "axios";

function App() {
  const [file, setFile] = useState(null);
  const [results, setResults] = useState(null);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a PDF first!");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("age", 45);       // demo values
    formData.append("culture", "Indian");
    formData.append("literacy", "basic");

    try {
      const res = await axios.post("http://127.0.0.1:8000/analyze-report", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      alert("Error analyzing report");
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>NephroNet Demo</h1>
      <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} />
      <button onClick={handleUpload} style={{ marginLeft: "10px" }}>Analyze Report</button>

      {results && (
        <div style={{ display: "flex", marginTop: "20px", gap: "20px" }}>
          {/* Agent A */}
          <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px" }}>
            <h2>Agent A – CKD Risk</h2>
            <pre>{JSON.stringify(results.AgentA, null, 2)}</pre>
          </div>

          {/* Agent B */}
          <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px" }}>
            <h2>Agent B – Drug Risks</h2>
            <pre>{JSON.stringify(results.AgentB, null, 2)}</pre>
          </div>

          {/* Agent C */}
          <div style={{ flex: 1, border: "1px solid #ccc", padding: "10px" }}>
            <h2>Agent C – Patient Handout</h2>
            {results.AgentC && (
              <>
                <p><strong>Summary:</strong> {results.AgentC.summary}</p>
                <h3>Diet Plan</h3>
                <ul>
                  {results.AgentC.diet_plan.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
                <h3>Reasoning</h3>
                <ul>
                  {results.AgentC.reasoning.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;