import pandas as pd
from utils.ai_helper import call_ai_model

def agent_a(labs_csv: str):
    """
    Analyze lab values and return structured CKD risk + detailed narrative.
    """
    df = pd.read_csv(labs_csv)
    df.fillna(df.median(numeric_only=True), inplace=True)

    results = []
    for i in range(len(df)):
        record = df.iloc[i]
        score, reasons = [], []
        analysis_points = []

        # Check each lab value with specific thresholds
        if "sc" in df.columns and pd.notna(record["sc"]):
            sc_value = record["sc"]
            if sc_value > 1.5:
                score.append(1)
                reasons.append("serum creatinine is elevated")
                analysis_points.append(f"Serum Creatinine: {sc_value} mg/dL (elevated - normal range: 0.6-1.3 mg/dL)")
            else:
                analysis_points.append(f"Serum Creatinine: {sc_value} mg/dL (normal)")

        if "bp" in df.columns and pd.notna(record["bp"]):
            bp_value = record["bp"]
            if bp_value > 140:
                score.append(1)
                reasons.append("blood pressure is high")
                analysis_points.append(f"Blood Pressure: {bp_value} mmHg (high - normal range: <120/80 mmHg)")
            else:
                analysis_points.append(f"Blood Pressure: {bp_value} mmHg (normal)")

        if "al" in df.columns and pd.notna(record["al"]):
            al_value = record["al"]
            if al_value > 2:
                score.append(1)
                reasons.append("albuminuria is significant")
                analysis_points.append(f"Albumin: {al_value} g/L (elevated - normal range: <30 mg/day)")
            else:
                analysis_points.append(f"Albumin: {al_value} g/L (normal)")

        if "bgr" in df.columns and pd.notna(record["bgr"]):
            bgr_value = record["bgr"]
            if bgr_value > 200:
                score.append(1)
                reasons.append("blood glucose is high")
                analysis_points.append(f"Blood Glucose: {bgr_value} mg/dL (high - normal range: 70-100 mg/dL fasting)")
            else:
                analysis_points.append(f"Blood Glucose: {bgr_value} mg/dL (normal)")

        if "hemo" in df.columns and pd.notna(record["hemo"]):
            hemo_value = record["hemo"]
            if hemo_value < 12:
                score.append(1)
                reasons.append("hemoglobin is low")
                analysis_points.append(f"Hemoglobin: {hemo_value} g/dL (low - normal range: 12-16 g/dL for men, 12-15 g/dL for women)")
            else:
                analysis_points.append(f"Hemoglobin: {hemo_value} g/dL (normal)")

        total_score = sum(score)
        risk_level = "Low" if total_score == 0 else "Mild" if total_score == 1 else "Moderate" if total_score == 2 else "High"

        # Create detailed narrative without AI
        narrative = f"""CKD Risk Assessment Results:

Risk Level: {risk_level} (Score: {total_score}/5)

Lab Values Analysis:
{chr(10).join(f"• {point}" for point in analysis_points)}

Findings:
{chr(10).join(f"• {reason}" for reason in reasons) if reasons else "• All lab values are within normal ranges."}

Recommendations:
• Continue regular monitoring of kidney function
• Maintain a healthy lifestyle with proper hydration
• Follow up with your healthcare provider for personalized advice
• Monitor blood pressure and blood sugar regularly

This analysis is based on your current lab results. Consult your healthcare provider for comprehensive medical advice."""

        structured = {"score": total_score, "reasons": reasons}
        results.append({"structured": structured, "narrative": narrative})

    return results