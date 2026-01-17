import { useAuthStore } from '../store';

import { AdminHomeDashboard } from './AdminHomeDashboard';
import { WarehouseDashboard } from './WarehouseDashboard';
import { CommercialDashboard } from './CommercialDashboard';

export const Dashboard = () => {
  const { usuario } = useAuthStore();

  if (usuario?.rol === 'Administración') {
    return <AdminHomeDashboard />;
  }

  if (usuario?.rol === 'Almacén') {
    return <WarehouseDashboard />;
  }

  if (usuario?.rol === 'Comercial') {
    return <CommercialDashboard />;
  }

  return <CommercialDashboard />; // Fallback default
};
