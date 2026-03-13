import pandas as pd
import json
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import io
from fastapi.responses import StreamingResponse

# --- Step 1: Load RxNorm concepts ---
file_path = r"D:\NEPHRONET-CKD\data\RxNorm_full_prescribe_03022026\rrf\RXNCONSO.RRF"
rxnorm_df = pd.read_csv(file_path, sep="|", header=None, dtype=str)

# Column 0 = RXCUI, Column 14 = Drug Name
rxnorm_df = rxnorm_df[[0, 14]]
rxnorm_df.columns = ["RxCUI", "DrugName"]

# Create lookup dictionary
rxnorm_dict = dict(zip(rxnorm_df["DrugName"], rxnorm_df["RxCUI"]))

# --- Step 2: Synonyms mapping ---
synonyms = {
    "Paracetamol": "Acetaminophen", "Tylenol": "Acetaminophen", "Panadol": "Acetaminophen",
    "Advil": "Ibuprofen", "Motrin": "Ibuprofen", "Nurofen": "Ibuprofen",
    "Furosemide": "Lasix", "Lipitor": "Atorvastatin", "Zocor": "Simvastatin",
    "Glucophage": "Metformin", "Prilosec": "Omeprazole", "Losec": "Omeprazole",
    "Amoxil": "Amoxicillin", "Trimox": "Amoxicillin", "Zithromax": "Azithromycin",
    "Norvasc": "Amlodipine", "Salbutamol": "Albuterol", "Ventolin": "Albuterol", "ProAir": "Albuterol",
    "Lantus": "Insulin Glargine", "Viagra": "Sildenafil", "Revatio": "Sildenafil",
    "Synthroid": "Levothyroxine", "Eltroxin": "Levothyroxine", "Deltasone": "Prednisone",
    "Coumadin": "Warfarin"
}

# --- Step 3: Load nephrotoxic drug list (with Notes column) ---
risk_df = pd.read_csv(r"D:\NEPHRONET-CKD\data\nephrotoxic_drugs.csv")
risk_dict = dict(zip(risk_df["DrugName"], risk_df["RiskLevel"]))

# --- Step 4: Risk checker ---
def check_drug_risk(drug_name):
    """Return RxCUI, nephrotoxicity risk, alternative name, and notes for a given drug."""
    normalized_name = synonyms.get(drug_name, drug_name)
    rxcui = rxnorm_dict.get(normalized_name)

    # Check DrugName first
    row = risk_df.loc[risk_df["DrugName"].str.lower() == normalized_name.lower()]

    # If not found, check AlternativeName
    if row.empty:
        row = risk_df.loc[risk_df["AlternativeName"].str.lower() == normalized_name.lower()]

    if not row.empty:
        risk = row["RiskLevel"].values[0]
        alt_name = row["AlternativeName"].values[0]
        notes = row["Notes"].values[0] if "Notes" in row.columns else ""
    else:
        risk = "Not listed"
        alt_name = "None"
        notes = "No notes available"

    return rxcui, risk, alt_name, notes

# --- Step 5: Process prescription list ---
def process_prescription_list(drug_list):
    results = []
    for drug in drug_list:
        rxcui, risk, alt, notes = check_drug_risk(drug)
        results.append({
            "DrugName": drug,
            "RxCUI": rxcui,
            "RiskLevel": risk,
            "AlternativeName": alt,
            "Notes": notes
        })
    return results

# --- Step 6: Print table ---
def print_drug_table(drug_list):
    """Print results in a clean table format."""
    print(f"{'DrugName':<20}{'RxCUI':<10}{'RiskLevel':<12}{'AlternativeName':<15}{'Notes':<30}")
    print("-" * 90)
    for drug in drug_list:
        rxcui, risk, alt, notes = check_drug_risk(drug)
        print(f"{drug:<20}{rxcui:<10}{risk:<12}{alt:<15}{notes:<30}")

# --- Step 7: Export to JSON ---
def export_results_to_json(drug_list, filename="results.json"):
    """Export results to a JSON file for integration/demo."""
    results = process_prescription_list(drug_list)
    with open(filename, "w") as f:
        json.dump(results, f, indent=4)
    print(f"Results saved to {filename}")

# --- Step 8: FastAPI Service ---
app = FastAPI(
    title="Nephrotoxicity Risk Checker API",
    description="Backend service for flagging nephrotoxic drugs, showing RxNorm IDs, risk levels, safer alternatives, and notes.",
    version="1.0.0"
)

class PrescriptionRequest(BaseModel):
    drugs: List[str]

#  New response models
class DrugResult(BaseModel):
    DrugName: str
    RxCUI: str | None
    RiskLevel: str
    AlternativeName: str
    Notes: str

class PrescriptionResponse(BaseModel):
    results: List[DrugResult]

# --- Updated /meds endpoint ---
@app.post(
    "/meds",
    tags=["Drug Risk Checker"],
    summary="Check nephrotoxicity risk",
    response_model=PrescriptionResponse
)
def get_meds(request: PrescriptionRequest):
    return {"results": process_prescription_list(request.drugs)}

@app.post("/export_csv", tags=["Export"], summary="Download flagged prescription list as CSV")
def export_csv(request: PrescriptionRequest):
    results = process_prescription_list(request.drugs)
    df = pd.DataFrame(results)

    output = io.StringIO()
    df.to_csv(output, index=False)
    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=results.csv"}
    )