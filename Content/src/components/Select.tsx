import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    value: string | number;
    label: string;
}

interface SelectProps {
    label?: string;
    value: string | number;
    onChange: (value: any) => void;
    options: Option[];
    placeholder?: string;
    className?: string;
    error?: string;
    disabled?: boolean;
}

export const Select = ({
    label,
    value,
    onChange,
    options,
    placeholder = "Seleccionar...",
    className = "",
    error,
    disabled = false
}: SelectProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
    };

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            {label && <label className="block text-sm font-medium text-secondary-700 mb-1">{label}</label>}

            <div
                className={`w-full bg-white border rounded-lg px-4 py-2.5 text-left cursor-pointer flex items-center justify-between transition-all duration-200 select-none
          ${error ? 'border-red-300 focus:border-red-500 focus:ring-red-200' : 'border-secondary-300 hover:border-primary-400'}
          ${disabled ? 'bg-secondary-50 cursor-not-allowed opacity-75' : 'hover:shadow-sm'}
          ${isOpen ? 'border-primary-500 ring-2 ring-primary-100 shadow-sm' : ''}
        `}
                onClick={() => !disabled && setIsOpen(!isOpen)}
            >
                <span className={`block truncate ${!selectedOption && !value ? 'text-secondary-400' : 'text-secondary-900'}`}>
                    {selectedOption ? selectedOption.label : (value || placeholder)}
                </span>
                <ChevronDown
                    className={`w-4 h-4 text-secondary-500 transition-transform duration-200 ${isOpen ? 'transform rotate-180 text-primary-600' : ''}`}
                />
            </div>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white border border-secondary-100 rounded-lg shadow-elegant-lg py-1 max-h-60 overflow-auto animate-fade-in origin-top">
                    <ul className="py-0.5">
                        {options.map((option) => (
                            <li
                                key={option.value}
                                className={`px-4 py-2.5 text-sm cursor-pointer transition-colors flex items-center justify-between group
                  ${option.value === value ? 'bg-primary-50 text-primary-900 font-medium' : 'text-secondary-700 hover:bg-secondary-50 hover:text-primary-800'}
                `}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span className="truncate">{option.label}</span>
                                {option.value === value && <Check className="w-4 h-4 text-primary-600" />}
                            </li>
                        ))}
                        {options.length === 0 && (
                            <li className="px-4 py-3 text-sm text-secondary-400 italic text-center">No hay opciones disponibles</li>
                        )}
                    </ul>
                </div>
            )}

            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>
    );
};
