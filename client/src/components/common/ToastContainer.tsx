import React from 'react';
import { Toast } from '../../types';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      maxWidth: '380px',
      width: '100%',
      pointerEvents: 'none'
    }}>
      {toasts.map(toast => {
        let bgColor = '#1C1917';
        let borderColor = '#292524';
        let IconComponent = Info;
        let iconColor = '#60A5FA';

        if (toast.type === 'success') {
          bgColor = '#064E3B';
          borderColor = '#059669';
          IconComponent = CheckCircle2;
          iconColor = '#34D399';
        } else if (toast.type === 'error') {
          bgColor = '#7F1D1D';
          borderColor = '#DC2626';
          IconComponent = AlertCircle;
          iconColor = '#F87171';
        } else if (toast.type === 'warning') {
          bgColor = '#78350F';
          borderColor = '#D97706';
          IconComponent = AlertTriangle;
          iconColor = '#FBBF24';
        }

        return (
          <div
            key={toast.id}
            style={{
              pointerEvents: 'auto',
              backgroundColor: bgColor,
              border: `1px solid ${borderColor}`,
              color: '#F5F5F4',
              borderRadius: '10px',
              padding: '0.85rem 1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              fontSize: '0.9rem',
              fontWeight: 500,
              animation: 'slideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <IconComponent size={18} style={{ color: iconColor, flexShrink: 0 }} />
              <span>{toast.message}</span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                color: '#A8A29E',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: '4px'
              }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
