/**
 * VinIA - Componente Loading
 * 
 * Indicador de carga reutilizable con diferentes tamaños
 */

interface LoadingProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const Loading = ({ size = 'md', text }: LoadingProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div
        className={`${sizeClasses[size]} border-4 rounded-full border-primary-500 border-t-transparent animate-spin`}
      ></div>
      {text && (
        <p className="text-sm font-medium text-secondary-600">{text}</p>
      )}
    </div>
  );
};
