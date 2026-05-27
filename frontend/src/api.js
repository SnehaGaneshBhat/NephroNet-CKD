const API_BASE = "http://127.0.0.1:8000";

export function getAuthToken() {
  return localStorage.getItem("nephronet_token");
}

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

function authHeaders() {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
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
    headers: authHeaders(),
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(getErrorMessage(data), response.status);
  }

  return data;
}

export async function getCurrentUser() {
  return requestJson("/me", {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getAccountSummary() {
  return requestJson("/account/summary", {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function getReportHistory() {
  return requestJson("/account/reports", {
    method: "GET",
    headers: authHeaders(),
  });
}

export async function askChatbot(message, reportContext = null) {
  return requestJson("/chatbot/ask", {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({
      message,
      report_context: reportContext,
    }),
  });
}

export async function downloadReportDocument(reportId, filename = "nephronet-summary.txt") {
  return downloadBlob(`/account/reports/${reportId}/document`, filename);
}

export async function downloadUploadedReport(reportId, filename = "uploaded-report.pdf") {
  return downloadBlob(`/account/reports/${reportId}/uploaded-report`, filename);
}

async function downloadBlob(path, filename) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: authHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(getErrorMessage(data), response.status);
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
