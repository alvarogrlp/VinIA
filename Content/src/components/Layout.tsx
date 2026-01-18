import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Users,
  ShoppingCart,
  BarChart3,
  Menu,
  X,
  User,
  LogOut,
  Settings,
  GlassWater,
  Package,
  Map as MapIcon,
  Clock,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useAuthStore, usePedidosStore } from '../store';
import { VinIAChatBot } from './VinIAChatBot';

export const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { usuario, logout } = useAuthStore();
  const { pedidos, cargarPedidos } = usePedidosStore();

  useEffect(() => {
    cargarPedidos();
  }, []);

  const pendingOrders = pedidos.filter(p => {
    const s = (p.estado || '').toUpperCase();
    return s === 'BORRADOR' || s.includes('PENDIENTE');
  });

  // Items del menú de navegación
  const menuItems = [
    { path: '/', icon: BarChart3, label: 'Dashboard', roles: ['Administración', 'Comercial', 'Almacén'] },
    { path: '/catalogo', icon: GlassWater, label: 'Catálogo', roles: ['Administración', 'Comercial'] },
    { path: '/clientes', icon: Users, label: 'Clientes', roles: ['Administración', 'Comercial'] },
    { path: '/mapa', icon: MapIcon, label: 'Mapa', roles: ['Comercial'] },
    { path: '/pedidos-pendientes', icon: Clock, label: 'Pendientes', roles: ['Comercial'] },
    { path: '/pedidos', icon: ShoppingCart, label: 'Pedidos', roles: ['Comercial', 'Almacén'] },
    { path: '/inventario', icon: Package, label: 'Inventario', roles: ['Almacén'] },
  ];

  // Items solo para administradores
  const adminItems = [
    { path: '/usuarios', icon: Settings, label: 'Usuarios' },
    { path: '/administracion', icon: Users, label: 'Administración' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <div className="min-h-screen bg-primary-50 flex">
      {/* Sidebar Izquierdo (Navegación) */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-72 lg:flex-col z-30">
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
            <Link to="/perfil" className="flex items-center gap-3 px-4 py-3 rounded-lg bg-primary-50 transition-colors hover:bg-primary-100 group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary-200 group-hover:bg-primary-300">
                <User className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-secondary-900 truncate">
                  {usuario?.nombre}
                </p>
                <p className="text-xs text-secondary-600 truncate">
                  {usuario?.rol}
                </p>
              </div>
            </Link>
            <button
              onClick={logout}
              className="w-full mt-2 p-2 text-xs flex items-center justify-center text-red-600 hover:bg-red-50 rounded"
            >
              <LogOut className="w-3 h-3 mr-1" /> Cerrar sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Sidebar móvil (Overlay) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-secondary-900/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-white flex flex-col">
            <div className="flex items-center justify-between h-20 px-6 border-b border-secondary-200">
              <div className="flex items-center">
                <img src="/VinIA_Logo.png" alt="VinIA Logo" className="w-10 h-10" />
                <h1 className="ml-3 text-2xl font-serif font-bold text-secondary-900">VinIA</h1>
              </div>
              <button onClick={() => setSidebarOpen(false)}><X className="w-6 h-6 text-secondary-600" /></button>
            </div>
            {/* Same nav logic simplified for brevity in replacement, but I should copy it fully if replacing whole file. 
                Wait, I am replacing the whole file content mostly. */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
              {menuItems.filter(item => item.roles.includes(usuario?.rol || '')).map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                );
              })}
              {usuario?.rol === 'Administración' && adminItems.map((item) => (
                <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)} className={`nav-item ${isActive(item.path) ? 'active' : ''}`}>
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>
        </div>
      )}

      {/* Contenido Principal */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0 transition-all duration-300">
        <header className="sticky top-0 z-20 flex items-center h-20 px-4 bg-white border-b border-secondary-200 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-2 mr-4 rounded-lg hover:bg-secondary-100">
            <Menu className="w-6 h-6 text-secondary-600" />
          </button>
          <span className="text-xl font-bold font-serif text-secondary-900">VinIA</span>
        </header>

        <main className="p-4 lg:p-8 flex-1 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Sidebar Derecho eliminado - Ahora es una pantalla completa */}

      {/* Asistente Virtual Flotante */}
      <VinIAChatBot />
    </div>
  );
};
