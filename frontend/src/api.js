const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const api = {
  // Auth endpoints
  async getUser() {
    const response = await fetch(`${API_BASE_URL}/auth/user`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Not authenticated');
    return response.json();
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Logout failed');
    return response.json();
  },

  // MFA endpoints
  async getMFAAccounts() {
    const response = await fetch(`${API_BASE_URL}/api/mfa`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch MFA accounts');
    return response.json();
  },

  async getToken(id) {
    const response = await fetch(`${API_BASE_URL}/api/mfa/${id}/token`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to get token');
    return response.json();
  },

  async addMFA(data) {
    const response = await fetch(`${API_BASE_URL}/api/mfa`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add MFA');
    }
    return response.json();
  },

  async addMFAFromQR(data) {
    const response = await fetch(`${API_BASE_URL}/api/mfa/from-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to add MFA from QR');
    }
    return response.json();
  },

  async deleteMFA(id) {
    const response = await fetch(`${API_BASE_URL}/api/mfa/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to delete MFA');
    return response.json();
  },
};

export const AUTH_URL = `${API_BASE_URL}/auth/microsoft`;
