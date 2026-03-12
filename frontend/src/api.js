const BASE_URL = "http://localhost:8000"; // FastAPI default

// Upload PDF and run unified analysis
export async function analyzeReport(file, profile) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("age", profile.age);
  formData.append("culture", profile.culture);
  formData.append("literacy", profile.literacy);

  const response = await fetch(`${BASE_URL}/analyze-report`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}