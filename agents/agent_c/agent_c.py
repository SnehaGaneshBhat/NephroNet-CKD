from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/agent-c", tags=["Agent C"])

class PatientProfile(BaseModel):
    age: int
    culture: str
    literacy: str
    risk_level: int = 0   # pass Agent A’s severity score

def generate_handout(profile: PatientProfile):
    """
    Generate a patient-friendly CKD handout with diet plan and reasoning.
    """
    handout = {
        "title": "CKD Patient Handout",
        "summary": "",
        "diet_plan": [],
        "reasoning": []
    }

    # Summary based on risk
    if profile.risk_level == 0:
        handout["summary"] = "Kidney function appears stable. Maintain a healthy lifestyle."
    elif profile.risk_level == 1:
        handout["summary"] = "Mild CKD risk detected. Early dietary adjustments can help."
    elif profile.risk_level == 2:
        handout["summary"] = "Moderate CKD risk detected. Careful diet and monitoring are recommended."
    else:
        handout["summary"] = "Severe CKD risk detected. Strict dietary control and medical follow-up are essential."

    # Diet recommendations
    handout["diet_plan"] = [
        "Limit salt intake to reduce blood pressure strain.",
        "Prefer plant-based proteins over red meat.",
        "Restrict potassium-rich foods if potassium is elevated.",
        "Choose whole grains and fresh vegetables in moderation.",
        "Stay hydrated, but avoid excessive fluid intake if swelling is present."
    ]

    # Reasoning
    handout["reasoning"] = [
        "Salt increases blood pressure, worsening kidney damage.",
        "High protein intake can overwork the kidneys.",
        "Potassium control is important because impaired kidneys struggle to balance electrolytes.",
        "Balanced nutrition supports overall health without stressing kidneys.",
        "Fluid balance prevents overload on weakened kidneys."
    ]

    # Literacy adaptation
    if profile.literacy.lower() == "low":
        handout["summary"] = "Your kidneys need care. Eat less salt, less meat, and drink water carefully."
        handout["diet_plan"] = [
            "Eat less salt (no chips, pickles).",
            "Eat less meat, more dal/beans.",
            "Avoid bananas/oranges if doctor says potassium is high.",
            "Eat rice, roti, and vegetables in small amounts.",
            "Drink water, but not too much."
        ]

    return handout

@router.post("/handout")
def get_handout(profile: PatientProfile):
    return generate_handout(profile)