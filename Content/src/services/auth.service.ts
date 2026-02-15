import { api } from '../lib/api';

interface LoginResponse {
  id: string;
  username: string;
  nombre: string;
  apellidos: string | null;
  rol: string;
}

export const authService = {
  /**
   * Authenticates a user with username and password.
   * 
   * - Sends credentials to the backend.
   * - Persists the returned user object and token in localStorage.
   * - Sets a session timestamp for expiration checks.
   * 
   * @param username The user's login identifier.
   * @param password The user's password.
   * @returns A promise resolving to the logged-in user details.
   */
  async signIn(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { username, password });

    const user = response.user;
    const token = response.token;

    // Persist session
    localStorage.setItem('vinia_user', JSON.stringify(user));
    localStorage.setItem('vinia_token', token);
    localStorage.setItem('vinia_session_timestamp', Date.now().toString());

    return user;
  },

  /**
   * Crear un nuevo usuario (solo administración)
   */
  async createUser(
    username: string,
    password: string,
    nombre: string,
    apellidos: string,
    rol: 'Administración' | 'Comercial Norte' | 'Comercial Sur' | 'Comercial Santa Cruz' | 'Almacén' | 'Repartidor'
  ) {
    const data = await api.post('/auth/register', {
      username,
      password,
      nombre,
      apellidos,
      rol
    });
    return data;
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const data = await api.post('/auth/change-password', {
      userId,
      oldPassword,
      newPassword
    });
    return data;
  },

  /**
   * Cerrar sesión
   */
  async signOut() {
    localStorage.removeItem('vinia_user');
    localStorage.removeItem('vinia_token');
    localStorage.removeItem('vinia_session_timestamp');
  },

  /**
   * Retrieves the currently logged-in user from local storage.
   * 
   * - Checks if the session timestamp is valid (not older than 7 days).
   * - Logs out automatically if the session has expired.
   * 
   * @returns The user object if a valid session exists, null otherwise.
   */
  async getCurrentUser(): Promise<LoginResponse | null> {
    const userStr = localStorage.getItem('vinia_user');
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);

      // Verify expiration (7 days)
      const timestamp = localStorage.getItem('vinia_session_timestamp');
      if (timestamp) {
        const sessionAge = Date.now() - Number.parseInt(timestamp, 10);
        const maxAge = 7 * 24 * 60 * 60 * 1000;

        if (sessionAge > maxAge) {
          await this.signOut();
          return null;
        }
      }

      return user;
    } catch {
      return null;
    }
  },

  /**
   * Verificar si hay sesión activa
   */
  async getSession(): Promise<{ user: LoginResponse } | null> {
    const user = await this.getCurrentUser();
    return user ? { user } : null;
  },

  /**
   * Obtener todos los usuarios (solo administración)
   */
  async getAllUsers() {
    const data = await api.get('/users');
    return data;
  },

  /**
   * Activar/desactivar usuario (solo administración)
   */
  async toggleUserStatus(userId: string, activo: boolean) {
    await api.post(`/users/${userId}/status`, { activo });
  },

  /**
   * Eliminar usuario permanentemente (solo administración)
   */
  async deleteUser(userId: string) {
    await api.delete(`/users/${userId}`);
  },

  /**
   * Actualizar usuario (solo administración)
   */
  async updateUser(
    userId: string,
    datos: {
      nombre?: string;
      apellidos?: string;
      rol?: 'Administración' | 'Comercial Norte' | 'Comercial Sur' | 'Comercial Santa Cruz' | 'Almacén' | 'Repartidor';
      avatar?: string;
    }
  ) {
    await api.post(`/users/${userId}`, datos);
  }
};
