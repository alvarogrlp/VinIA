import React, { useRef, useState } from 'react';
import { Upload, X } from 'lucide-react';

interface ImageUploadProps {
    label?: string;
    initialImage?: string;
    onImageChange: (base64: string | null) => void;
    className?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
    label = 'Imagen',
    initialImage,
    onImageChange,
    className = ''
}) => {
    const [preview, setPreview] = useState<string | null>(initialImage || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleFile = (file: File) => {
        setError(null);
        if (!file.type.startsWith('image/')) {
            setError('Por favor, selecciona un archivo de imagen válido.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setError('La imagen es demasiado grande (máx 5MB).');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result as string;
            setPreview(base64);
            onImageChange(base64);
        };
        reader.onerror = () => {
            setError('Error al leer el archivo.');
        };
        reader.readAsDataURL(file);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const removeImage = () => {
        setPreview(null);
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            {label && <label className="block text-sm font-medium text-secondary-700">{label}</label>}

            <div
                className={`relative border-2 border-dashed rounded-lg p-4 text-center transition-colors
          ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-secondary-300 hover:border-primary-400'}
          ${error ? 'border-red-500 bg-red-50' : ''}
        `}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleChange}
                />

                {preview ? (
                    <div className="relative inline-block">
                        <img
                            src={preview}
                            alt="Preview"
                            className="max-h-64 rounded-lg shadow-sm object-contain mx-auto"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute -top-2 -right-2 p-1 bg-red-100 text-red-600 rounded-full hover:bg-red-200 shadow-sm"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                ) : (
                    <div
                        className="cursor-pointer py-8 flex flex-col items-center justify-center text-secondary-500 hover:text-primary-600"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Upload className="w-10 h-10 mb-2 opacity-70" />
                        <p className="text-sm font-medium">
                            Haz clic o arrastra una imagen aquí
                        </p>
                        <p className="text-xs mt-1 text-secondary-400">
                            JPG, PNG, WEBP (Máx 5MB)
                        </p>
                    </div>
                )}
            </div>
            {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
        </div>
    );
};
