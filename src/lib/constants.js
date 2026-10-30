export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1";
export const REQUEST_TIMEOUT_MS = 15_000;
export const SEARCH_DEBOUNCE_MS = 400;

export const PAGE_SIZE_OPTIONS = [10, 20, 50];
export const DEFAULT_PAGE_SIZE = 10;

export const GENDER_OPTIONS = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export const DOCTOR_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
  { value: "specialization:asc", label: "Specialization A–Z" },
];

export const PATIENT_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest first" },
  { value: "createdAt:asc", label: "Oldest first" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
  { value: "age:asc", label: "Age (youngest)" },
  { value: "age:desc", label: "Age (oldest)" },
];

export const DASHBOARD_PRESETS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
  { value: "365", label: "Last 12 months" },
  { value: "custom", label: "Custom range" },
];

export const ROUTES = {
  login: "/login",
  dashboard: "/dashboard",
  forbidden: "/403",
  notFound: "/404",
  doctors: "/doctors",
  newDoctor: "/doctors/new",
  doctor: (id) => `/doctors/${id}`,
  editDoctor: (id) => `/doctors/${id}/edit`,
  patients: "/patients",
  newPatient: "/patients/new",
  patient: (id) => `/patients/${id}`,
  editPatient: (id) => `/patients/${id}/edit`,
};
