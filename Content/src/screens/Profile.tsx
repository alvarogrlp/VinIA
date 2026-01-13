/**
 * VinIA - Perfil de Usuario
 * 
 * Gestión de datos personales, contraseña y preferencias.
 */

import { useState } from 'react';
import {
    User,
    Lock,
    Bell,
    Save,
    Camera,
    LogOut,
    Mail,
    Shield
} from 'lucide-react';
import { useAuthStore } from '../store';
import { useNavigate } from 'react-router-dom';

export const Profile = () => {
    const { usuario, logout } = useAuthStore();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        nombre: usuario?.nombre || '',
        apellidos: usuario?.apellidos || '',
        email: usuario?.username || '@vinia.com', // Mock email logic
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const [notifications, setNotifications] = useState({
        email: true,
        browser: true,
        lowStock: true,
        newOrders: true
    });

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        // Aquí iría la llamada al backend para actualizar
        alert('Cambios guardados correctamente (Simulación)');
    };

    return (
        <div className="space-y-8 animate-fade-in max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-secondary-900 font-serif">Mi Perfil</h1>
                    <p className="mt-2 text-secondary-600">Gestiona tu información personal y seguridad</p>
                </div>
                <button
                    onClick={handleLogout}
                    className="btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Cerrar Sesión
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Columna Izquierda - Avatar y Resumen */}
                <div className="space-y-6">
                    <div className="bg-white p-8 rounded-xl shadow-elegant text-center">
                        <div className="relative inline-block mb-4">
                            <div className="w-32 h-32 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-4xl font-bold border-4 border-white shadow-lg mx-auto">
                                {usuario?.nombre.charAt(0)}
                            </div>
                            <button className="absolute bottom-0 right-0 p-2 bg-secondary-900 text-white rounded-full hover:bg-primary-600 transition-colors shadow">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h2 className="text-xl font-bold text-secondary-900">{usuario?.nombre} {usuario?.apellidos}</h2>
                        <p className="text-secondary-500 text-sm mb-4">{usuario?.rol}</p>

                        <div className="flex justify-center gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                Activo
                            </span>
                            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Verificado
                            </span>
                        </div>
                    </div>
                </div>

                {/* Columna Derecha - Formularios */}
                <div className="md:col-span-2 space-y-6">
                    {/* Info Personal */}
                    <div className="bg-white p-6 rounded-xl shadow-elegant">
                        <div className="flex items-center gap-2 mb-6 border-b border-secondary-100 pb-4">
                            <User className="w-5 h-5 text-primary-600" />
                            <h3 className="font-bold text-lg text-secondary-900">Información Personal</h3>
                        </div>

                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                        className="input"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Apellidos</label>
                                    <input
                                        type="text"
                                        value={formData.apellidos}
                                        onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
                                        className="input"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Email / Usuario</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                                    <input
                                        type="text"
                                        value={formData.email}
                                        disabled
                                        className="input !pl-10 bg-secondary-50 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="submit" className="btn-primary">
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar Cambios
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Seguridad */}
                    <div className="bg-white p-6 rounded-xl shadow-elegant">
                        <div className="flex items-center gap-2 mb-6 border-b border-secondary-100 pb-4">
                            <Shield className="w-5 h-5 text-primary-600" />
                            <h3 className="font-bold text-lg text-secondary-900">Seguridad</h3>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-secondary-700 mb-1">Contraseña Actual</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                                    <input type="password" className="input !pl-10" placeholder="••••••••" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Nueva Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                                        <input type="password" className="input !pl-10" placeholder="••••••••" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-secondary-700 mb-1">Confirmar Contraseña</label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-400" />
                                        <input type="password" className="input !pl-10" placeholder="••••••••" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex justify-end pt-2">
                                <button type="button" className="btn-secondary">
                                    Actualizar Contraseña
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Notificaciones */}
                    <div className="bg-white p-6 rounded-xl shadow-elegant">
                        <div className="flex items-center gap-2 mb-6 border-b border-secondary-100 pb-4">
                            <Bell className="w-5 h-5 text-primary-600" />
                            <h3 className="font-bold text-lg text-secondary-900">Preferencias de Notificación</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-secondary-900">Notificaciones por Email</p>
                                    <p className="text-sm text-secondary-500">Recibe resúmenes semanales y alertas importantes</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium text-secondary-900">Alertas de Stock</p>
                                    <p className="text-sm text-secondary-500">Avisar cuando un producto baje del mínimo</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={notifications.lowStock} onChange={() => setNotifications({ ...notifications, lowStock: !notifications.lowStock })} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-secondary-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-secondary-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
