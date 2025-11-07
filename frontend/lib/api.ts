/**
 * API Client for CoachTCF Backend
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiResponse<T = any> {
  success: boolean;
  error?: string;
  [key: string]: any;
}

/**
 * Get auth token from localStorage
 */
function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

/**
 * Set auth token in localStorage
 */
export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

/**
 * Remove auth token
 */
export function removeToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/**
 * Get user from localStorage
 */
export function getUser() {
  if (typeof window === 'undefined') return null;
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
}

/**
 * Set user in localStorage
 */
export function setUser(user: any): void {
  localStorage.setItem('user', JSON.stringify(user));
}

/**
 * Make API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  } catch (error: any) {
    console.error('API request error:', error);
    throw error;
  }
}

// Authentication
export const auth = {
  async register(email: string, password: string, name: string) {
    const data = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });

    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  },

  async login(email: string, password: string) {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
    }

    return data;
  },

  logout() {
    removeToken();
  },
};

// Session management
export const session = {
  async start(date?: string) {
    return await apiRequest('/api/session/start', {
      method: 'POST',
      body: JSON.stringify({ date }),
    });
  },

  async submit(sessionId: number, data: {
    listeningAnswer: string;
    speechAudioBase64: string;
    writingText: string;
  }) {
    return await apiRequest('/api/session/submit', {
      method: 'POST',
      body: JSON.stringify({ sessionId, ...data }),
    });
  },

  async get(sessionId: number) {
    return await apiRequest(`/api/session/${sessionId}`);
  },
};

// Progress tracking
export const progress = {
  async get(userId: number, days: number = 30) {
    return await apiRequest(`/api/progress/${userId}?days=${days}`);
  },

  async getSummary(userId: number) {
    return await apiRequest(`/api/progress/${userId}/summary`);
  },
};

export default {
  auth,
  session,
  progress,
  getUser,
  setUser,
  removeToken,
};

