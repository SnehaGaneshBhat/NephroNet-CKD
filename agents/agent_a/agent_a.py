import pandas as pd

def agent_a(labs_csv):
    df = pd.read_csv(labs_csv)
    df.fillna(df.median(numeric_only=True), inplace=True)

    risk = []
    feedback = []

    for i in range(len(df)):
        record = df.iloc[i]
        score = 0
        reasons = []

        # Serum creatinine threshold
        if "sc" in df.columns and pd.notna(record["sc"]) and record["sc"] > 1.5:
            score += 1
            reasons.append("serum creatinine is elevated")

        # Blood pressure threshold
        if "bp" in df.columns and pd.notna(record["bp"]) and record["bp"] > 140:
            score += 1
            reasons.append("blood pressure is high")

        # Albuminuria threshold
        if "al" in df.columns and pd.notna(record["al"]) and record["al"] > 2:
            score += 1
            reasons.append("albuminuria is significant")

        # Blood glucose threshold
        if "bgr" in df.columns and pd.notna(record["bgr"]) and record["bgr"] > 200:
            score += 1
            reasons.append("blood glucose is high")

        # Hemoglobin threshold
        if "hemo" in df.columns and pd.notna(record["hemo"]) and record["hemo"] < 12:
            score += 1
            reasons.append("hemoglobin is low")

        # Severity scoring
        if score == 0:
            risk.append(0)
            feedback.append(f"Record {i+1}: Kidney function appears stable.")
        elif score == 1:
            risk.append(1)
            feedback.append(f"Record {i+1}: Mild CKD risk — {', '.join(reasons)}.")
        elif score == 2:
            risk.append(2)
            feedback.append(f"Record {i+1}: Moderate CKD risk — {', '.join(reasons)}.")
        else:
            risk.append(3)
            feedback.append(f"Record {i+1}: Severe CKD risk — {', '.join(reasons)}.")

    return risk, feedback