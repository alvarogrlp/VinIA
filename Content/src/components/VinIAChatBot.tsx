import React, { useState, useEffect, useRef } from 'react';
import { Send, Mic, X, MessageSquare, Loader2, Sparkles, ShoppingCart, User } from 'lucide-react';
import { useLocation } from 'react-router-dom'; // For context
import { aiService } from '../services/ai.service';
import { usePedidosStore, useVinosStore } from '../store';
import type { Vino } from '../types';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    text: string;
    action?: string;
    data?: any;
    timestamp: Date;
}

export const VinIAChatBot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'assistant',
            text: '¡Hola! Soy VinIA, tu asistente inteligente. ¿En qué puedo ayudarte?',
            timestamp: new Date()
        }
    ]);
    const [isTyping, setIsTyping] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [showQuickActions, setShowQuickActions] = useState(true);
    const [inputEnabled, setInputEnabled] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const location = useLocation();

    // Stores
    const { crearPedido, agregarLineaPedido, guardarPedido } = usePedidosStore();
    const { vinos, obtenerVino, cargarVinos } = useVinosStore();

    // Auto-scroll logic
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping, isOpen]);

    // Initial load of wines for catalog context
    useEffect(() => {
        if (vinos.length === 0) cargarVinos();
    }, [cargarVinos, vinos.length]);

    // Handle Voice
    const toggleRecording = () => {
        const win = window as any;
        const SpeechRecognition = win.webkitSpeechRecognition || win.SpeechRecognition;

        if (!SpeechRecognition) {
            alert("Tu navegador no soporta reconocimiento de voz.");
            return;
        }

        if (isRecording) {
            // Stop handled by 'end' event usually, but we can force functionality if needed
            // For now, let's rely on the native object if we had the instance stored.
            // Simplified: Just toggle state UI, the recognition logic below handles one-shot.
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
            handleSend(transcript); // Auto-send on voice end? Optional. Let's send it.
        };
        recognition.onerror = () => setIsRecording(false);

        recognition.start();
    };

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

        switch (action) {
            case 'catalog':
                message = 'Muéstrame el catálogo de vinos disponibles';
                setInputEnabled(true);
                break;
            case 'recommendations':
                message = 'Dame recomendaciones de vinos';
                setInputEnabled(true);
                break;
            case 'history':
                message = 'Consulta el historial de pedidos';
                setInputEnabled(true);
                break;
        }
        handleSend(message);
    };

    const handleSend = async (textOverride?: string) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        setShowQuickActions(false); // Hide quick actions after first message

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
            // Extract Client ID from path /clientes/detalle/:id
            const pathParts = location.pathname.split('/');
            let clienteId = '';
            if (location.pathname.includes('/clientes/') && pathParts.length > 0) {
                // rough check, can be improved
                clienteId = pathParts[pathParts.length - 1];
            }

            const context = {
                screen: location.pathname,
                clienteId: clienteId || ''
            };

            // 3. Call AI
            const response = await aiService.chat(textToSend, context);

            console.log("AI Response:", response);

            // 4. Handle Action
            let actionFeedback = "";
            let actionData = response.data;

            if (response.action === "CREATE_ORDER") {
                const items = actionData?.items || [];
                if (items.length > 0) {
                    // Use clienteId from AI response if available, otherwise use current context
                    const targetClienteId = actionData?.clienteId || clienteId;

                    if (!targetClienteId) {
                        actionFeedback = " (Nota: No pude identificar el cliente. Por favor, especifica el nombre del cliente o ve a su ficha)";
                    } else {
                        crearPedido(targetClienteId);
                        let addedCount = 0;
                        items.forEach((item: any) => {
                            const vino = vinos.find(v => v.id === item.vinoId);
                            if (vino) {
                                agregarLineaPedido({
                                    vinoId: vino.id,
                                    vinoNombre: vino.nombre,
                                    vino: vino,
                                    cantidad: item.cantidad || 1,
                                    precioUnitario: vino.precio_unitario,
                                    descuento: 0,
                                    subtotal: 0
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
                text: "Lo siento, tuve un problema de conexión. ¿Podrías repetirlo?",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-16 h-16 bg-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 transition-transform z-50 group border-2 border-primary-500 overflow-hidden"
                title="Abrir Asistente VinIA"
            >
                <div className="absolute inset-0 bg-primary-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                <img src="/VinIA_Logo.png" alt="VinIA" className="w-12 h-12 object-contain" />
                {/* Notification Badge if needed */}
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[85vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 border border-secondary-200 animate-slide-up font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center justify-between text-white shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">VinIA Assistant</h3>
                        <p className="text-xs text-indigo-100 flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                            En línea
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-secondary-50">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-3 shadow-sm ${msg.role === 'user'
                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                : 'bg-white text-secondary-800 border border-secondary-200 rounded-tl-none'
                                }`}
                        >
                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                            {/* Actions Render */}
                            {msg.action === 'RECOMMENDATION' && msg.data?.vinos && (
                                <div className="mt-3 space-y-2">
                                    {msg.data.vinos.map((vino: any, idx: number) => (
                                        <div key={idx} className="bg-secondary-50 p-2 rounded border border-secondary-200 text-xs">
                                            <div className="font-bold text-indigo-700">{vino.nombre}</div>
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
                            <p className="text-xs text-secondary-600 mb-2">Acciones rápidas:</p>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={() => handleQuickAction('create_order')}
                                    className="flex items-center gap-2 p-3 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-400 transition-all text-left group"
                                >
                                    <ShoppingCart className="w-4 h-4 text-indigo-600" />
                                    <div>
                                        <div className="text-xs font-semibold text-secondary-900">Crear Pedido</div>
                                        <div className="text-[10px] text-secondary-500">Nuevo pedido</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleQuickAction('recommendations')}
                                    className="flex items-center gap-2 p-3 bg-white border border-purple-200 rounded-lg hover:bg-purple-50 hover:border-purple-400 transition-all text-left group"
                                >
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                    <div>
                                        <div className="text-xs font-semibold text-secondary-900">Recomendaciones</div>
                                        <div className="text-[10px] text-secondary-500">Sugerencias IA</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleQuickAction('catalog')}
                                    className="flex items-center gap-2 p-3 bg-white border border-green-200 rounded-lg hover:bg-green-50 hover:border-green-400 transition-all text-left group"
                                >
                                    <MessageSquare className="w-4 h-4 text-green-600" />
                                    <div>
                                        <div className="text-xs font-semibold text-secondary-900">Ver Catálogo</div>
                                        <div className="text-[10px] text-secondary-500">Consultar vinos</div>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleQuickAction('history')}
                                    className="flex items-center gap-2 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 hover:border-blue-400 transition-all text-left group"
                                >
                                    <User className="w-4 h-4 text-blue-600" />
                                    <div>
                                        <div className="text-xs font-semibold text-secondary-900">Historial</div>
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
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-150"></span>
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
                                ? 'bg-red-100 text-red-600 animate-pulse'
                                : 'bg-secondary-100 text-secondary-500 hover:bg-secondary-200'
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
                            className="flex-1 bg-secondary-100 border-transparent focus:bg-white focus:border-indigo-500 rounded-full px-4 py-2 text-sm transition-all"
                            disabled={isTyping}
                            autoFocus
                        />

                        <button
                            onClick={() => handleSend()}
                            disabled={!input.trim() || isTyping}
                            className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                        >
                            {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                        </button>
                    </div>
                </div>
            ) : (
                <div className="p-3 bg-secondary-50 text-center border-t border-secondary-100 shrink-0">
                    <p className="text-xs text-secondary-400 italic py-2">Selecciona una opción para comenzar</p>
                </div>
            )}
        </div>
    );
};
