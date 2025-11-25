/**
 * Servicio de Autenticación
 * 
 * Gestiona la autenticación de usuarios con sistema propio (username/password)
 */

import { supabase } from '../lib/supabase';

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
    const { data, error } = await supabase.rpc('login_usuario', {
      p_username: username,
      p_password: password
    });

    if (error) throw error;
    
    if (!data || data.length === 0) {
      throw new Error('Usuario o contraseña incorrectos');
    }

    const user = data[0];
    
    // Guardar en localStorage para persistencia entre sesiones
    localStorage.setItem('vinia_user', JSON.stringify(user));
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
    rol: 'Administración' | 'Comercial' | 'Almacén'
  ) {
    const { data, error } = await supabase.rpc('crear_usuario', {
      p_username: username,
      p_password: password,
      p_nombre: nombre,
      p_apellidos: apellidos,
      p_rol: rol
    });

    if (error) throw error;
    return data;
  },

  /**
   * Cambiar contraseña
   */
  async changePassword(userId: string, oldPassword: string, newPassword: string) {
    const { data, error } = await supabase.rpc('cambiar_password', {
      p_user_id: userId,
      p_old_password: oldPassword,
      p_new_password: newPassword
    });

    if (error) throw error;
    return data;
  },

  /**
   * Cerrar sesión
   */
  async signOut() {
    localStorage.removeItem('vinia_user');
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
    const { data, error } = await supabase
      .from('usuarios')
      .select('id, username, nombre, apellidos, rol, activo, ultimo_acceso, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  /**
   * Activar/desactivar usuario (solo administración)
   */
  async toggleUserStatus(userId: string, activo: boolean) {
    const { error } = await supabase
      .from('usuarios')
      .update({ activo })
      .eq('id', userId);

    if (error) throw error;
  },

  /**
   * Actualizar usuario (solo administración)
   */
  async updateUser(
    userId: string,
    datos: {
      nombre?: string;
      apellidos?: string;
      rol?: 'Administración' | 'Comercial' | 'Almacén';
    }
  ) {
    const { error } = await supabase
      .from('usuarios')
      .update(datos)
      .eq('id', userId);

    if (error) throw error;
  }
};
