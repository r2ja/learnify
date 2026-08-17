const API_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

type RequestMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface FetchOptions {
  method?: RequestMethod;
  body?: any;
  headers?: HeadersInit;
}

/**
 * General API client for making requests to the backend
 */
export async function apiClient<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };

  if (body) {
    requestOptions.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, requestOptions);

  // For DELETE requests that return 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  // Handle non-JSON responses
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return {} as T;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `API error: ${response.status}`);
  }

  return data as T;
}

/**
 * User-related API calls
 */
export const userApi = {
  getAll: () => apiClient('/users'),
  getById: (id: string) => apiClient(`/users/${id}`),
  create: (userData: any) => apiClient('/users', { method: 'POST', body: userData }),
  update: (id: string, userData: any) =>
    apiClient(`/users/${id}`, { method: 'PATCH', body: userData }),
  delete: (id: string) => apiClient(`/users/${id}`, { method: 'DELETE' }),
};

/**
 * Course-related API calls
 */
export const courseApi = {
  getAll: () => apiClient('/courses'),
  getById: (id: string) => apiClient(`/courses/${id}`),
  create: (courseData: any) =>
    apiClient('/courses', { method: 'POST', body: courseData }),
  update: (id: string, courseData: any) =>
    apiClient(`/courses/${id}`, { method: 'PATCH', body: courseData }),
  delete: (id: string) => apiClient(`/courses/${id}`, { method: 'DELETE' }),
  enroll: (courseId: string, userId: string) =>
    apiClient(`/courses/${courseId}/enroll`, {
      method: 'POST',
      body: { userId },
    }),
};

/**
 * Assessment-related API calls
 */
export const assessmentApi = {
  getAll: () => apiClient('/assessments'),
  getById: (id: string) => apiClient(`/assessments/${id}`),
  create: (assessmentData: any) =>
    apiClient('/assessments', { method: 'POST', body: assessmentData }),
  update: (id: string, assessmentData: any) =>
    apiClient(`/assessments/${id}`, { method: 'PATCH', body: assessmentData }),
  delete: (id: string) => apiClient(`/assessments/${id}`, { method: 'DELETE' }),
}; 