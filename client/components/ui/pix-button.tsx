import React from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { brazilianConstants } from '../../design-system/tokens';
import { QrCode, Copy, Clock, Check } from 'lucide-react';
import { useMobileAdvanced } from '../../hooks/use-mobile-advanced';

interface PixButtonProps {
  amount?: number;
  pixKey?: string;
  recipient?: string;
  description?: string;
  variant?: 'default' | 'outline' | 'generate' | 'copy';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  success?: boolean;
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
}

/**
 * PixButton - Componente brasileiro para transações PIX
 * Otimizado para mobile (80% dos usuários brasileiros)
 */
export const PixButton: React.FC<PixButtonProps> = ({
  amount,
  pixKey,
  recipient,
  description,
  variant = 'default',
  size = 'md',
  loading = false,
  success = false,
  onClick,
  className,
  children,
  ...props
}) => {
  const { isMobile } = useMobileAdvanced();

  // Formatação brasileira do valor
  const formatAmount = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Ícones por variante
  const getIcon = () => {
    if (loading) return <Clock className="h-4 w-4 animate-spin" />;
    if (success) return <Check className="h-4 w-4" />;
    
    switch (variant) {
      case 'generate':
        return <QrCode className="h-4 w-4" />;
      case 'copy':
        return <Copy className="h-4 w-4" />;
      default:
        return <span className="font-bold">{brazilianConstants.emojis.pix}</span>;
    }
  };

  // Texto por variante
  const getText = () => {
    if (children) return children;
    
    switch (variant) {
      case 'generate':
        return isMobile ? 'Gerar QR' : 'Gerar PIX QR';
      case 'copy':
        return isMobile ? 'Copiar PIX' : 'Copiar Chave PIX';
      case 'outline':
        return isMobile ? 'PIX' : 'Pagar com PIX';
      default:
        if (amount) {
          return isMobile ? `PIX ${formatAmount(amount)}` : `Pagar ${formatAmount(amount)} via PIX`;
        }
        return isMobile ? 'PIX' : 'Pagar com PIX';
    }
  };

  // Classes de estilo por variante
  const getVariantClasses = () => {
    const baseClasses = 'transition-all duration-200 font-medium';
    
    switch (variant) {
      case 'generate':
        return `${baseClasses} bg-green-600 hover:bg-green-700 text-white border-green-600`;
      case 'copy':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 text-white border-blue-600`;
      case 'outline':
        return `${baseClasses} border-2 border-green-600 text-green-700 hover:bg-green-50 bg-white`;
      default:
        return `${baseClasses} bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl`;
    }
  };

  // Tamanhos otimizados para mobile brasileiro
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return isMobile ? 'h-10 px-4 text-sm' : 'h-9 px-3 text-sm';
      case 'lg':
        return isMobile ? 'h-14 px-6 text-lg' : 'h-12 px-6 text-base';
      default: // md
        return isMobile ? 'h-12 px-5 text-base' : 'h-10 px-4 text-sm';
    }
  };

  return (
    <Button
      onClick={onClick}
      disabled={loading}
      className={cn(
        getVariantClasses(),
        getSizeClasses(),
        'relative overflow-hidden',
        // Mobile: touch target mínimo 44px
        isMobile && 'min-h-[44px]',
        // Efeito visual brasileiro
        'hover:scale-105 active:scale-95',
        // Estado de sucesso
        success && 'bg-green-700 hover:bg-green-700',
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center space-x-2">
        {getIcon()}
        <span>{getText()}</span>
      </div>
      
      {/* Tooltip com informações PIX */}
      {(pixKey || recipient) && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10">
          {recipient && <div>{recipient}</div>}
          {pixKey && <div className="text-gray-300">{pixKey}</div>}
        </div>
      )}
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <Clock className="h-4 w-4 animate-spin text-white" />
        </div>
      )}
      
      {/* Success overlay */}
      {success && (
        <div className="absolute inset-0 bg-green-600 bg-opacity-20 flex items-center justify-center">
          <Check className="h-4 w-4 text-green-700" />
        </div>
      )}
    </Button>
  );
};

// Componente simplificado para valores específicos
export const PixPayment: React.FC<{
  amount: number;
  description?: string;
  onPay: () => void;
  className?: string;
}> = ({ amount, description, onPay, className }) => {
  const { isMobile } = useMobileAdvanced();
  
  return (
    <div className={cn('flex flex-col space-y-2', className)}>
      {description && (
        <p className={`text-gray-600 ${isMobile ? 'text-sm' : 'text-base'}`}>
          {description}
        </p>
      )}
      <PixButton
        amount={amount}
        size={isMobile ? 'lg' : 'md'}
        onClick={onPay}
        className="w-full"
      />
      <p className={`text-xs text-gray-500 text-center ${isMobile ? 'block' : 'hidden'}`}>
        🔒 Pagamento seguro via PIX
      </p>
    </div>
  );
};

export default PixButton;
