const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Type definitions
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface MFAAccount {
  id: number;
  name: string;
  issuer?: string;
  created_at: string;
}

export interface TokenResponse {
  token: string;
  remainingTime: number;
}

export interface AddMFAData {
  name: string;
  secret: string;
  issuer?: string;
}

export interface AddMFAFromQRData {
  qrData: string;
  customName?: string;
}

interface CSRFTokenResponse {
  token: string;
}

// CSRF token cache
let csrfToken: string | null = null;

async function getCsrfToken(): Promise<string> {
  if (!csrfToken) {
    const response = await fetch(`${API_BASE_URL}/csrf-token`, {
      credentials: 'include',
    });
    const data: CSRFTokenResponse = await response.json();
    csrfToken = data.token;
  }
  return csrfToken;
}

export const api = {
  // Auth endpoints
  async getUser(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Not authenticated');
    return response.json();
  },

  async logout(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Logout failed');
    return response.json();
  },

  // MFA endpoints
  async getMFAAccounts(): Promise<MFAAccount[]> {
    const response = await fetch(`${API_BASE_URL}/api/mfa`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch MFA accounts');
    return response.json();
  },

  async getToken(id: number): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/api/mfa/${id}/token`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get token');
    return response.json();
  },

  async addMFA(data: AddMFAData): Promise<MFAAccount> {
    const token = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': token,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error: { error?: string } = await response.json();
      throw new Error(error.error || 'Failed to add MFA');
    }
    return response.json();
  },

  async addMFAFromQR(data: AddMFAFromQRData): Promise<MFAAccount> {
    const token = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/mfa/from-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': token,
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error: { error?: string } = await response.json();
      throw new Error(error.error || 'Failed to add MFA from QR');
    }
    return response.json();
  },

  async deleteMFA(id: number): Promise<{ message: string }> {
    const token = await getCsrfToken();
    const response = await fetch(`${API_BASE_URL}/api/mfa/${id}`, {
      method: 'DELETE',
      headers: {
        'x-csrf-token': token,
      },
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete MFA');
    return response.json();
  },
};

export const AUTH_URL = `${API_BASE_URL}/auth/microsoft`;
