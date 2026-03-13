import pdfplumber
import pandas as pd
import re

def parse_pdf(pdf_path):
    # Extract labs
    data = {"bp": None, "sc": None, "al": None, "bgr": None, "hemo": None}
    prescriptions = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            text = page.extract_text()
            if not text:
                continue

            # Regex-based lab extraction
            if match := re.search(r"Serum Creatinine[:\s]+([\d\.]+)", text):
                data["sc"] = float(match.group(1))
            if match := re.search(r"Blood Pressure[:\s]+(\d+)", text):
                data["bp"] = int(match.group(1))
            if match := re.search(r"Albumin[:\s]+(\d+)", text):
                data["al"] = int(match.group(1))
            if match := re.search(r"Blood Glucose Random[:\s]+(\d+)", text):
                data["bgr"] = int(match.group(1))
            if match := re.search(r"Hemoglobin[:\s]+([\d\.]+)", text):
                data["hemo"] = float(match.group(1))
            if match := re.search(r"Creatinine[:\s]+([\d\.]+)", text):
                data["sc"] = float(match.group(1))
            if match := re.search(r"Glucose[:\s]+(\d+)", text):
                data["bgr"] = int(match.group(1))

            # Enhanced prescription extraction
            # Look for specific drug patterns
            drug_patterns = [
                r"Ibuprofen",
                r"NSAID\s*\([^)]*\bIbuprofen[^)]*\)",  # NSAID (Ibuprofen)
                r"Furosemide",
                r"Metformin", 
                r"Amlodipine",
                r"ACE\s*Inhibitor",  # ACE Inhibitor
                r"Lisinopril",
                r"Losartan",
                r"Atorvastatin",
                r"Simvastatin"
            ]
            
            for pattern in drug_patterns:
                matches = re.findall(pattern, text, re.IGNORECASE)
                for match in matches:
                    # Clean up the drug name
                    drug_name = match.strip()
                    if "NSAID" in drug_name and "Ibuprofen" in drug_name:
                        drug_name = "Ibuprofen"
                    elif "ACE" in drug_name:
                        drug_name = "Lisinopril"  # Common ACE inhibitor
                    prescriptions.append(drug_name)

    df = pd.DataFrame([data])
    # Remove duplicates while preserving order
    seen = set()
    unique_prescriptions = []
    for drug in prescriptions:
        if drug.lower() not in seen:
            seen.add(drug.lower())
            unique_prescriptions.append(drug)
    
    return df, unique_prescriptions