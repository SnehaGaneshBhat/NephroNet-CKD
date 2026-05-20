from fastapi import APIRouter
from pydantic import BaseModel, Field
import json
import os

try:
    import google.generativeai as genai
except ImportError:  # Keeps the API usable even before dependencies are installed.
    genai = None

router = APIRouter(prefix="/agent-c", tags=["Agent C"])

class PatientProfile(BaseModel):
    age: int
    culture: str
    literacy: str
    risk_level: int = 0
    lab_values: dict = Field(default_factory=dict)
    prescriptions: list[str] = Field(default_factory=list)

def generate_handout(profile: PatientProfile):
    plan = generate_gemini_lifestyle_plan(profile)
    return plan

def strip_json_fence(text: str) -> str:
    cleaned = text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    elif cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    return cleaned.strip()

def normalize_plan(plan: dict, fallback_text: str = "") -> dict:
    food = plan.get("food_prescription") or {}
    avoid = food.get("avoid") or []
    add = food.get("add") or []
    lifestyle = plan.get("lifestyle_changes") or []
    notes = plan.get("personalization_notes") or []
    safety_note = plan.get("safety_note") or "This is educational guidance. Please confirm diet and lifestyle changes with a healthcare professional."

    handout_parts = [
        "Food Prescription",
        "Things to avoid:",
        *[f"- {item}" for item in avoid],
        "",
        "Things to add to your diet:",
        *[f"- {item}" for item in add],
        "",
        "Lifestyle changes:",
        *[f"- {item}" for item in lifestyle],
        "",
        "Why this is personalized:",
        *[f"- {item}" for item in notes],
        "",
        safety_note,
    ]

    return {
        "handout": "\n".join(part for part in handout_parts if part is not None).strip() or fallback_text,
        "food_prescription": {
            "avoid": avoid,
            "add": add,
        },
        "lifestyle_changes": lifestyle,
        "personalization_notes": notes,
        "safety_note": safety_note,
    }

def generate_gemini_lifestyle_plan(profile: PatientProfile):
    """Generate personalized lifestyle guidance with Gemini, with a safe local fallback."""

    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or genai is None:
        return generate_rule_based_diet_plan(profile)

    try:
        genai.configure(api_key=api_key)
        model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
        model = genai.GenerativeModel(model_name)

        payload = {
            "age": profile.age,
            "ethnicity_or_cultural_background": profile.culture,
            "health_literacy_level": profile.literacy,
            "ckd_risk_level": profile.risk_level,
            "parsed_lab_values": profile.lab_values,
            "parsed_prescriptions": profile.prescriptions,
        }

        prompt = f"""
You are Agent C in NephroNet, a patient-education assistant for chronic kidney disease report analysis.

Create personalized lifestyle and food recommendations using the patient context and parsed report data below.

Patient/report data:
{json.dumps(payload, indent=2, default=str)}

Return ONLY valid JSON in this exact shape:
{{
  "food_prescription": {{
    "avoid": ["4 to 7 short, specific food/drink items to avoid or limit"],
    "add": ["4 to 7 short, specific food/drink items to add or prefer"]
  }},
  "lifestyle_changes": ["4 to 7 short, practical lifestyle changes"],
  "personalization_notes": ["2 to 5 short notes naming the lab/profile signals that influenced the advice"],
  "safety_note": "One short medical safety note"
}}

Rules:
- Personalize from parsed_lab_values, age, ethnicity_or_cultural_background, health_literacy_level, ckd_risk_level, and parsed_prescriptions.
- Food options must fit the patient's cultural background where possible.
- Keep language appropriate for the literacy level.
- Do not diagnose. Do not claim certainty beyond the supplied data.
- Do not recommend medicine changes. If medication is relevant, say to review it with a clinician.
- Be concise. Each list item should be one sentence or less.
"""

        response = model.generate_content(prompt)
        text = getattr(response, "text", "").strip()
        if not text:
            return generate_rule_based_structured_plan(profile)
        parsed = json.loads(strip_json_fence(text))
        return normalize_plan(parsed, fallback_text=text)
    except Exception as exc:
        print(f"Gemini Agent C fallback triggered: {exc}")
        return generate_rule_based_structured_plan(profile)

def generate_rule_based_structured_plan(profile):
    lab_values = profile.lab_values or {}
    culture_key = (profile.culture.lower().strip() if profile.culture else "generic")
    basic = profile.literacy.lower().strip() == "basic"

    avoid = ["Packaged and canned foods high in sodium", "Sugary drinks and sweets", "Large portions of red or processed meat"]
    add = ["Fresh home-cooked meals with less salt", "Controlled portions of lean protein", "Fresh vegetables in kidney-safe portions"]
    lifestyle = ["Track blood pressure and repeat kidney labs as advised", "Walk or do light activity most days if your clinician allows", "Sleep 7 to 8 hours and keep regular meal timing"]
    notes = []

    if lab_values.get("sc") is not None and lab_values.get("sc", 0) > 1.5:
        notes.append(f"Creatinine is elevated at {lab_values['sc']} mg/dL, so protein portions should be controlled.")
        avoid.extend(["Very large protein portions", "Frequent dairy, nuts, seeds, and beans without renal diet guidance"])
        add.append("Smaller measured portions of eggs, fish, or poultry")

    if lab_values.get("bgr") is not None and lab_values.get("bgr", 0) > 110:
        notes.append(f"Blood glucose is elevated at {lab_values['bgr']} mg/dL, so carbohydrate quality matters.")
        avoid.extend(["White rice or refined flour in large portions", "Sweet tea, juice, desserts, and added sugar"])
        add.extend(["Low-glycemic vegetables", "Smaller portions of rice or roti paired with vegetables"])

    if lab_values.get("bp") is not None and lab_values.get("bp", 0) > 140:
        notes.append(f"Blood pressure is high at {lab_values['bp']} mmHg, so sodium should be reduced.")
        avoid.extend(["Pickles, papad, salty snacks, sauces, and restaurant food"])
        lifestyle.append("Use herbs, lemon, garlic, and spices instead of extra salt.")

    if lab_values.get("hemo") is not None and lab_values.get("hemo", 0) < 12:
        notes.append(f"Hemoglobin is low at {lab_values['hemo']} g/dL, so iron intake should be discussed.")
        add.extend(["Iron-rich foods such as greens or fortified foods, based on clinician advice", "Vitamin C foods with meals to support iron absorption"])

    if culture_key == "indian":
        avoid.extend(["Pickles, papad, namkeen, and salty chutneys", "Large dal or legume portions if potassium/phosphorus is a concern"])
        add.extend(["Low-salt homemade sabzi", "Measured portions of rice or roti with vegetables"])
    elif culture_key == "asian":
        avoid.extend(["Soy sauce, instant noodles, pickled foods, and salty condiments"])
        add.extend(["Steamed or stir-fried fresh vegetables with minimal sauce"])
    elif culture_key == "mediterranean":
        avoid.extend(["Cured meats, salty cheeses, and preserved foods"])
        add.extend(["Olive oil, fresh herbs, and controlled portions of fish"])
    elif culture_key == "american":
        avoid.extend(["Fast food, pizza, deli meats, chips, and canned soups"])
        add.extend(["Fresh salads with low-sodium dressing", "Grilled lean proteins in smaller portions"])

    if basic:
        lifestyle = [
            "Eat less salt and sugar.",
            "Choose fresh home-cooked food more often.",
            "Walk daily if your doctor says it is safe.",
            "Ask your doctor before changing medicines or diet.",
        ]

    if not notes:
        notes.append("The advice is based on the uploaded report values and profile details provided.")

    return normalize_plan({
        "food_prescription": {
            "avoid": list(dict.fromkeys(avoid))[:7],
            "add": list(dict.fromkeys(add))[:7],
        },
        "lifestyle_changes": list(dict.fromkeys(lifestyle))[:7],
        "personalization_notes": notes[:5],
        "safety_note": "This is educational guidance. Please confirm diet, fluid, and medication decisions with your healthcare professional.",
    })

def generate_rule_based_diet_plan(profile):
    """Generate personalized diet recommendations based on patient profile and specific lab values"""
    
    lab_values = profile.lab_values or {}
    
    # Analyze specific lab values and create targeted recommendations
    diet_recommendations = []
    problem_areas = []
    
    # Check creatinine levels
    if lab_values.get('sc') is not None and lab_values.get('sc', 0) > 1.5:
        creatinine = lab_values['sc']
        problem_areas.append(f"elevated creatinine ({creatinine} mg/dL)")
        diet_recommendations.extend([
            "• Reduce protein intake to 0.6-0.8g per kg body weight to decrease kidney workload",
            "• Choose high-quality proteins (eggs, fish, poultry) in smaller portions",
            "• Limit red meat and processed meats which burden the kidneys",
            "• Consider plant-based proteins like lentils and beans (in moderation)"
        ])
    else:
        diet_recommendations.append("• Maintain normal protein intake (0.8-1.0g per kg body weight)")
    
    # Check hemoglobin levels
    if lab_values.get('hemo') is not None and lab_values.get('hemo', 0) < 12:
        hemoglobin = lab_values['hemo']
        problem_areas.append(f"low hemoglobin ({hemoglobin} g/dL)")
        diet_recommendations.extend([
            "• Increase iron-rich foods: spinach, kale, beans, lentils, and fortified cereals",
            "• Include vitamin C sources (citrus fruits, bell peppers) to enhance iron absorption",
            "• Consider iron-fortified foods and avoid tea/coffee with meals (they inhibit iron absorption)",
            "• Include lean red meat 1-2 times per week if acceptable"
        ])
    else:
        diet_recommendations.append("• Maintain adequate iron intake through balanced diet")
    
    # Check blood glucose levels
    if lab_values.get('bgr') is not None and lab_values.get('bgr', 0) > 200:
        glucose = lab_values['bgr']
        problem_areas.append(f"high blood glucose ({glucose} mg/dL)")
        diet_recommendations.extend([
            "• Strict carbohydrate control: choose complex carbs over simple sugars",
            "• Limit white rice, bread, and pasta; choose whole grains in small portions",
            "• Avoid sugary drinks, desserts, and processed foods with added sugars",
            "• Eat small, frequent meals to maintain stable blood sugar levels",
            "• Include cinnamon which may help regulate blood sugar"
        ])
    elif lab_values.get('bgr') is not None and lab_values.get('bgr', 0) > 110:
        glucose = lab_values['bgr']
        problem_areas.append(f"elevated blood glucose ({glucose} mg/dL)")
        diet_recommendations.extend([
            "• Reduce simple carbohydrates and sugary foods",
            "• Choose low-glycemic index foods: non-starchy vegetables, legumes",
            "• Portion control of carbohydrates - use the plate method (½ non-starchy veggies)"
        ])
    else:
        diet_recommendations.append("• Maintain balanced carbohydrate intake")
    
    # Check blood pressure (if available)
    if lab_values.get('bp') is not None and lab_values.get('bp', 0) > 140:
        bp = lab_values['bp']
        problem_areas.append(f"high blood pressure ({bp} mmHg)")
        diet_recommendations.extend([
            "• Strict sodium restriction: limit to 1,500mg per day",
            "• Avoid all processed foods, canned goods, and restaurant meals",
            "• Do not add salt during cooking or at the table",
            "• Use herbs, spices, lemon juice, and vinegar for flavor instead",
            "• Rinse canned foods thoroughly to remove excess sodium"
        ])
    else:
        diet_recommendations.append("• Maintain moderate sodium intake (2,000mg per day)")
    
    # Add general CKD recommendations
    general_recommendations = [
        "• Stay hydrated with adequate water intake (unless fluid-restricted)",
        "• Monitor phosphorus intake: limit dairy, nuts, seeds, and beans",
        "• Control potassium if needed: limit bananas, oranges, potatoes, and tomatoes",
        "• Choose fresh or frozen vegetables over canned (lower sodium)",
        "• Read food labels carefully for sodium, phosphorus, and potassium content"
    ]
    
    # Culture-specific recommendations
    culture_recommendations = {
        "indian": [
            "• Limit dal and legumes (high in phosphorus and potassium) - choose smaller portions",
            "• Choose white rice over brown rice (lower phosphorus content)",
            "• Limit ghee and butter to control saturated fat and phosphorus",
            "• Be cautious with spices like turmeric and cumin (moderate potassium content)",
            "• Avoid pickles and papads (very high sodium)",
            "• Choose fresh homemade foods over processed Indian snacks"
        ],
        "american": [
            "• Limit fast food, pizza, and processed American foods (high sodium)",
            "• Choose fresh vegetables over canned versions (lower sodium)",
            "• Limit cheese and dairy products (high in phosphorus)",
            "• Watch portion sizes of meat and poultry",
            "• Choose fresh herbs over salt for seasoning"
        ],
        "mediterranean": [
            "• Choose olive oil over other fats for heart health",
            "• Include fish 2-3 times per week (omega-3 benefits)",
            "• Limit cured meats and cheeses (high sodium and phosphorus)",
            "• Enjoy fresh vegetables and fruits in moderation",
            "• Choose whole grains in controlled portions"
        ],
        "asian": [
            "• Limit soy sauce and high-sodium condiments",
            "• Choose fresh vegetables over pickled varieties",
            "• Control portion sizes of rice and noodles",
            "• Be mindful of seaweed and sea vegetables (high iodine)",
            "• Choose steamed or stir-fried over deep-fried foods"
        ],
        "generic": [
            "• Follow general kidney-friendly diet guidelines",
            "• Consult with a renal dietitian for personalized advice"
        ]
    }
    
    # Get culture advice with robust matching and fallback
    culture_key = (profile.culture.lower().strip() if profile.culture else "generic")
    
    # Handle both uppercase and lowercase generic
    if culture_key == "generic":
        culture_advice = culture_recommendations["generic"]
    else:
        culture_advice = culture_recommendations.get(culture_key, culture_recommendations["generic"])
    
    # Debug logging (can be removed in production)
    print(f"Patient culture: '{profile.culture}' -> matched to: '{culture_key}'")
    print(f"Culture advice count: {len(culture_advice)} recommendations")
    print(f"First recommendation: {culture_advice[0] if culture_advice else 'None'}")
    
    # Literacy level adjustments
    if profile.literacy.lower() == "basic":
        literacy_intro = "Simple Diet Plan for Your Kidney Health:"
        literacy_format = "• Eat less salt and sugar\n• Choose fresh foods\n• Drink water daily\n• Ask your doctor about your diet"
    else:
        literacy_intro = "Personalized Nutrition Plan for Kidney Health:"
        literacy_format = "• Monitor macronutrients carefully\n• Track fluid intake as recommended\n• Consider working with a renal nutritionist"
    
    # Create the personalized plan
    if problem_areas:
        problem_summary = f"Areas of concern identified: {', '.join(problem_areas)}"
    else:
        problem_summary = "Your lab values are within normal ranges"
    
    personalized_plan = f"""
{literacy_intro}

Patient Profile: Age {profile.age}, Culture: {profile.culture}, Literacy: {profile.literacy}, Risk Level: {profile.risk_level}

Lab Analysis Summary:
{problem_summary}

Targeted Diet Plan for Your Specific Needs:
{chr(10).join(diet_recommendations)}

General Kidney Health Guidelines:
{chr(10).join(general_recommendations)}

Cultural Dietary Considerations:
{chr(10).join(culture_advice)}

{literacy_format}

Important Notes:
• This plan is specifically designed for your lab results and profile
• Your creatinine level requires {"protein restriction" if lab_values.get('sc') is not None and lab_values.get('sc', 0) > 1.5 else "normal protein intake"}
• Your hemoglobin level requires {"iron-rich foods" if lab_values.get('hemo') is not None and lab_values.get('hemo', 0) < 12 else "adequate iron intake"}
• Your glucose level requires {"strict carbohydrate control" if lab_values.get('bgr') is not None and lab_values.get('bgr', 0) > 200 else "moderate carbohydrate management"}
• Regular monitoring of lab values is essential
• Consult your healthcare provider for individualized medical advice
• Consider working with a renal dietitian for detailed meal planning

Foods to Limit Based on Your Results:
{chr(10).join([
    "• High-sodium processed foods" + (" (strict limit needed)" if lab_values.get('bp') is not None and lab_values.get('bp', 0) > 140 else ""),
    "• High-potassium foods (bananas, oranges, potatoes)" + (" (monitor closely)" if lab_values.get('sc') is not None and lab_values.get('sc', 0) > 1.5 else ""),
    "• High-phosphorus foods (dairy, nuts, beans)" + (" (limit portions)" if lab_values.get('sc') is not None and lab_values.get('sc', 0) > 1.5 else ""),
    "• Excessive protein portions" + (" (reduce significantly)" if lab_values.get('sc') is not None and lab_values.get('sc', 0) > 1.5 else ""),
    "• Sugary foods and refined carbohydrates" + (" (strict limit)" if lab_values.get('bgr') is not None and lab_values.get('bgr', 0) > 110 else "")
])}

Foods to Emphasize:
• Fresh vegetables (in moderation, based on your potassium needs)
• Appropriate fruits (as recommended for your glucose levels)
• Lean proteins in controlled portions (based on your creatinine)
• Whole grains (as appropriate for your glucose management)

Remember: Your diet should be adjusted based on follow-up lab results and medical condition. Regular follow-up with your healthcare team is essential for optimal kidney health management.
"""
    
    return personalized_plan

@router.post("/handout")
def get_handout(profile: PatientProfile):
    return generate_handout(profile)
