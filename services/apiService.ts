const API_BASE_URL = 'http://localhost:8000/api';

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const apiFetch = async (endpoint: string, options: RequestInit = {}): Promise<Response> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(url, config);

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    window.location.href = '/'; // Redirect to login
  }

  return response;
};

const apiPost = async (endpoint: string, body: any): Promise<Response> => {
  return apiFetch(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
};

const apiGet = async (endpoint: string): Promise<Response> => {
  return apiFetch(endpoint, { method: 'GET' });
};

const apiPut = async (endpoint: string, body: any): Promise<Response> => {
  return apiFetch(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
};

const apiDelete = async (endpoint: string): Promise<Response> => {
  return apiFetch(endpoint, { method: 'DELETE' });
};

export { apiFetch, apiPost, apiGet, apiPut, apiDelete, API_BASE_URL };
