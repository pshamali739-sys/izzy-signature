import React from 'react';

export default function StatusBadge({ status }) {
  const config = {
    pending: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
    confirmed: { bg: 'rgba(245, 158, 11, 0.15)', color: '#fcd34d', border: 'rgba(245, 158, 11, 0.3)' },
    shipped: { bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
    delivered: { bg: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)' },
    cancelled: { bg: 'rgba(107, 114, 128, 0.15)', color: '#d1d5db', border: 'rgba(107, 114, 128, 0.3)' },
  };

  const style = config[status] || config.pending;

  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.color,
      border: `1px solid ${style.border}`,
      padding: '0.25rem 0.75rem',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    }}>
      {status}
    </span>
  );
}
