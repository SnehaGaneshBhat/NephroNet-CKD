from datetime import datetime, timedelta
import json
import os
import re
import uuid

import google.generativeai as genai
import uvicorn
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, PlainTextResponse
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import inspect, text
from sqlalchemy.orm import Session

# --- Import agents ---
from agents.agent_a.agent_a import agent_a
from agents.agent_b.agent_b import app as agent_b_app, process_prescription_list
from agents.agent_c.agent_c import router as agent_c_router, generate_handout, PatientProfile
from utils.pdf_parser import parse_pdf   # returns (df, prescriptions)
from backend.auth import ACCESS_TOKEN_EXPIRE_MINUTES, create_access_token, decode_access_token, hash_password, verify_password
from backend.database import Base, engine, get_db
from backend.models import ReportHistory, User


def load_local_env_file(path: str = ".env") -> None:
    """Load simple KEY=VALUE lines for local development without adding another dependency."""
    candidates = [
        os.path.join(os.getcwd(), path),
        os.path.join(os.path.dirname(os.path.abspath(__file__)), path),
    ]
    env_path = next((candidate for candidate in candidates if os.path.exists(candidate)), None)
    if not env_path:
        return

    with open(env_path, "r", encoding="utf-8") as env_file:
        for raw_line in env_file:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip("\"'")
            if key and key not in os.environ:
                os.environ[key] = value


load_local_env_file()

Base.metadata.create_all(bind=engine)


def ensure_report_history_schema():
    inspector = inspect(engine)
    if "report_history" not in inspector.get_table_names():
        return

    existing_columns = {column["name"] for column in inspector.get_columns("report_history")}
    required_columns = {
        "stored_report_path": "ALTER TABLE report_history ADD COLUMN stored_report_path VARCHAR",
        "stored_report_size": "ALTER TABLE report_history ADD COLUMN stored_report_size INTEGER DEFAULT 0 NOT NULL",
    }
    with engine.begin() as connection:
        for column, statement in required_columns.items():
            if column not in existing_columns:
                connection.execute(text(statement))


ensure_report_history_schema()

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


class SignupRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(..., min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=1)


class UserResponse(BaseModel):
    id: int
    name: str
    email: EmailStr

    model_config = {"from_attributes": True}


class AuthResponse(BaseModel):
    message: str
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ChatbotRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=800)
    report_context: dict | None = None


def json_dumps(value) -> str:
    return json.dumps(value, default=str, ensure_ascii=False)


def safe_filename(filename: str) -> str:
    stem = os.path.basename(filename or "report.pdf")
    return re.sub(r"[^A-Za-z0-9_.-]+", "_", stem).strip("._") or "report.pdf"


def build_auth_response(user: User, message: str) -> AuthResponse:
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return AuthResponse(message=message, access_token=access_token, user=user)


def get_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Please log in first.")

    payload = decode_access_token(authorization.split(" ", 1)[1])
    user_id = payload.get("user_id") if payload else None
    user = db.query(User).filter(User.id == user_id).first() if user_id else None
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Your session has expired.")

    return user


def get_optional_current_user(
    authorization: str | None = Header(default=None),
    db: Session = Depends(get_db),
) -> User | None:
    if not authorization or not authorization.lower().startswith("bearer "):
        return None

    payload = decode_access_token(authorization.split(" ", 1)[1])
    user_id = payload.get("user_id") if payload else None
    return db.query(User).filter(User.id == user_id).first() if user_id else None


def risk_label_from_score(score: float) -> str:
    if score >= 3:
        return "High"
    if score >= 2:
        return "Moderate"
    if score >= 1:
        return "Mild"
    return "Low"


GENERIC_CHAT_RESPONSES = [
    {
        "match": ["cause", "causes"],
        "text": "Common CKD causes include diabetes, high blood pressure, cardiovascular disease, autoimmune disease, family history, and long-term use of certain medications.",
    },
    {
        "match": ["symptom", "sign"],
        "text": "CKD can be silent early. Later signs may include fatigue, swelling in the feet or hands, urination changes, high blood pressure, nausea, and difficulty concentrating.",
    },
    {
        "match": ["prevent", "prevention", "precaution"],
        "text": "Prevention focuses on blood pressure control, diabetes management, healthy weight, less sodium, regular activity, avoiding smoking, and routine kidney function tests.",
    },
    {
        "match": ["diabetes", "diabetic", "blood sugar", "glucose", "hba1c", "a1c"],
        "text": "Diabetes management for kidney health usually means keeping blood sugar in your target range, checking HbA1c as advised, choosing high-fiber slower carbohydrates, limiting sugary drinks, staying active, taking prescribed medicines consistently, and monitoring kidney tests such as eGFR and urine albumin. Your clinician can set the safest glucose and medication targets for you.",
    },
    {
        "match": ["diet", "food", "eat", "carbohydrate", "carbohydrates", "carbs", "sugar", "starch", "rice", "bread"],
        "text": "CKD diets are personalized. Many plans reduce sodium, limit processed foods, and adjust protein, potassium, phosphorus, and fluids based on lab results.",
    },
    {
        "match": ["test", "screening", "diagnosis"],
        "text": "Common screening includes creatinine and eGFR blood tests, urine albumin testing, blood pressure checks, and sometimes imaging such as ultrasound.",
    },
    {
        "match": ["stage", "stages"],
        "text": "CKD staging is usually based on eGFR and urine albumin. Your clinician combines those with symptoms, trends, and other health conditions.",
    },
    {
        "match": ["treatment", "medicine", "medication"],
        "text": "CKD treatment depends on the cause and stage. It may include blood pressure or diabetes control, medication review, diet changes, and regular kidney monitoring.",
    },
]


def generic_chatbot_response(message: str) -> str:
    lower = message.lower()
    for item in GENERIC_CHAT_RESPONSES:
        if any(word in lower for word in item["match"]):
            return item["text"]
    if any(word in lower for word in ["manage", "control", "reduce", "improve"]):
        return (
            "For kidney health, management usually means controlling blood pressure and blood sugar, reducing sodium, staying active, taking prescribed medicines consistently, "
            "avoiding unnecessary painkillers such as NSAIDs unless your doctor approves, and repeating kidney function and urine albumin tests as advised."
        )
    return (
        "I can help with CKD causes, symptoms, prevention, diet, testing, stages, treatment basics, "
        "and questions about your analyzed report. For personal medical decisions, please consult a healthcare provider."
    )


def extract_current_report_context(report_context: dict | None) -> dict | None:
    if not isinstance(report_context, dict):
        return None

    record = report_context.get("ReportRecord") or {}
    compact_context = report_context.get("ReportContext") or {}
    agent_a = report_context.get("AgentA") or {}
    agent_b = report_context.get("AgentB") or {}
    agent_c = report_context.get("AgentC") or {}

    risk_scores = agent_a.get("risk") or []
    max_score = max(
        (float(score) for score in risk_scores),
        default=compact_context.get("risk_score") or record.get("risk_score", 0) or 0,
    )
    return {
        "filename": compact_context.get("filename") or record.get("filename") or "current uploaded report",
        "risk_score": max_score,
        "risk_label": compact_context.get("risk_label") or record.get("risk_label") or risk_label_from_score(max_score),
        "feedback": agent_a.get("feedback") or [],
        "drug_results": agent_b.get("drug_results") or [],
        "education": agent_c,
        "lab_values": compact_context.get("lab_values") or {},
        "prescriptions": compact_context.get("prescriptions") or [],
    }


def report_history_to_chat_context(report: ReportHistory | None) -> dict | None:
    if not report:
        return None

    return {
        "filename": report.original_filename,
        "created_at": report.created_at.isoformat(),
        "age": report.age,
        "culture": report.culture,
        "literacy": report.literacy,
        "risk_score": report.max_risk_score,
        "risk_label": report.max_risk_label,
        "agent_a": json.loads(report.agent_a_json or "{}"),
        "drug_results": json.loads(report.agent_b_json or "{}").get("drug_results", []),
        "education": json.loads(report.agent_c_json or "{}"),
        "lab_values": json.loads(report.lab_values_json or "{}"),
        "prescriptions": json.loads(report.prescriptions_json or "[]"),
        "summary_excerpt": (report.nephronet_document or "")[:1600],
    }


def format_chat_context(context: dict | None) -> str:
    if not context:
        return ""
    return json.dumps(context, default=str, ensure_ascii=False, indent=2)[:5000]


def get_gemini_model_candidates() -> list[str]:
    configured_model = os.getenv("GEMINI_MODEL", "").strip()
    candidates = [
        configured_model,
        "gemini-2.5-flash",
        "models/gemini-2.5-flash",
        "gemini-2.0-flash",
        "models/gemini-2.0-flash",
        "gemini-2.0-flash-lite",
        "models/gemini-2.0-flash-lite",
        "gemini-1.5-flash",
        "models/gemini-1.5-flash",
        "gemini-1.5-pro",
        "models/gemini-1.5-pro",
    ]

    try:
        available_models = []
        for model in genai.list_models():
            methods = getattr(model, "supported_generation_methods", []) or []
            if "generateContent" in methods:
                available_models.append(getattr(model, "name", ""))
        candidates.extend(available_models)
    except Exception as exc:
        print(f"Gemini model discovery failed: {exc}")

    deduped = []
    for name in candidates:
        if name and name not in deduped:
            deduped.append(name)
    return deduped


def build_report_fallback_answer(message: str, context: dict | None) -> str:
    if not context:
        return generic_chatbot_response(message)

    risk_label = context.get("risk_label") or risk_label_from_score(float(context.get("risk_score") or 0))
    risk_score = context.get("risk_score", 0)
    labs = context.get("lab_values") or {}
    feedback = context.get("feedback") or (context.get("agent_a") or {}).get("feedback") or []
    drug_results = context.get("drug_results") or []
    prescriptions = context.get("prescriptions") or []

    abnormal_labs = []
    for key, value in labs.items():
        if key == "age" or value in (None, "", "nan"):
            continue
        abnormal_labs.append(f"{key}: {value}")

    lower = message.lower()
    if any(phrase in lower for phrase in ["summarize", "summary", "explain my report", "what does my report say"]):
        lab_text = f" Parsed values include {', '.join(abnormal_labs[:5])}." if abnormal_labs else ""
        return (
            f"Your report is currently flagged as {risk_label} CKD risk ({risk_score}/3)."
            f"{lab_text} The best next step is to review the creatinine/eGFR trend, urine protein, blood pressure, and any medications with your clinician."
        )

    if any(word in lower for word in ["risk", "score", "stage", "serious"]):
        detail = ""
        if abnormal_labs:
            detail = f" The parsed values most worth discussing are {', '.join(abnormal_labs[:4])}."
        elif feedback:
            detail = " The model used the parsed report values to estimate this score."
        return (
            f"Your current CKD risk result is {risk_label} ({risk_score}/3).{detail} "
            "This is a screening-style AI estimate, so it should be confirmed against your doctor's interpretation and repeat lab trends."
        )

    if any(word in lower for word in ["lab", "value", "creatinine", "egfr", "urea", "albumin", "potassium"]):
        if abnormal_labs:
            return (
                f"The report values I can see include: {', '.join(abnormal_labs[:8])}. "
                f"These fed into a {risk_label} CKD risk result. Ask your doctor which values need repeat testing or trend monitoring."
            )
        return "I do not see detailed parsed lab values for the latest report, but I can still discuss the CKD risk summary and general kidney-health questions."

    if any(word in lower for word in ["medicine", "medication", "drug", "prescription", "tablet"]):
        if drug_results:
            items = []
            for drug in drug_results[:4]:
                if isinstance(drug, dict):
                    name = drug.get("DrugName") or drug.get("drug") or "Medication"
                    risk = drug.get("RiskLevel") or "risk not listed"
                    notes = drug.get("Notes") or drug.get("notes") or ""
                    items.append(f"{name}: {risk}. {notes}".strip())
                else:
                    items.append(str(drug))
            return "Medication notes from the report: " + " ".join(items)
        if prescriptions:
            return f"The report extracted these prescriptions: {', '.join(map(str, prescriptions[:6]))}. I do not see kidney-risk flags for them in the current database."
        return "No prescriptions were extracted from the latest report, so I cannot personalize medication-risk advice from it."

    if any(word in lower for word in ["diet", "food", "eat", "salt", "protein", "water", "carbohydrate", "carbohydrates", "carbs", "sugar", "starch"]):
        if any(word in lower for word in ["carbohydrate", "carbohydrates", "carbs", "sugar", "starch"]):
            return (
                "For kidney and blood-sugar health, it is usually best to limit sugary drinks, sweets, large portions of white rice, white bread, refined flour foods, sweetened cereals, and packaged snacks. "
                "Prefer smaller portions of slower, higher-fiber carbohydrates when your clinician allows them, and pair carbs with vegetables and appropriate protein."
            )
        education = context.get("education") or {}
        food = education.get("food_prescription") if isinstance(education, dict) else {}
        add_foods = food.get("add") if isinstance(food, dict) else []
        avoid_foods = food.get("avoid") if isinstance(food, dict) else []
        if add_foods or avoid_foods:
            add_text = f" Prefer: {', '.join(add_foods[:3])}." if add_foods else ""
            avoid_text = f" Limit: {', '.join(avoid_foods[:3])}." if avoid_foods else ""
            return f"Based on the report's {risk_label} risk context, the generated food guidance says:{add_text}{avoid_text} Confirm potassium, phosphorus, protein, and fluid limits with a clinician."
        return (
            f"Because the current report is marked {risk_label} risk, diet advice should be personalized around eGFR, creatinine, potassium, phosphorus, blood pressure, and urine protein trends. "
            "A practical starting point is to reduce salty packaged foods, keep protein portions moderate unless your clinician says otherwise, and avoid supplement changes without medical review."
        )

    generic_answer = generic_chatbot_response(message)
    if "I can help with" not in generic_answer:
        return generic_answer

    return (
        f"I can answer from your report, but I need a more specific question. For this report I have {risk_label} CKD risk ({risk_score}/3). "
        "Try asking about risk, creatinine/eGFR, hemoglobin, diet, or medication flags."
    )


def generate_chatbot_answer(message: str, context: dict | None) -> tuple[str, str]:
    api_key = os.getenv("GEMINI_API_KEY", "").strip()
    if not api_key:
        return build_report_fallback_answer(message, context), "local"

    try:
        genai.configure(api_key=api_key)
        prompt = f"""
You are NephroNet's CKD assistant. Answer the user's question using both general CKD knowledge and the report context.

Rules:
- Be concise, warm, and patient-friendly.
- Personalize only from the supplied report context.
- Do not diagnose, prescribe, or claim certainty.
- Tell the user to contact a clinician urgently for severe symptoms or alarming results.
- If the question is generic, answer generically but mention report context when relevant.

Report context:
{format_chat_context(context) if context else "No report context is available for this question. Answer with general CKD-safe education."}

User question:
{message}
"""
        for model_name in get_gemini_model_candidates():
            try:
                model = genai.GenerativeModel(model_name)
                response = model.generate_content(prompt)
                answer = getattr(response, "text", "") or ""
                if answer.strip():
                    return answer.strip(), "gemini"
            except Exception as model_exc:
                print(f"Gemini chatbot model {model_name} failed: {model_exc}")
        return build_report_fallback_answer(message, context), "local"
    except Exception as exc:
        print(f"Gemini chatbot fallback triggered: {exc}")
        return build_report_fallback_answer(message, context), "local"


def generate_nephronet_document(
    filename: str,
    age: int,
    culture: str,
    literacy: str,
    results_a: list,
    drug_results: list,
    handout: dict,
    lab_values: dict,
    prescriptions: list,
) -> str:
    risk_items = [item.get("structured", {}) for item in results_a]
    top_risk = max((item.get("score", 0) for item in risk_items), default=0)
    top_label = risk_label_from_score(top_risk)
    reasons = []
    for item in risk_items:
        reasons.extend(item.get("reasons", []))

    food_plan = handout.get("food_prescription", {}) if isinstance(handout, dict) else {}
    food_add = food_plan.get("add") or food_plan.get("add_to_diet") or []
    food_avoid = food_plan.get("avoid") or food_plan.get("avoid_or_limit") or []
    lifestyle_plan = handout.get("lifestyle_changes", []) if isinstance(handout, dict) else []

    lines = [
        "NephroNet Personal Kidney Health Summary",
        "=" * 44,
        f"Uploaded report: {filename}",
        f"Profile used: age {age}, ethnicity/culture {culture}, literacy level {literacy}",
        "",
        f"Agent A CKD risk: {top_label} ({top_risk}/3)",
        "Reasoning signals:",
        *(f"- {reason}" for reason in (reasons[:8] or ["No strong abnormal CKD signals were extracted."])),
        "",
        "Agent B prescription review:",
        *(f"- {drug}" for drug in (drug_results or ["No prescriptions were extracted from this report."])),
        "",
        "Food prescription - add:",
        *(f"- {item}" for item in food_add[:8]),
        "Food prescription - avoid/limit:",
        *(f"- {item}" for item in food_avoid[:8]),
        "",
        "Lifestyle changes:",
        *(f"- {item}" for item in lifestyle_plan[:8]),
        "",
        "Parsed lab values:",
        *(f"- {key}: {value}" for key, value in lab_values.items()),
        "",
        "Extracted prescriptions:",
        *(f"- {item}" for item in (prescriptions or ["None detected"])),
        "",
        "This is an educational AI-generated summary. Please review clinical decisions with a qualified healthcare professional.",
    ]
    return "\n".join(str(line) for line in lines if line is not None)


def serialize_report(report: ReportHistory) -> dict:
    lab_values = json.loads(report.lab_values_json or "{}")
    prescriptions = json.loads(report.prescriptions_json or "[]")
    return {
        "id": report.id,
        "filename": report.original_filename,
        "created_at": report.created_at.isoformat(),
        "age": report.age,
        "culture": report.culture,
        "literacy": report.literacy,
        "risk_score": report.max_risk_score,
        "risk_label": report.max_risk_label,
        "lab_count": len(lab_values),
        "prescription_count": len(prescriptions),
        "uploaded_report_size": report.stored_report_size or 0,
        "has_uploaded_report": bool(report.stored_report_path),
        "document_preview": report.nephronet_document[:420],
    }


@app.get("/ping")
def ping():
    return {"message": "pong"}


@app.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing_user = db.query(User).filter(User.email == email).first()
    if existing_user:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="An account with this email already exists.")

    user = User(
        name=payload.name.strip(),
        email=email,
        hashed_password=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return build_auth_response(user, "Signup successful.")


@app.post("/login", response_model=AuthResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password.")

    return build_auth_response(user, "Login successful.")


@app.get("/me", response_model=UserResponse)
def me(current_user: User = Depends(get_current_user)):
    return current_user


@app.get("/account/reports")
def account_reports(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = (
        db.query(ReportHistory)
        .filter(ReportHistory.user_id == current_user.id)
        .order_by(ReportHistory.created_at.desc())
        .all()
    )
    return {"reports": [serialize_report(report) for report in reports]}


@app.get("/account/summary")
def account_summary(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    reports = (
        db.query(ReportHistory)
        .filter(ReportHistory.user_id == current_user.id)
        .order_by(ReportHistory.created_at.asc())
        .all()
    )
    if not reports:
        return {
            "total_reports": 0,
            "latest_risk_score": 0,
            "latest_risk_label": "No reports yet",
            "average_risk_score": 0,
            "highest_risk_score": 0,
            "progression_trend": "Upload reports to start tracking",
            "latest_report_date": None,
            "risk_series": [],
        }

    scores = [float(report.max_risk_score) for report in reports]
    first_score = scores[0]
    latest_score = scores[-1]
    if latest_score > first_score + 0.25:
        trend = "Risk has increased across saved reports"
    elif latest_score < first_score - 0.25:
        trend = "Risk has improved across saved reports"
    else:
        trend = "Risk has stayed broadly stable"

    return {
        "total_reports": len(reports),
        "latest_risk_score": latest_score,
        "latest_risk_label": reports[-1].max_risk_label,
        "average_risk_score": round(sum(scores) / len(scores), 2),
        "highest_risk_score": max(scores),
        "progression_trend": trend,
        "latest_report_date": reports[-1].created_at.isoformat(),
        "risk_series": [
            {
                "id": report.id,
                "date": report.created_at.isoformat(),
                "filename": report.original_filename,
                "risk_score": report.max_risk_score,
                "risk_label": report.max_risk_label,
            }
            for report in reports
        ],
    }


@app.get("/account/reports/{report_id}/document")
def report_document(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(ReportHistory)
        .filter(ReportHistory.id == report_id, ReportHistory.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found.")

    safe_name = os.path.splitext(report.original_filename)[0].replace(" ", "_")
    headers = {"Content-Disposition": f'attachment; filename="{safe_name}_nephronet_summary.txt"'}
    return PlainTextResponse(report.nephronet_document, headers=headers)


@app.get("/account/reports/{report_id}/uploaded-report")
def uploaded_report_document(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(ReportHistory)
        .filter(ReportHistory.id == report_id, ReportHistory.user_id == current_user.id)
        .first()
    )
    if not report or not report.stored_report_path or not os.path.exists(report.stored_report_path):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Uploaded report file not found.")

    return FileResponse(
        report.stored_report_path,
        media_type="application/pdf",
        filename=safe_filename(report.original_filename),
    )


@app.post("/chatbot/ask")
async def chatbot_ask(
    request: Request,
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    try:
        payload = await request.json()
    except Exception:
        payload = {}

    message = str(payload.get("message") or payload.get("text") or "").strip()
    if not message:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Please enter a chatbot message.")

    supplied_context = extract_current_report_context(payload.get("report_context") or payload.get("reportContext"))
    latest_report_context = None

    if current_user:
        latest_report = (
            db.query(ReportHistory)
            .filter(ReportHistory.user_id == current_user.id)
            .order_by(ReportHistory.created_at.desc())
            .first()
        )
        latest_report_context = report_history_to_chat_context(latest_report)

    context = supplied_context or latest_report_context
    answer, response_source = generate_chatbot_answer(message, context)
    return {
        "answer": answer,
        "response_source": response_source,
        "gemini_configured": bool(os.getenv("GEMINI_API_KEY", "").strip()),
        "used_report_context": bool(context),
        "report": {
            "filename": context.get("filename"),
            "risk_label": context.get("risk_label"),
            "risk_score": context.get("risk_score"),
        }
        if context
        else None,
    }

# Mount Agent B
app.mount("/agent-b", agent_b_app)

# Include Agent C
app.include_router(agent_c_router)

@app.post("/analyze-report")
async def analyze_report(
    file: UploadFile = File(...),
    culture: str = Form("Generic"),
    literacy: str = Form("moderate"),
    age: int = Form(50),
    current_user: User | None = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Upload a medical report PDF.
    Runs Agent A (CKD risk), Agent B (drug risk), and Agent C (education handout).
    """

    upload_bytes = await file.read()
    clean_name = safe_filename(file.filename)
    stored_report_path = None
    if current_user:
        storage_dir = os.path.join(os.getcwd(), "backend", "storage", "reports", f"user_{current_user.id}")
        os.makedirs(storage_dir, exist_ok=True)
        stored_report_path = os.path.join(
            storage_dir,
            f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}_{uuid.uuid4().hex[:8]}_{clean_name}",
        )
        pdf_path = stored_report_path
    else:
        pdf_path = os.path.join(os.getcwd(), clean_name)

    with open(pdf_path, "wb") as f:
        f.write(upload_bytes)

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
    document = generate_nephronet_document(
        filename=file.filename,
        age=age,
        culture=culture,
        literacy=literacy,
        results_a=results_a,
        drug_results=drug_results,
        handout=handout,
        lab_values=lab_values,
        prescriptions=prescriptions,
    )

    saved_report = None
    if current_user:
        risk_items = [item.get("structured", {}) for item in results_a]
        max_risk_score = max((float(item.get("score", 0)) for item in risk_items), default=0)
        saved_report = ReportHistory(
            user_id=current_user.id,
            original_filename=file.filename,
            stored_report_path=stored_report_path,
            stored_report_size=len(upload_bytes),
            age=age,
            culture=culture,
            literacy=literacy,
            max_risk_score=max_risk_score,
            max_risk_label=risk_label_from_score(max_risk_score),
            agent_a_json=json_dumps({"risk": risk, "feedback": feedback, "structured": risk_items}),
            agent_b_json=json_dumps({"drug_results": drug_results}),
            agent_c_json=json_dumps(handout),
            lab_values_json=json_dumps(lab_values),
            prescriptions_json=json_dumps(prescriptions),
            nephronet_document=document,
        )
        db.add(saved_report)
        db.commit()
        db.refresh(saved_report)

    return {
        "AgentA": {"risk": risk, "feedback": feedback},
        "AgentB": {"drug_results": drug_results},
        "AgentC": handout,
        "ReportContext": {
            "filename": file.filename,
            "risk_score": risk_level,
            "risk_label": risk_label_from_score(risk_level),
            "lab_values": lab_values,
            "prescriptions": prescriptions,
        },
        "ReportRecord": serialize_report(saved_report) if saved_report else None,
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
