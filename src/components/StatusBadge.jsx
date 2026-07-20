import React from 'react';

export default function StatusBadge({ status }) {
  const config = {
    pending: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
    confirmed: { bg: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)' },
    no_answer: { bg: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', border: 'rgba(249, 115, 22, 0.3)' },
    rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
  };

  const style = config[status] || config.pending;

  // Format status for display
  const displayStatus = status.replace(/_/g, ' ');

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
      {displayStatus}
    </span>
  );
}
