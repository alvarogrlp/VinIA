/**
 * VinIA - Archivo principal de la aplicación
 * 
 * Configuración del router y rutas protegidas.
 */

import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store';
import { Layout } from './components/Layout';
import { Login } from './screens/Login';
import { Dashboard } from './screens/Dashboard';
import { Catalogo } from './screens/Catalogo';
import { Clientes } from './screens/Clientes';
import { NuevoCliente } from './screens';
import { NuevoVino } from './screens/NuevoVino';
import { Pedidos } from './screens/Pedidos';
import { Facturas } from './screens/Facturas';
import { Inventario } from './screens/Inventario';
import { NuevoPedido } from './screens/NuevoPedido';
import { Usuarios } from './screens/Usuarios';
import { Administracion } from './screens/Administracion';
import { DetalleComercial } from './screens/DetalleComercial';
import { DetalleCliente } from './screens/DetalleCliente';
import { HistoricoCliente } from './screens/HistoricoCliente';

/**
 * Componente que protege rutas que requieren autenticación
 */
const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) => {
  const { isAuthenticated, isLoading, usuario } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-primary-50">
        <div className="w-12 h-12 border-4 rounded-full border-primary-600 border-t-transparent animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && usuario && !allowedRoles.includes(usuario.rol)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * Componente principal de la aplicación
 */
function App() {
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta de login (pública) */}
        <Route path="/login" element={<Login />} />

        {/* Rutas protegidas */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="catalogo" element={<Catalogo />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="clientes/nuevo" element={<NuevoCliente />} />
          <Route path="clientes/:id" element={<DetalleCliente />} />
          <Route path="clientes/:id/historico" element={<HistoricoCliente />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="pedidos/nuevo" element={<NuevoPedido />} />
          <Route path="facturas" element={<Facturas />} />
          <Route
            path="inventario"
            element={
              <ProtectedRoute allowedRoles={['Almacén']}>
                <Inventario />
              </ProtectedRoute>
            }
          />
          <Route
            path="inventario/nuevo"
            element={
              <ProtectedRoute allowedRoles={['Almacén']}>
                <NuevoVino />
              </ProtectedRoute>
            }
          />
          <Route path="usuarios" element={<Usuarios />} />
          <Route path="administracion" element={<Administracion />} />
          <Route path="administracion/comercial/:id" element={<DetalleComercial />} />
        </Route>

        {/* Ruta por defecto - redirigir al dashboard */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
