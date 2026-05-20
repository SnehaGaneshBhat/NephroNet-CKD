const API_BASE = "http://127.0.0.1:8000";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function getErrorMessage(data) {
  if (typeof data?.detail === "string") {
    return data.detail;
  }

  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((item) => item?.msg || item?.message)
      .filter(Boolean)
      .join(" ");
  }

  return data?.message || "Something went wrong. Please try again.";
}

async function requestJson(path, options) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status);
  }

  return data;
}

export async function signup({ name, email, password }) {
  const data = await requestJson("/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });

  return {
    ...data,
    message: data.message || "Account created successfully",
  };
}

export async function login({ email, password }) {
  const data = await requestJson("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  return {
    ...data,
    token: data.access_token,
    message: data.message || "Login successful",
  };
}

// Upload PDF and run unified analysis
export async function analyzeReport(file, profile) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("age", profile.age);
  formData.append("culture", profile.culture);
  formData.append("literacy", profile.literacy);

  const response = await fetch(`${API_BASE}/analyze-report`, {
    method: "POST",
    body: formData,
  });
  return response.json();
}
