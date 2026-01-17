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
   * Iniciar sesión con username y contraseña
   */
  async signIn(username: string, password: string): Promise<LoginResponse> {
    const response = await api.post('/auth/login', { username, password });

    const user = response.user;
    const token = response.token;

    // Guardar en localStorage para persistencia entre sesiones
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
   * Obtener el usuario actual desde localStorage
   */
  async getCurrentUser(): Promise<LoginResponse | null> {
    const userStr = localStorage.getItem('vinia_user');
    if (!userStr) return null;

    try {
      const user = JSON.parse(userStr);

      // Verificar que la sesión no haya expirado (opcional: 7 días)
      const timestamp = localStorage.getItem('vinia_session_timestamp');
      if (timestamp) {
        const sessionAge = Date.now() - Number.parseInt(timestamp, 10);
        const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 días en milisegundos

        if (sessionAge > maxAge) {
          // Sesión expirada
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
