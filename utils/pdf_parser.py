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

            # Prescription extraction (expand regex as needed)
            meds = re.findall(r"(Ibuprofen|Furosemide|Metformin|Amlodipine)", text)
            prescriptions.extend(meds)

    df = pd.DataFrame([data])
    return df, prescriptions