import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuthStore } from '../store';
import { clientesService } from '../services/clientes.service';
import { MapPin, Phone, Navigation } from 'lucide-react';
import L from 'leaflet';

/**
 * Creates a custom Leaflet icon representing a wine glass.
 * 
 * The icon styling dynamically changes based on assignment status:
 * - Assigned clients get a "filled" wine glass with a red gradient.
 * - Unassigned clients get an "empty" gray glass.
 * 
 * @param isAssigned - Boolean indicating if the client is assigned to the current user.
 * @returns A Leaflet DivIcon containing the SVG.
 */
const createWineIcon = (isAssigned: boolean) => {
    const strokeColor = isAssigned ? '#be123c' : '#6b7280';
    const gradientId = `wine-gradient-${isAssigned ? 'assigned' : 'unassigned'}`;
    const liquidColor = '#be123c';

    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="${strokeColor}" stroke-width="${isAssigned ? '1.5' : '2'}" stroke-linecap="round" stroke-linejoin="round" class="drop-shadow-md filter">
        <defs>
            <linearGradient id="${gradientId}" x1="0" y1="0" x2="0" y2="1">
                <stop offset="55%" stop-color="${liquidColor}" stop-opacity="0" />
                <stop offset="55%" stop-color="${liquidColor}" stop-opacity="1" />
            </linearGradient>
        </defs>
        <path d="M8 22h8" />
        ${isAssigned ? '<path d="M7 10h10" />' : ''}
        <path d="M12 15v7" />
        <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" fill="${isAssigned ? `url(#${gradientId})` : 'none'}" />
    </svg>`;

    return L.divIcon({
        className: 'bg-transparent border-none', // Remove default square bg
        html: svg, // Use SVG string directly
        iconSize: [36, 36],
        iconAnchor: [18, 36], // Centered bottom
        popupAnchor: [0, -34]
    });
};

const assignedIcon = createWineIcon(true);
const unassignedIcon = createWineIcon(false);

interface ClientMapData {
    id: string;
    nombre: string;
    direccion: string;
    telefono: string;
    latitud: number;
    longitud: number;
    assignedToMe: boolean;
}

/**
 * Commercial Map Component.
 * 
 * Displays a map interface identifying client locations.
 * Differentiates between clients assigned to the signed-in commercial agent and others.
 * Provides navigation and contact shortcuts via popups.
 */
export const MapaComercial = () => {
    const { usuario } = useAuthStore();
    const [clients, setClients] = useState<ClientMapData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClients = async () => {
            try {
                const data = await clientesService.getMapData(usuario?.id);
                setClients(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (usuario?.id) fetchClients();
    }, [usuario?.id]);

    // Default center (Tenerife)
    const center: [number, number] = [28.291564, -16.629130];

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="w-8 h-8 border-4 rounded-full border-primary-600 border-t-transparent animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-secondary-900">Mapa de Clientes</h2>
                    <p className="text-secondary-600">Visualiza tu cartera y oportunidades cercanas.</p>
                </div>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#be123c]"></span>
                        <span className="text-secondary-700">Mis Clientes</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-gray-500"></span>
                        <span className="text-secondary-700">Otros</span>
                    </div>
                </div>
            </div>

            <div className="h-[calc(100vh-12rem)] w-full rounded-xl overflow-hidden border border-secondary-200 shadow-sm relative z-0">
                {typeof window !== 'undefined' && (
                    <MapContainer center={center} zoom={10} style={{ height: '100%', width: '100%' }}>
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                            attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                        />
                        {clients.map(client => (
                            <Marker
                                key={client.id}
                                position={[client.latitud, client.longitud]}
                                icon={client.assignedToMe ? assignedIcon : unassignedIcon}
                            >
                                <Popup className="custom-popup">
                                    <div className="py-2 min-w-[220px]">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2 leading-tight">{client.nombre}</h3>

                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-start gap-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-400" />
                                                <span>{client.direccion}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-4 h-4 flex-shrink-0 text-gray-400" />
                                                <span>{client.telefono}</span>
                                            </div>
                                        </div>

                                        {client.assignedToMe ? (
                                            <a
                                                href={`https://www.google.com/maps/dir/?api=1&destination=${client.latitud},${client.longitud}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: '#FDFBF7' }}
                                                className="flex items-center justify-center gap-2 w-full bg-[#722F37] !text-[#FDFBF7] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#59232b] transition-colors shadow-sm no-underline"
                                            >
                                                <Navigation className="w-4 h-4 text-[#FDFBF7]" />
                                                <span className="text-[#FDFBF7]">Ir ahora</span>
                                            </a>
                                        ) : (
                                            <div className="bg-gray-100 text-gray-500 px-3 py-1.5 rounded-lg text-xs font-medium text-center border border-gray-200">
                                                Cliente no asignado
                                            </div>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                )}
            </div>
        </div>
    );
};
