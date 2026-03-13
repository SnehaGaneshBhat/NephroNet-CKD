from fastapi import APIRouter
from pydantic import BaseModel
from utils.ai_helper import call_ai_model
import pandas as pd

router = APIRouter(prefix="/agent-c", tags=["Agent C"])

class PatientProfile(BaseModel):
    age: int
    culture: str
    literacy: str
    risk_level: int = 0
    lab_values: dict = {}

def generate_handout(profile: PatientProfile):
    # Always use personalized function for better results
    narrative = generate_personalized_diet_plan(profile)
    
    return {"handout": narrative}

def generate_personalized_diet_plan(profile):
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
        "Indian": [
            "• Limit dal and legumes (high in phosphorus and potassium) - choose smaller portions",
            "• Choose white rice over brown rice (lower phosphorus content)",
            "• Limit ghee and butter to control saturated fat and phosphorus",
            "• Be cautious with spices like turmeric and cumin (moderate potassium content)",
            "• Avoid pickles and papads (very high sodium)",
            "• Choose fresh homemade foods over processed Indian snacks"
        ],
        "American": [
            "• Limit fast food, pizza, and processed American foods (high sodium)",
            "• Choose fresh vegetables over canned versions (lower sodium)",
            "• Limit cheese and dairy products (high in phosphorus)",
            "• Watch portion sizes of meat and poultry",
            "• Choose fresh herbs over salt for seasoning"
        ],
        "Generic": [
            "• Follow general kidney-friendly diet guidelines",
            "• Consult with a renal dietitian for personalized advice"
        ]
    }
    
    culture_advice = culture_recommendations.get(profile.culture, culture_recommendations["Generic"])
    
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