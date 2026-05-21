import os
import pickle

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, classification_report
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".."))
DATASET_PATH = os.path.join(BASE_DIR, "data", "kidney_disease.csv")
MODEL_PATH = os.path.join(BASE_DIR, "models", "agent_a_ckd_model.pkl")

FEATURE_COLUMNS = [
    "age",
    "bp",
    "sg",
    "al",
    "su",
    "rbc",
    "pc",
    "pcc",
    "ba",
    "bgr",
    "bu",
    "sc",
    "sod",
    "pot",
    "hemo",
    "pcv",
    "wc",
    "rc",
    "htn",
    "dm",
    "cad",
    "appet",
    "pe",
    "ane",
]

NUMERIC_COLUMNS = [
    "age",
    "bp",
    "sg",
    "al",
    "su",
    "bgr",
    "bu",
    "sc",
    "sod",
    "pot",
    "hemo",
    "pcv",
    "wc",
    "rc",
]

CATEGORICAL_COLUMNS = [
    "rbc",
    "pc",
    "pcc",
    "ba",
    "htn",
    "dm",
    "cad",
    "appet",
    "pe",
    "ane",
]

FEATURE_LABELS = {
    "age": "Age",
    "bp": "Blood pressure",
    "sg": "Urine specific gravity",
    "al": "Albumin",
    "su": "Sugar",
    "bgr": "Blood glucose",
    "bu": "Blood urea",
    "sc": "Serum creatinine",
    "sod": "Sodium",
    "pot": "Potassium",
    "hemo": "Hemoglobin",
    "pcv": "Packed cell volume",
    "wc": "White blood cell count",
    "rc": "Red blood cell count",
    "rbc": "Red blood cells",
    "pc": "Pus cells",
    "pcc": "Pus cell clumps",
    "ba": "Bacteria",
    "htn": "Hypertension",
    "dm": "Diabetes",
    "cad": "Coronary artery disease",
    "appet": "Appetite",
    "pe": "Pedal edema",
    "ane": "Anemia",
}


def clean_dataset(df: pd.DataFrame) -> pd.DataFrame:
    cleaned = df.copy()
    cleaned.columns = [col.strip() for col in cleaned.columns]

    for col in cleaned.select_dtypes(include="object").columns:
        cleaned[col] = cleaned[col].astype(str).str.strip().str.lower()
        cleaned[col] = cleaned[col].replace({"?": None, "nan": None, "": None, "\t?": None})

    for col in NUMERIC_COLUMNS:
        if col in cleaned.columns:
            cleaned[col] = pd.to_numeric(cleaned[col], errors="coerce")

    cleaned["classification"] = cleaned["classification"].astype(str).str.strip().str.lower()
    cleaned["classification"] = cleaned["classification"].replace({"ckd\t": "ckd", "notckd": "notckd"})
    cleaned = cleaned[cleaned["classification"].isin(["ckd", "notckd"])]
    return cleaned


def build_pipeline():
    numeric_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="median")),
            ("scaler", StandardScaler()),
        ]
    )
    categorical_pipeline = Pipeline(
        steps=[
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", numeric_pipeline, NUMERIC_COLUMNS),
            ("cat", categorical_pipeline, CATEGORICAL_COLUMNS),
        ]
    )

    return Pipeline(
        steps=[
            ("preprocessor", preprocessor),
            (
                "model",
                RandomForestClassifier(
                    n_estimators=250,
                    max_depth=8,
                    min_samples_leaf=3,
                    random_state=42,
                    class_weight="balanced",
                ),
            ),
        ]
    )


def train_agent_a_model(force: bool = False):
    os.makedirs(os.path.dirname(MODEL_PATH), exist_ok=True)

    if os.path.exists(MODEL_PATH) and not force:
        with open(MODEL_PATH, "rb") as model_file:
            return pickle.load(model_file)

    dataset = clean_dataset(pd.read_csv(DATASET_PATH))
    X = dataset[FEATURE_COLUMNS]
    y = dataset["classification"].map({"notckd": 0, "ckd": 1})

    stratify = y if y.nunique() == 2 else None
    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=stratify,
    )

    pipeline = build_pipeline()
    pipeline.fit(X_train, y_train)

    y_pred = pipeline.predict(X_test)
    metadata = {
        "features": FEATURE_COLUMNS,
        "accuracy": float(accuracy_score(y_test, y_pred)),
        "classification_report": classification_report(y_test, y_pred, output_dict=True, zero_division=0),
    }

    bundle = {"pipeline": pipeline, "metadata": metadata}
    with open(MODEL_PATH, "wb") as model_file:
        pickle.dump(bundle, model_file)

    return bundle


def load_agent_a_model():
    return train_agent_a_model(force=False)


def ensure_feature_columns(df: pd.DataFrame) -> pd.DataFrame:
    normalized = df.copy()
    for col in FEATURE_COLUMNS:
        if col not in normalized.columns:
            normalized[col] = pd.NA

    for col in NUMERIC_COLUMNS:
        normalized[col] = pd.to_numeric(normalized[col], errors="coerce")

    for col in CATEGORICAL_COLUMNS:
        normalized[col] = normalized[col].astype("object")
        normalized[col] = normalized[col].where(normalized[col].notna(), None)
        normalized[col] = normalized[col].apply(lambda value: str(value).strip().lower() if value is not None else None)

    return normalized[FEATURE_COLUMNS]


def probability_to_score(probability: float) -> int:
    if probability < 0.25:
        return 0
    if probability < 0.5:
        return 1
    if probability < 0.75:
        return 2
    return 3


def probability_to_label(probability: float) -> str:
    score = probability_to_score(probability)
    return ["Low", "Mild", "Moderate", "High"][score]


def describe_value(feature: str, value):
    if pd.isna(value):
        return None

    checks = {
        "sc": (value > 1.5, f"serum creatinine is elevated at {value} mg/dL"),
        "bp": (value > 140, f"blood pressure is high at {value} mmHg"),
        "al": (value > 2, f"albumin is elevated at {value}"),
        "bgr": (value > 200, f"blood glucose is high at {value} mg/dL"),
        "hemo": (value < 12, f"hemoglobin is low at {value} g/dL"),
        "bu": (value > 45, f"blood urea is elevated at {value} mg/dL"),
        "sod": (value < 135, f"sodium is low at {value} mEq/L"),
        "pot": (value > 5.0, f"potassium is high at {value} mEq/L"),
        "sg": (value < 1.015, f"specific gravity is low at {value}"),
        "su": (value > 0, f"urine sugar is present at {value}"),
    }

    if feature in checks and checks[feature][0]:
        return checks[feature][1]

    if feature in {"htn", "dm", "cad", "pe", "ane"} and str(value).lower() == "yes":
        return f"{FEATURE_LABELS[feature]} is marked yes"
    if feature == "appet" and str(value).lower() == "poor":
        return "appetite is marked poor"
    if feature in {"rbc", "pc"} and str(value).lower() == "abnormal":
        return f"{FEATURE_LABELS[feature]} are abnormal"
    if feature in {"pcc", "ba"} and str(value).lower() == "present":
        return f"{FEATURE_LABELS[feature]} are present"

    return None


def build_reasoning(record: pd.Series, probability: float, metadata: dict):
    reasons = []
    normal_points = []

    for feature in FEATURE_COLUMNS:
        value = record.get(feature)
        reason = describe_value(feature, value)
        if reason:
            reasons.append(reason)
        elif feature in ["age", "bp", "al", "bgr", "sc", "hemo"] and pd.notna(value):
            normal_points.append(f"{FEATURE_LABELS[feature]}: {value}")

    if not reasons:
        reasons.append("the model did not find strong abnormal CKD signals in the parsed values")

    confidence = max(probability, 1 - probability)
    model_summary = f"Model-estimated CKD probability: {probability * 100:.1f}%"
    accuracy = metadata.get("accuracy")
    if accuracy is not None:
        model_summary += f" (validation accuracy: {accuracy * 100:.1f}%)"

    return reasons, normal_points, model_summary, confidence


def agent_a(labs_csv: str):
    """
    Analyze lab values with a trained CKD classifier and return risk + reasoning.
    The model is trained from data/kidney_disease.csv and cached in models/.
    """
    df = pd.read_csv(labs_csv)
    feature_df = ensure_feature_columns(df)
    bundle = load_agent_a_model()
    pipeline = bundle["pipeline"]
    metadata = bundle.get("metadata", {})

    probabilities = pipeline.predict_proba(feature_df)[:, 1]

    results = []
    for i, probability in enumerate(probabilities):
        record = feature_df.iloc[i]
        score = probability_to_score(float(probability))
        risk_level = probability_to_label(float(probability))
        reasons, normal_points, model_summary, confidence = build_reasoning(record, float(probability), metadata)

        narrative = f"""CKD Risk Assessment Results:

Risk Level: {risk_level} (Model Score: {score}/3)

Machine Learning Assessment:
• {model_summary}
• Prediction confidence: {confidence * 100:.1f}%

Main Factors Identified:
{chr(10).join(f"• {reason}" for reason in reasons)}

Parsed Values Reviewed:
{chr(10).join(f"• {point}" for point in normal_points) if normal_points else "• The uploaded report had limited parsed lab values."}

Recommendations:
• Review these results with a healthcare provider for clinical interpretation
• Continue monitoring kidney function markers such as creatinine, blood pressure, albumin, glucose, and hemoglobin
• Use Agent C's diet and lifestyle plan as educational guidance, not as a substitute for medical advice

This machine learning assessment is based on patterns learned from the CKD dataset and the values parsed from your report."""

        structured = {
            "score": score,
            "risk_level": risk_level,
            "probability": round(float(probability), 4),
            "confidence": round(float(confidence), 4),
            "reasons": reasons,
            "model_accuracy": metadata.get("accuracy"),
        }
        results.append({"structured": structured, "narrative": narrative})

    return results
