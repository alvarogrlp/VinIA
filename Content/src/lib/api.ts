const API_URL = 'http://localhost:8080/api';

export const api = {
  async get(endpoint: string) {
    const token = localStorage.getItem('vinia_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  },

  async post(endpoint: string, body: any) {
    const token = localStorage.getItem('vinia_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const url = `${API_URL}${endpoint}`;


    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', response.status, response.statusText, errorText);
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || `Error ${response.status}: ${response.statusText}`);
      } catch (e: any) {
        // If it wasn't JSON or message wasn't there
        if (e.message && e.message.startsWith('Error ')) throw e;
        throw new Error(`Error ${response.status}: ${response.statusText} - ${errorText.substring(0, 100)}`);
      }
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  },

  async put(endpoint: string, body: any) {
    const token = localStorage.getItem('vinia_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  },

  async delete(endpoint: string) {
    const token = localStorage.getItem('vinia_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : {};
  },
};
