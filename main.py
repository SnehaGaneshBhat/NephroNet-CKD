import uvicorn
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os

# --- Import agents ---
from agents.agent_a.agent_a import agent_a
from agents.agent_b.agent_b import app as agent_b_app, process_prescription_list
from agents.agent_c.agent_c import router as agent_c_router, generate_handout, PatientProfile
from utils.pdf_parser import parse_pdf   # returns (df, prescriptions)

app = FastAPI(
    title="NephroNet Unified CKD Platform",
    description="Upload a medical report PDF and get CKD risk scoring, nephrotoxic drug checks, and personalized patient education.",
    version="2.0.0"
)

# ✅ Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # tighten later to ["http://localhost:5173"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/ping")
def ping():
    return {"message": "pong"}

# Mount Agent B
app.mount("/agent-b", agent_b_app)

# Include Agent C
app.include_router(agent_c_router)

@app.post("/analyze-report")
async def analyze_report(
    file: UploadFile = File(...),
    culture: str = Form("Generic"),
    literacy: str = Form("moderate"),
    age: int = Form(50)
):
    """
    Upload a medical report PDF.
    Runs Agent A (CKD risk), Agent B (drug risk), and Agent C (education handout).
    """

    # Save uploaded PDF
    pdf_path = os.path.join(os.getcwd(), file.filename)
    with open(pdf_path, "wb") as f:
        f.write(await file.read())

    # --- Agent A: Parse labs and score CKD risk ---
    df, prescriptions = parse_pdf(pdf_path)
    df["age"] = age
    temp_csv = os.path.join(os.getcwd(), "temp_labs.csv")
    df.to_csv(temp_csv, index=False)
    results_a = agent_a(temp_csv)

    risk = [r["structured"]["score"] for r in results_a]
    feedback = [r["narrative"] for r in results_a]

    # --- Agent B: Drug risk checker ---
    print(f"Prescriptions found: {prescriptions}")
    drug_results = process_prescription_list(prescriptions)
    print(f"Drug results: {drug_results}")

    # --- Agent C: Patient education handout ---
    risk_level = max(risk) if risk else 0
    
    # Extract lab values for personalized diet planning
    lab_values = {}
    if not df.empty:
        lab_values = df.iloc[0].to_dict()
    
    profile = PatientProfile(
        age=age,
        culture=culture,
        literacy=literacy,
        risk_level=risk_level,
        lab_values=lab_values,
        prescriptions=prescriptions
    )
    handout = generate_handout(profile)

    return {
        "AgentA": {"risk": risk, "feedback": feedback},
        "AgentB": {"drug_results": drug_results},
        "AgentC": handout
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
