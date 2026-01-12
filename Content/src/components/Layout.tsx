/**
 * VinIA - Componente Layout Principal
 * 
 * Layout que envuelve toda la aplicación con sidebar de navegación
 * y área de contenido principal. Diseño responsive.
 */

import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Users,
  ShoppingCart,
  FileText,
  BarChart3,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  GlassWater,
  Package
} from 'lucide-react';
import { useAuthStore } from '../store';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { usuario, logout } = useAuthStore();

  // Items del menú de navegación
  const menuItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard', roles: ['Administración', 'Comercial', 'Almacén'] },
    { path: '/catalogo', icon: GlassWater, label: 'Catálogo', roles: ['Administración', 'Comercial'] },
    { path: '/clientes', icon: Users, label: 'Clientes', roles: ['Administración', 'Comercial'] },
    { path: '/pedidos', icon: ShoppingCart, label: 'Pedidos', roles: ['Comercial', 'Almacén'] },
    { path: '/facturas', icon: FileText, label: 'Facturas', roles: ['Administración'] },
    { path: '/inventario', icon: Package, label: 'Inventario', roles: ['Almacén', 'Administración'] },
  ];

  // Items solo para administradores
  const adminItems = [
    { path: '/usuarios', icon: Settings, label: 'Usuarios' },
    { path: '/administracion', icon: Users, label: 'Administración' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Sidebar para desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-1 min-h-0 bg-white border-r border-secondary-200">
          {/* Logo y título */}
          <div className="flex items-center h-20 px-6 border-b border-secondary-200">
            <img src="/VinIA_Logo.png" alt="VinIA Logo" className="w-10 h-10" />
            <h1 className="ml-3 text-2xl font-serif font-bold text-secondary-900">
              VinIA
            </h1>
          </div>

          {/* Navegación */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {menuItems.filter(item => item.roles.includes(usuario?.rol || '')).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}

            {/* Sección solo para administradores */}
            {usuario?.rol === 'Administración' && (
              <>
                <div className="pt-4 mt-4 border-t border-secondary-200">
                  <p className="px-4 mb-2 text-xs font-semibold tracking-wider uppercase text-secondary-500">
                    Administración
                  </p>
                </div>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </>
            )}
          </nav>

          {/* Perfil de usuario */}
          <div className="p-4 border-t border-secondary-200">
            <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-200">
                <User className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {usuario?.nombre} {usuario?.apellidos}
                </p>
                <p className="text-xs text-secondary-600 truncate">
                  {usuario?.rol}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 transition-colors rounded-lg hover:bg-primary-200"
                title="Cerrar sesión"
              >
                <LogOut className="w-4 h-4 text-secondary-600" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          {/* Overlay */}
          <button
            type="button"
            className="fixed inset-0 w-full h-full bg-secondary-900/50 cursor-default"
            onClick={() => setSidebarOpen(false)}
            aria-label="Cerrar menú"
          />

          {/* Sidebar panel */}
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white">
            <div className="flex flex-col h-full">
              {/* Logo y botón cerrar */}
              <div className="flex items-center justify-between h-20 px-6 border-b border-secondary-200">
                <div className="flex items-center">
                  <img src="/VinIA_Logo.png" alt="VinIA Logo" className="w-10 h-10" />
                  <h1 className="ml-3 text-2xl font-serif font-bold text-secondary-900">
                    VinIA
                  </h1>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="p-2 rounded-lg hover:bg-secondary-100"
                >
                  <X className="w-6 h-6 text-secondary-600" />
                </button>
              </div>

              {/* Navegación */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {menuItems.filter(item => item.roles.includes(usuario?.rol || '')).map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  );
                })}

                {/* Sección solo para administradores */}
                {usuario?.rol === 'Administración' && (
                  <>
                    <div className="pt-4 mt-4 border-t border-secondary-200">
                      <p className="px-4 mb-2 text-xs font-semibold tracking-wider uppercase text-secondary-500">
                        Administración
                      </p>
                    </div>
                    {adminItems.map((item) => {
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.path}
                          to={item.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      );
                    })}
                  </>
                )}
              </nav>

              {/* Perfil */}
              <div className="p-4 border-t border-secondary-200">
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-200">
                    <User className="w-5 h-5 text-primary-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-secondary-900 truncate">
                      {usuario?.nombre} {usuario?.apellidos}
                    </p>
                    <p className="text-xs text-secondary-600 truncate">
                      {usuario?.rol}
                    </p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 transition-colors rounded-lg hover:bg-primary-200"
                  >
                    <LogOut className="w-4 h-4 text-secondary-600" />
                  </button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <div className="lg:pl-72">
        {/* Header móvil */}
        <header className="sticky top-0 z-30 flex items-center h-20 px-4 bg-white border-b border-secondary-200 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-secondary-100"
          >
            <Menu className="w-6 h-6 text-secondary-600" />
          </button>
          <div className="flex items-center ml-4">
            <img src="/VinIA_Logo.png" alt="VinIA Logo" className="w-8 h-8" />
            <h1 className="ml-2 text-xl font-serif font-bold text-secondary-900">
              VinIA
            </h1>
          </div>
        </header>

        {/* Contenido de las páginas */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
