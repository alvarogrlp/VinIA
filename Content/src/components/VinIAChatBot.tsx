import { useState, useEffect, useRef } from 'react';
import { Send, Mic, X, Loader2, Sparkles, ShoppingCart, User, Minus } from 'lucide-react';
import { useLocation } from 'react-router-dom'; // For context
import { aiService } from '../services/ai.service';
import { usePedidosStore, useVinosStore } from '../store';


/**
 * Interface representing a chat message in the conversation.
 */
interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    action?: string;
    data?: any;
    timestamp: Date;
}

/**
 * VinIAChatBot Component
 * 
 * An intelligent virtual assistant component integrated into the VinIA application.
 * It provides the following functionalities:
 * - Natural language interaction with the user.
 * - Context-aware responses based on the current screen (e.g., client details).
 * - Voice recognition for hands-free operation.
 * - Execution of actions such as creating orders and providing wine recommendations.
 * - Glassmorphism UI design with minimize and close capabilities.
 * 
 * @returns {JSX.Element} The rendered ChatBot component.
 */
export const VinIAChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [input, setInput] = useState('');

    // Initial State Definition
    const initialMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        text: '¡Hola! Soy VinIA, tu asistente inteligente. ¿En qué puedo ayudarte?',
        timestamp: new Date()
    };

    const [messages, setMessages] = useState<Message[]>([initialMessage]);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [inputEnabled, setInputEnabled] = useState(false);

    const [activeFlow, setActiveFlow] = useState<'RECOMMENDATION' | 'HISTORY' | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Stores
    const { crearPedido, agregarLineaPedido, guardarPedido } = usePedidosStore();
    const { vinos, cargarVinos } = useVinosStore();

    // Auto-scroll logic
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, isOpen]);

    // Initial load of wines for catalog context
    useEffect(() => {
        if (vinos.length === 0) cargarVinos();
    }, [cargarVinos, vinos.length]);

    /**
     * Resets the chat state to its initial configuration.
     * Clears user messages, input, and active flows.
     */
    const resetChat = () => {
        setMessages([initialMessage]);
        setShowQuickActions(true);
        setInputEnabled(false);
        setInput('');
        setActiveFlow(null);
    };

    /**
     * Handles the close action.
     * Triggers the closing animation and then resets the state.
     */
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
            resetChat();
        }, 300);
    };

    /**
     * Handles the minimize action.
     * Triggers the closing animation but preserves the current chat state.
     */
    const handleMinimize = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 300);
    };

    /**
     * Toggles the voice recognition functionality.
     * 
     * Uses the Web Speech API (if available) to capture user audio
     * and convert it to text input.
     */
    const toggleRecording = () => {
        const win = window as any;
        const SpeechRecognition = win.webkitSpeechRecognition || win.SpeechRecognition;

        if (!SpeechRecognition) {
            alert("Tu navegador no soporta reconocimiento de voz.");
            return;
        }

        if (isRecording) {
            setIsRecording(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsRecording(true);
        recognition.onend = () => setIsRecording(false);
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput(transcript);
            handleSend(transcript);
        };
        recognition.onerror = () => setIsRecording(false);

        recognition.start();
    };

    /**
     * Handles the execution of quick actions selected by the user.
     * 
     * @param action - The identifier of the action to perform (e.g., 'create_order', 'recommendations').
     */
    const handleQuickAction = (action: string) => {
        let message = '';
        setShowQuickActions(false);

        if (action === 'create_order') {
            const userMsg: Message = {
                id: Date.now().toString(),
                role: 'user',
                text: 'Quiero crear un pedido',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMsg]);

            setTimeout(() => {
                const assistantMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: '¡Entendido! 📝\n\nDime, ¿para qué cliente es el pedido y qué vinos necesitas añadir?\n\n💡 Ej: "Quiero 3 botellas de Tajinaste Tinto para El Calderito"',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMsg]);
                setInputEnabled(true);
            }, 600);
            return;
        }

        if (action === 'recommendations') {
            setActiveFlow('RECOMMENDATION');
            const userMsg: Message = {
                id: Date.now().toString(),
                role: 'user',
                text: 'Dame recomendaciones de vinos',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMsg]);

            setTimeout(() => {
                const assistantMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: 'Claro, soy tu sumiller virtual. 🍷\n\n¿Para qué cliente necesitas las recomendaciones?',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMsg]);
                setInputEnabled(true);
            }, 600);
            return;
        }

        if (action === 'history') {
            setActiveFlow('HISTORY');
            const userMsg: Message = {
                id: Date.now().toString(),
                role: 'user',
                text: 'Consulta el historial de pedidos',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, userMsg]);

            setTimeout(() => {
                const assistantMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    text: 'Sin problema. 📋\n\n¿Qué quieres saber y de qué cliente? (Ej: "Últimos pedidos de El Calderito" o "¿El Calderito ha pedido Tajinaste?")',
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMsg]);
                setInputEnabled(true);
            }, 600);
            return;
        }

        handleSend(message);
    };

    /**
     * Main function to handle sending messages.
     * 
     * - Adds the user's message to the state.
     * - Gathers context (current page, client ID).
     * - Calls the AI service.
     * - Processes the AI response and any associated actions (e.g., creating an order).
     * 
     * @param textOverride - Optional text to send (used for quick actions or voice input).
     */
    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        setShowQuickActions(false);

        // 1. Add User Message
        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: textToSend,
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            // 2. Prepare Context (Current Screen, Client ID from URL if any)
            const pathParts = location.pathname.split('/');
            let clienteId = '';
            if (location.pathname.includes('/clientes/') && pathParts.length > 0) {
                clienteId = pathParts[pathParts.length - 1];
            }

            const context = {
                screen: location.pathname,
                clienteId: clienteId || '',
                activeFlow: activeFlow
            };

            // 3. Call AI
            const response = await aiService.chat(textToSend, context);



            // 4. Handle Action
            let actionFeedback = "";
            let actionData = response.data;

            if (response.action === "CREATE_ORDER") {
                const items = actionData?.items || [];
                if (items.length > 0) {
                    const targetClienteId = actionData?.clienteId || clienteId;

                    if (!targetClienteId) {
                        actionFeedback = " (Nota: No pude identificar el cliente. Por favor, especifica el nombre del cliente o ve a su ficha)";
                    } else {
                        crearPedido(targetClienteId);
                        let addedCount = 0;
                        items.forEach((item: any) => {
                            const vino = vinos.find(v => v.id === item.vinoId);
                            if (vino) {
                                const tipoBulto = item.tipoBulto || 'BOTELLA';
                                const cantidadBultos = item.cantidad || 1;
                                const botellasPorBulto = tipoBulto === 'CAJA' ? (vino.botellas_por_caja || 6) : 1;
                                const totalBotellas = cantidadBultos * botellasPorBulto;

                                agregarLineaPedido({
                                    vinoId: vino.id,
                                    vinoNombre: vino.nombre,
                                    vino: vino,
                                    cantidad: totalBotellas,
                                    precioUnitario: vino.precio_unitario,
                                    descuento: 0,
                                    subtotal: totalBotellas * vino.precio_unitario,
                                    tipoBulto: tipoBulto,
                                    cantidadBultos: cantidadBultos
                                });
                                addedCount++;
                            }
                        });
                        if (addedCount > 0) {
                            await guardarPedido('BORRADOR');
                            actionFeedback = " ✅ Pedido borrador creado con éxito.";
                        } else {
                            actionFeedback = " ⚠️ No pude encontrar los vinos exactos en el catálogo.";
                        }

                        // Reset chat after action completion
                        if (addedCount > 0) {
                            setTimeout(resetChat, 3500);
                        }
                    }
                }
            }

            // 5. Add Bot Message
            const replyText = response.reply || response.message || "Lo siento, no pude procesar tu solicitud.";
            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: replyText + actionFeedback,
                action: response.action,
                data: response.data,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, botMsg]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'assistant',
                text: `Lo siento, tuve un problema de conexión.
                
Detalles técnicos: ${error instanceof Error ? error.message : String(error)}

Posibles causas:
1. El backend no se está ejecutando o no es accesible.
2. Problema de configuración CORS (revisa si http://localhost:3000 está permitido).
3. La API Key de OpenAI/Gemini no es válida o se ha excedido la cuota.

Intenta reiniciar el backend.`,
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const isNuevoPedido = location.pathname.includes('nuevo') || location.pathname.includes('editar');

    if (!isOpen && !isClosing) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed right-6 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-500 z-50 group overflow-hidden transform hover:scale-110 shadow-[0_4px_20px_rgba(184,148,90,0.6)] backdrop-blur-md border border-primary-400/50 bg-gradient-to-br from-primary-500/90 to-primary-700/90 hover:from-primary-500 hover:to-primary-600 ring-2 ring-white/20 ${isNuevoPedido ? 'bottom-24 lg:bottom-6' : 'bottom-6'}`}
                title="Abrir Asistente VinIA"
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
                <div className="relative w-9 h-9 flex items-center justify-center">
                    <img src="/VinIA_Logo.png" alt="VinIA" className="w-full h-full object-contain filter brightness-0 invert opacity-95 group-hover:scale-110 transition-transform duration-300 drop-shadow-sm" />
                </div>
            </button>
        );
    }

    return (
        <div className={`fixed right-6 w-[380px] h-[600px] max-h-[85vh] bg-white/90 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden z-50 border border-white/50 ${isClosing ? 'animate-shrink-down' : 'animate-grow-up'} font-sans ring-1 ring-black/5 ${isNuevoPedido ? 'bottom-24 lg:bottom-6' : 'bottom-6'}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-primary-700 to-primary-900 p-4 flex items-center justify-between text-white shrink-0 shadow-md relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('/VinIA_Logo.png')] bg-no-repeat bg-[length:150%] bg-center opacity-5 mix-blend-overlay pointer-events-none"></div>
                <div className="flex items-center gap-3 relative z-10">
                    <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm shadow-inner">
                        <Sparkles className="w-5 h-5 text-primary-200" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg font-mono tracking-tight text-white drop-shadow-sm">VinIA <span className="text-primary-300">Assistant</span></h3>
                        <p className="text-xs text-primary-200/80 flex items-center gap-1.5 font-mono">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]"></span>
                            SYSTEM ONLINE
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1 relative z-10">
                    <button
                        onClick={handleMinimize}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/80 hover:text-white"
                        title="Minimizar"
                    >
                        <Minus className="w-5 h-5" />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-red-500/20 hover:text-red-300 rounded-full transition-colors text-white/80"
                        title="Cerrar y reiniciar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50 scrollbar-thin scrollbar-thumb-primary-200/50 scrollbar-track-transparent">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.role === 'user'
                                ? 'bg-primary-600 text-white rounded-tr-none border border-primary-500 shadow-md shadow-primary-900/10'
                                : 'bg-white text-secondary-800 border border-secondary-200 rounded-tl-none shadow-sm'
                                }`}
                        >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                            {/* Actions Render */}
                            {msg.action === 'RECOMMENDATION' && msg.data?.vinos && (
                                <div className="mt-3 space-y-2">
                                    {msg.data.vinos.map((vino: any, idx: number) => (
                                        <div key={idx} className="bg-secondary-50 p-2 rounded border border-secondary-200 text-xs text-left">
                                            <div className="font-bold text-secondary-900">{vino.nombre}</div>
                                            <div className="text-secondary-600">{vino.razon}</div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <span className="text-[10px] opacity-70 mt-1 block text-right">
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Quick Actions */}
                {showQuickActions && messages.length === 1 && (
                    <div className="flex justify-start">
                        <div className="max-w-[85%] space-y-2">
                            <p className="text-xs text-secondary-600 mb-2 font-medium ml-1">Acciones rápidas:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleQuickAction('create_order')}
                                    className="flex items-center gap-2 p-3 bg-white border border-secondary-200 rounded-xl hover:border-primary-400 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                                >
                                    <div className="p-1.5 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
                                        <ShoppingCart className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-secondary-900">Crear Pedido</div>
                                        <div className="text-[10px] text-secondary-500">Nuevo pedido</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleQuickAction('recommendations')}
                                    className="flex items-center gap-2 p-3 bg-white border border-secondary-200 rounded-xl hover:border-primary-400 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                                >
                                    <div className="p-1.5 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
                                        <Sparkles className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-secondary-900">Recomendar</div>
                                        <div className="text-[10px] text-secondary-500">Sugerencias AI</div>
                                    </div>
                                </button>


                                <button
                                    onClick={() => handleQuickAction('history')}
                                    className="flex items-center gap-2 p-3 bg-white border border-secondary-200 rounded-xl hover:border-primary-400 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group"
                                >
                                    <div className="p-1.5 rounded-lg bg-primary-50 group-hover:bg-primary-100 transition-colors">
                                        <User className="w-4 h-4 text-primary-600" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-bold text-secondary-900">Historial</div>
                                        <div className="text-[10px] text-secondary-500">Ver pedidos</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white rounded-2xl rounded-tl-none p-3 border border-secondary-200 shadow-sm flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-1.5 h-1.5 bg-secondary-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            {inputEnabled ? (
                <div className="p-4 bg-white border-t border-secondary-200 shrink-0">
                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleRecording}
                            className={`p-2 rounded-full transition-colors ${isRecording
                                ? 'bg-red-500 text-white animate-pulse shadow-red-200'
                                : 'bg-secondary-100 text-secondary-600 hover:bg-secondary-200'
                                }`}
                            title="Dictar mensaje"
                        >
                            <Mic className="w-5 h-5" />
                        </button>

                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Escribe o dicta tu mensaje..."
                            className="flex-1 bg-secondary-50 border border-secondary-200 focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500 rounded-xl px-4 py-2 text-sm transition-all outline-none placeholder:text-secondary-400"
                            disabled={isTyping}
                            autoFocus
                        />

                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="p-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
                        >
                            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-3 bg-secondary-50 text-center border-t border-secondary-200 shrink-0">
                    <p className="text-xs text-secondary-500 italic py-2">Selecciona una opción para comenzar</p>
                </div>
            )}
        </div>
    );
};
