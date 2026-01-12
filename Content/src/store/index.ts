/**
 * VinIA - Store de Zustand con Supabase
 * 
 * Gestión centralizada del estado de la aplicación usando Zustand con Supabase.
 */

import { create } from 'zustand';
import type { Usuario, Vino, Cliente, Pedido, LineaPedido } from '../types';
import { authService } from '../services/auth.service';
import { vinosService } from '../services/vinos.service';
import { clientesService } from '../services/clientes.service';
import { pedidosService } from '../services/pedidos.service';

// ============================================
// AUTH STORE - Autenticación con sistema propio
// ============================================

interface AuthState {
  usuario: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  usuario: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const user = await authService.signIn(username, password);

      set({
        usuario: {
          id: user.id,
          username: user.username,
          nombre: user.nombre,
          apellidos: user.apellidos || '',
          rol: user.rol as any,
          activo: true,
        },
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.message || 'Usuario o contraseña incorrectos',
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authService.signOut();
      set({ usuario: null, isAuthenticated: false });
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  initialize: async () => {
    try {
      const session = await authService.getSession();
      if (session?.user) {
        set({
          usuario: {
            id: session.user.id,
            username: session.user.username,
            nombre: session.user.nombre,
            apellidos: session.user.apellidos || '',
            rol: session.user.rol as any,
            activo: true,
          },
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      set({ isLoading: false });
    }
  },
}));

// ============================================
// VINOS STORE - Catálogo de vinos con Supabase
// ============================================

interface VinosState {
  vinos: Vino[];
  vinoSeleccionado: Vino | null;
  cargando: boolean;
  error: string | null;
  cargarVinos: () => Promise<void>;
  buscarVinos: (query: string) => Promise<void>;
  filtrarVinos: (filtros: any) => Promise<void>;
  obtenerVino: (id: string) => Vino | undefined;
  agregarVino: (vino: Omit<Vino, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  actualizarVino: (id: string, datos: Partial<Vino>) => Promise<void>;
  eliminarVino: (id: string) => Promise<void>;
  seleccionarVino: (vino: Vino | null) => void;
}

export const useVinosStore = create<VinosState>((set, get) => ({
  vinos: [],
  vinoSeleccionado: null,
  cargando: false,
  error: null,

  cargarVinos: async () => {
    try {
      set({ cargando: true, error: null });
      console.log('🍷 Cargando vinos desde Supabase...');
      const data = await vinosService.getAll();
      console.log('✅ Vinos cargados:', data.length, 'vinos');
      console.log('📦 Primeros 3 vinos:', data.slice(0, 3));

      // Los datos ya vienen con la estructura correcta de Supabase
      set({ vinos: data, cargando: false });
    } catch (error: any) {
      console.error('❌ Error cargando vinos:', error);
      set({ error: error.message, cargando: false });
    }
  },

  buscarVinos: async (query: string) => {
    try {
      set({ cargando: true, error: null });
      console.log('🔍 Búsqueda de vinos:', query);

      // Usar búsqueda avanzada para mejor precisión y scoring
      const data = await vinosService.advancedSearch(query);

      console.log('✅ Resultados de búsqueda:', data.length, 'vinos');
      set({ vinos: data, cargando: false });
    } catch (error: any) {
      console.error('❌ Error en búsqueda:', error);
      set({ error: error.message, cargando: false });
    }
  },

  filtrarVinos: async (filtros: any) => {
    try {
      set({ cargando: true, error: null });
      const data = await vinosService.filter(filtros);
      set({ vinos: data, cargando: false });
    } catch (error: any) {
      set({ error: error.message, cargando: false });
    }
  },

  obtenerVino: (id: string) => {
    const { vinos } = get();
    return vinos.find((vino) => vino.id === id);
  },

  agregarVino: async (vino) => {
    try {
      set({ cargando: true, error: null });
      const nuevoVino = await vinosService.create(vino as any);
      set((state) => ({
        vinos: [...state.vinos, nuevoVino],
        cargando: false
      }));
    } catch (error: any) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  actualizarVino: async (id, datos) => {
    try {
      set({ cargando: true, error: null });
      const vinoActualizado = await vinosService.update(id, datos as any);
      set((state) => ({
        vinos: state.vinos.map((vino) =>
          vino.id === id ? vinoActualizado : vino
        ),
        cargando: false
      }));
    } catch (error: any) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  eliminarVino: async (id) => {
    try {
      set({ cargando: true, error: null });
      await vinosService.delete(id);
      set((state) => ({
        vinos: state.vinos.filter((vino) => vino.id !== id),
        cargando: false
      }));
    } catch (error: any) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  seleccionarVino: (vino) => {
    set({ vinoSeleccionado: vino });
  },
}));

// ============================================
// CLIENTES STORE - Gestión de clientes con Supabase
// ============================================

interface ClientesState {
  clientes: Cliente[];
  clienteSeleccionado: Cliente | null;
  cargando: boolean;
  error: string | null;
  cargarClientes: () => Promise<void>;
  buscarClientes: (query: string) => Promise<void>;
  obtenerCliente: (id: string) => Cliente | undefined;
  agregarCliente: (cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  actualizarCliente: (id: string, datos: Partial<Cliente>) => Promise<void>;
  eliminarCliente: (id: string) => Promise<void>;
  seleccionarCliente: (cliente: Cliente | null) => void;
}

export const useClientesStore = create<ClientesState>((set, get) => ({
  clientes: [],
  clienteSeleccionado: null,
  cargando: false,
  error: null,

  cargarClientes: async () => {
    try {
      set({ cargando: true, error: null });

      // Obtener usuario actual para filtrar si es comercial
      const { usuario } = useAuthStore.getState();

      const data = await clientesService.getAll(usuario?.id, usuario?.rol);

      const clientes: Cliente[] = data.map(c => ({
        id: c.id,
        nombre: c.nombre,
        cif: c.cif,
        tipo: c.tipo as any || 'Particular',
        direccion: c.direccion || '',
        ciudad: c.ciudad || '',
        codigoPostal: c.codigoPostal || '',
        provincia: c.ciudad || '',
        zona: (c as any).zona || 'Norte',
        telefono: c.telefono || '',
        email: c.email || '',
        personaContacto: c.nombre,
        descuento: c.descuento || 0,
        activo: c.activo,
        created_at: c.created_at,
        updated_at: c.updated_at,
        comercial_id: (c as any).comercial_id,
        comercial_nombre: (c as any).comercial_nombre
      }));

      set({ clientes, cargando: false });
    } catch (error: any) {
      set({ error: error.message, cargando: false });
    }
  },

  buscarClientes: async (query: string) => {
    try {
      set({ cargando: true, error: null });
      const data = await clientesService.search(query);

      const clientes: Cliente[] = data.map(c => ({
        id: c.id,
        nombre: c.nombre,
        cif: c.cif,
        tipo: c.tipo as any || 'Particular',
        direccion: c.direccion || '',
        ciudad: c.ciudad || '',
        codigoPostal: c.codigoPostal || '',
        provincia: c.ciudad || '',
        zona: (c as any).zona || 'Norte',
        telefono: c.telefono || '',
        email: c.email || '',
        personaContacto: c.nombre,
        descuento: c.descuento || 0,
        activo: c.activo,
        created_at: c.created_at,
        updated_at: c.updated_at,
        comercial_id: (c as any).comercial_id,
        comercial_nombre: (c as any).comercial_nombre
      }));

      set({ clientes, cargando: false });
    } catch (error: any) {
      set({ error: error.message, cargando: false });
    }
  },

  obtenerCliente: (id: string) => {
    const { clientes } = get();
    return clientes.find((cliente) => cliente.id === id);
  },

  agregarCliente: async (cliente) => {
    try {
      set({ cargando: true, error: null });

      // Concatenar persona de contacto en notas si existe, ya que no hay campo específico en BD
      let notasFinal = cliente.notas || '';
      if (cliente.personaContacto) {
        notasFinal = `Persona de contacto: ${cliente.personaContacto}\n${notasFinal}`;
      }

      const nuevoCliente = await clientesService.create({
        nombre: cliente.nombre,
        cif: cliente.cif,
        email: cliente.email || '',
        telefono: cliente.telefono || '',
        direccion: cliente.direccion || '',
        ciudad: cliente.ciudad || '',
        provincia: cliente.ciudad || '',
        zona: (cliente as any).zona || 'Norte',
        codigoPostal: cliente.codigoPostal || '',
        personaContacto: cliente.personaContacto || cliente.nombre,
        tipo: cliente.tipo || 'Particular',
        descuento: cliente.descuento || 0,
        activo: true,
        notas: notasFinal || undefined
      });

      const clienteConvertido: Cliente = {
        id: nuevoCliente.id,
        nombre: nuevoCliente.nombre,
        cif: nuevoCliente.cif,
        tipo: nuevoCliente.tipo as any || 'Particular',
        direccion: nuevoCliente.direccion || '',
        ciudad: nuevoCliente.ciudad || '',
        codigoPostal: nuevoCliente.codigoPostal || '',
        provincia: nuevoCliente.ciudad || '',
        zona: (nuevoCliente as any).zona || 'Norte',
        telefono: nuevoCliente.telefono || '',
        email: nuevoCliente.email || '',
        personaContacto: cliente.personaContacto || nuevoCliente.nombre, // Usar el dato original o el nombre como fallback
        descuento: nuevoCliente.descuento || 0,
        activo: nuevoCliente.activo,
        created_at: nuevoCliente.created_at,
        updated_at: nuevoCliente.updated_at,
        notas: nuevoCliente.notas || ''
      };

      set((state) => ({
        clientes: [...state.clientes, clienteConvertido],
        cargando: false
      }));
    } catch (error: any) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  actualizarCliente: async (id, datos) => {
    try {
      set({ cargando: true, error: null });

      const datosSupabase: any = {};
      if (datos.nombre) datosSupabase.nombre = datos.nombre;
      if (datos.cif) datosSupabase.cif = datos.cif;
      if (datos.email !== undefined) datosSupabase.email = datos.email;
      if (datos.telefono !== undefined) datosSupabase.telefono = datos.telefono;
      if (datos.direccion !== undefined) datosSupabase.direccion = datos.direccion;
      if (datos.ciudad !== undefined) datosSupabase.ciudad = datos.ciudad;
      if (datos.codigoPostal !== undefined) datosSupabase.codigoPostal = datos.codigoPostal;
      if (datos.tipo !== undefined) datosSupabase.tipo = datos.tipo;
      if (datos.descuento !== undefined) datosSupabase.descuento = datos.descuento;

      const clienteActualizado = await clientesService.update(id, datosSupabase);

      const clienteConvertido: Cliente = {
        id: clienteActualizado.id,
        nombre: clienteActualizado.nombre,
        cif: clienteActualizado.cif,
        tipo: clienteActualizado.tipo as any || 'Particular',
        direccion: clienteActualizado.direccion || '',
        ciudad: clienteActualizado.ciudad || '',
        codigoPostal: clienteActualizado.codigoPostal || '',
        provincia: clienteActualizado.ciudad || '',
        zona: (clienteActualizado as any).zona || 'Norte',
        telefono: clienteActualizado.telefono || '',
        email: clienteActualizado.email || '',
        personaContacto: clienteActualizado.nombre,
        descuento: clienteActualizado.descuento || 0,
        activo: clienteActualizado.activo,
        created_at: clienteActualizado.created_at,
        updated_at: clienteActualizado.updated_at
      };

      set((state) => ({
        clientes: state.clientes.map((cliente) =>
          cliente.id === id ? clienteConvertido : cliente
        ),
        cargando: false
      }));
    } catch (error: any) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  eliminarCliente: async (id) => {
    try {
      set({ cargando: true, error: null });
      await clientesService.delete(id);
      set((state) => ({
        clientes: state.clientes.filter((cliente) => cliente.id !== id),
        cargando: false
      }));
    } catch (error: any) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  seleccionarCliente: (cliente) => {
    set({ clienteSeleccionado: cliente });
  },
}));

// ============================================
// PEDIDOS STORE - Gestión de pedidos con Supabase
// ============================================

interface PedidosState {
  pedidos: Pedido[];
  pedidoActual: Pedido | null;
  cargando: boolean;
  error: string | null;
  cargarPedidos: () => Promise<void>;
  obtenerPedido: (id: string) => Pedido | undefined;
  crearPedido: (clienteId: string) => void;
  agregarLineaPedido: (linea: Omit<LineaPedido, 'id'>) => void;
  actualizarLineaPedido: (lineaId: string, datos: Partial<LineaPedido>) => void;
  eliminarLineaPedido: (lineaId: string) => void;
  setDescuento: (descuento: number) => void;
  setIva: (iva: number) => void;
  actualizarPedido: (datos: Partial<Pedido>) => void;
  calcularTotales: () => void;
  guardarPedido: () => Promise<void>;
  cancelarPedido: () => void;
  cambiarEstadoPedido: (pedidoId: string, estado: Pedido['estado']) => Promise<void>;
  marcarAlbaranDescargado: (pedidoId: string) => Promise<void>;
}

export const usePedidosStore = create<PedidosState>((set, get) => ({
  pedidos: [],
  pedidoActual: null,
  cargando: false,
  error: null,

  cargarPedidos: async () => {
    try {
      set({ cargando: true, error: null });
      const data = await pedidosService.getAll();

      const pedidos: Pedido[] = data.map(p => ({
        id: p.id,
        numero: p.numero,
        clienteId: p.cliente.id,
        clienteNombre: p.cliente.nombre,
        fecha: p.fecha,
        estado: p.estado,
        lineas: p.lineas.map(l => ({
          id: l.id,
          vinoId: l.vino.id,
          vinoNombre: l.vino.nombre,
          vino: l.vino as any, // Preserve full wine object if possible or just minimal
          cantidad: l.cantidad,
          precioUnitario: l.precioUnitario,
          descuento: l.descuento,
          subtotal: l.subtotal,
          anada: l.anada,
          lote: l.lote,
          tipoBulto: l.tipoBulto,
          cantidadBultos: l.cantidadBultos
        })),
        cliente: p.cliente as any, // Preserve cliente object data
        subtotal: p.subtotal,
        descuento: p.descuento,
        iva: p.iva,
        total: p.total,
        notas: p.notas, // Add notes
        direccionEntrega: p.direccionEnvioSnapshot || p.instruccionesEntrega || (p.cliente as any)?.direccionEnvio || (p.cliente as any)?.direccion, // Fallback logic
        formaPago: p.formaPago, // Add payment type
        usuario: p.usuario, // Add assigned commercial if present
        albaranDescargado: (p as any).albaranDescargado,
        fechaDescargaAlbaran: (p as any).fechaDescargaAlbaran,
        created_at: p.created_at
      }));

      set({ pedidos, cargando: false });
    } catch (error: any) {
      set({ error: error.message, cargando: false });
    }
  },

  obtenerPedido: (id: string) => {
    const { pedidos } = get();
    return pedidos.find((pedido) => pedido.id === id);
  },

  crearPedido: (clienteId: string) => {
    const { clientes } = useClientesStore.getState();
    const { usuario } = useAuthStore.getState();
    const cliente = clientes.find(c => c.id === clienteId);

    // Prefer assigned commercial, otherwise current user
    const comercial = (cliente as any)?.usuario || usuario;

    const nuevoPedido: Pedido = {
      id: `temp-${Date.now()}`,
      numero: `PED-${Date.now()}`,
      clienteId,
      clienteNombre: cliente?.nombre || '',
      fecha: new Date().toISOString(),
      estado: 'Borrador',
      lineas: [],
      subtotal: 0,
      descuento: 0,
      iva: 7, // IGIC por defecto
      total: 0,
      instruccionesEntrega: '',
      direccionEnvioSnapshot: (cliente as any)?.direccionEnvio || (cliente as any)?.direccion || '',
      direccionEntrega: (cliente as any)?.direccionEnvio || (cliente as any)?.direccion || '', // Legacy field support
      formaPago: 'Contado',
      usuario: comercial || undefined,
      usuarioId: comercial?.id
    };
    set({ pedidoActual: nuevoPedido });
  },

  agregarLineaPedido: (linea) => {
    // ... no changes to lines
    set((state) => {
      // ...
      if (!state.pedidoActual) return state;

      const nuevaLinea: LineaPedido = {
        ...linea,
        id: `temp-${Date.now()}`,
        subtotal: linea.cantidad * linea.precioUnitario * (1 - linea.descuento / 100),
      };

      return {
        pedidoActual: {
          ...state.pedidoActual,
          lineas: [...state.pedidoActual.lineas, nuevaLinea],
        },
      };
    });
    get().calcularTotales();
  },

  actualizarLineaPedido: (lineaId, datos) => {
    // ...
    set((state) => {
      if (!state.pedidoActual) return state;

      return {
        pedidoActual: {
          ...state.pedidoActual,
          lineas: state.pedidoActual.lineas.map((linea) => {
            if (linea.id !== lineaId) return linea;

            const updatedLinea = { ...linea, ...datos };
            updatedLinea.subtotal = updatedLinea.cantidad * updatedLinea.precioUnitario * (1 - updatedLinea.descuento / 100);

            return updatedLinea;
          }),
        },
      };
    });
    get().calcularTotales();
  },

  eliminarLineaPedido: (lineaId) => {
    // ...
    set((state) => {
      if (!state.pedidoActual) return state;

      return {
        pedidoActual: {
          ...state.pedidoActual,
          lineas: state.pedidoActual.lineas.filter((linea) => linea.id !== lineaId),
        },
      };
    });
    get().calcularTotales();
  },

  setDescuento: (descuento) => {
    // ...
    set((state) => {
      if (!state.pedidoActual) return state;
      return {
        pedidoActual: {
          ...state.pedidoActual,
          descuento
        }
      };
    });
    get().calcularTotales();
  },

  setIva: (iva) => {
    // ...
    set((state) => {
      if (!state.pedidoActual) return state;
      return {
        pedidoActual: {
          ...state.pedidoActual,
          iva
        }
      };
    });
    get().calcularTotales();
  },

  actualizarPedido: (datos) => {
    // ...
    set((state) => {
      if (!state.pedidoActual) return state;
      return {
        pedidoActual: {
          ...state.pedidoActual,
          ...datos
        }
      };
    });
  },

  calcularTotales: () => {
    // ...
    set((state) => {
      if (!state.pedidoActual) return state;

      const subtotal = state.pedidoActual.lineas.reduce(
        (sum, linea) => sum + linea.subtotal,
        0
      );

      const totalConDescuento = subtotal * (1 - state.pedidoActual.descuento / 100);
      const total = totalConDescuento * (1 + state.pedidoActual.iva / 100);

      return {
        pedidoActual: {
          ...state.pedidoActual,
          subtotal,
          total,
        },
      };
    });
  },

  guardarPedido: async () => {
    const { pedidoActual } = get();
    if (!pedidoActual || pedidoActual.lineas.length === 0) return;

    try {
      set({ cargando: true, error: null });

      // Crear pedido en Supabase
      const pedidoCreado = await pedidosService.create(
        {
          numero: "GENERATED_BY_BACKEND", // El backend genera el número definitivo
          clienteId: pedidoActual.clienteId,
          fecha: new Date().toISOString().slice(0, 19), // Format: YYYY-MM-DDTHH:mm:ss for LocalDateTime
          estado: 'PENDIENTE_VALIDACION', // Backend will override if needed, but we send a default
          subtotal: pedidoActual.subtotal,
          descuento: pedidoActual.descuento,
          iva: pedidoActual.iva,
          total: pedidoActual.total,
          notas: undefined,
          instruccionesEntrega: pedidoActual.instruccionesEntrega,
          direccionEnvioSnapshot: pedidoActual.direccionEnvioSnapshot,
          formaPago: pedidoActual.formaPago,
          usuario: pedidoActual.usuario, // Pass the whole object if API supports or just ID
          usuarioId: pedidoActual.usuarioId // Ensure ID is passed if property exists
        },
        pedidoActual.lineas.map(linea => ({
          vinoId: linea.vinoId,
          cantidad: linea.cantidad,
          precioUnitario: linea.precioUnitario,
          descuento: linea.descuento,
          subtotal: linea.subtotal,
          anada: linea.anada,
          lote: linea.lote,
          tipoBulto: linea.tipoBulto,
          cantidadBultos: linea.cantidadBultos
        }))
      );

      // Agregar a la lista de pedidos
      set((state) => ({
        pedidos: [
          ...state.pedidos,
          {
            id: pedidoCreado.id,
            numero: pedidoCreado.numero,
            clienteId: pedidoCreado.cliente.id,
            clienteNombre: pedidoCreado.cliente.nombre,
            fecha: pedidoCreado.fecha,
            estado: pedidoCreado.estado,
            lineas: pedidoCreado.lineas.map(l => ({
              id: l.id,
              vinoId: l.vinoId, // Accessing flat property on LineaPedido
              vinoNombre: l.vino.nombre,
              cantidad: l.cantidad,
              precioUnitario: l.precioUnitario,
              descuento: l.descuento,
              subtotal: l.subtotal
            })),
            subtotal: pedidoCreado.subtotal,
            descuento: pedidoCreado.descuento,
            iva: pedidoCreado.iva,
            total: pedidoCreado.total,
            created_at: pedidoCreado.created_at
          }
        ],
        pedidoActual: null,
        cargando: false
      }));

      // Refresh stock
      useVinosStore.getState().cargarVinos();

    } catch (error: any) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  cancelarPedido: () => {
    set({ pedidoActual: null });
  },

  cambiarEstadoPedido: async (pedidoId, estado) => {
    try {
      set({ cargando: true, error: null });
      // Solo actualizar en Supabase si no es Borrador (estado temporal)
      if (estado !== 'Borrador') {
        await pedidosService.updateEstado(pedidoId, estado as any);
      }
      set((state) => ({
        pedidos: state.pedidos.map((pedido) =>
          pedido.id === pedidoId ? { ...pedido, estado } : pedido
        ),
        cargando: false
      }));
    } catch (error: any) {
      set({ error: error.message, cargando: false });
      throw error;
    }
  },

  marcarAlbaranDescargado: async (pedidoId) => {
    try {
      set({ cargando: true, error: null });
      const fecha = new Date().toISOString();
      // Call service to update backend
      await pedidosService.update(pedidoId, {
        albaranDescargado: true,
        fechaDescargaAlbaran: fecha
      } as any);

      set((state) => ({
        pedidos: state.pedidos.map((pedido) =>
          pedido.id === pedidoId ? {
            ...pedido,
            albaranDescargado: true,
            fechaDescargaAlbaran: fecha
          } : pedido
        ),
        cargando: false
      }));
    } catch (error: any) {
      set({ error: error.message, cargando: false });
    }
  },
}));
