import React from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    onCancel?: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info' | 'success';
    showCancel?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    onCancel,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'warning',
    showCancel = true,
}) => {
    if (!isOpen) return null;

    const getIcon = () => {
        switch (type) {
            case 'danger':
                return <AlertTriangle className="w-10 h-10 text-red-500" />;
            case 'warning':
                return <AlertTriangle className="w-10 h-10 text-amber-500" />;
            case 'success':
                return <CheckCircle className="w-10 h-10 text-green-500" />;
            case 'info':
            default:
                return <Info className="w-10 h-10 text-blue-500" />;
        }
    };

    const getButtonStyles = () => {
        switch (type) {
            case 'danger':
                return 'bg-red-600 hover:bg-red-700 text-white';
            case 'warning':
                return 'bg-amber-600 hover:bg-amber-700 text-white';
            case 'success':
                return 'bg-green-600 hover:bg-green-700 text-white';
            case 'info':
            default:
                return 'bg-secondary-900 hover:bg-secondary-800 text-white';
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-secondary-400 hover:text-secondary-600 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="p-6">
                    <div className="flex flex-col items-center text-center">
                        <div className="mb-4 p-3 bg-secondary-50 rounded-full">
                            {getIcon()}
                        </div>

                        <h3 className="text-xl font-bold text-secondary-900 mb-2">
                            {title}
                        </h3>

                        <p className="text-secondary-600 mb-8 leading-relaxed whitespace-pre-wrap">
                            {message}
                        </p>

                        <div className="flex gap-3 w-full">
                            {showCancel && (
                                <button
                                    onClick={() => {
                                        if (onCancel) onCancel();
                                        onClose();
                                    }}
                                    className="flex-1 px-4 py-2 border border-secondary-300 text-secondary-700 font-medium rounded-lg hover:bg-secondary-50 transition-colors"
                                >
                                    {cancelText}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className={`flex-1 px-4 py-2 font-medium rounded-lg shadow-sm transition-colors ${getButtonStyles()}`}
                            >
                                {confirmText}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
