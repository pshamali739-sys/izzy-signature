import React from 'react';

export default function StatusBadge({ status }) {
  const config = {
    pending: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
    confirmed: { bg: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)' },
    no_answer: { bg: 'rgba(249, 115, 22, 0.15)', color: '#fdba74', border: 'rgba(249, 115, 22, 0.3)' },
    rejected: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
    packing: { bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
    ready_for_courier: { bg: 'rgba(168, 85, 247, 0.15)', color: '#c4b5fd', border: 'rgba(168, 85, 247, 0.3)' },
    sent_to_courier: { bg: 'rgba(168, 85, 247, 0.15)', color: '#c4b5fd', border: 'rgba(168, 85, 247, 0.3)' },
    processing: { bg: 'rgba(234, 179, 8, 0.15)', color: '#fde047', border: 'rgba(234, 179, 8, 0.3)' },
    in_transit: { bg: 'rgba(59, 130, 246, 0.15)', color: '#93c5fd', border: 'rgba(59, 130, 246, 0.3)' },
    out_for_delivery: { bg: 'rgba(34, 197, 94, 0.15)', color: '#4ade80', border: 'rgba(34, 197, 94, 0.3)' },
    delivered: { bg: 'rgba(16, 185, 129, 0.15)', color: '#6ee7b7', border: 'rgba(16, 185, 129, 0.3)' },
    returned: { bg: 'rgba(239, 68, 68, 0.15)', color: '#fca5a5', border: 'rgba(239, 68, 68, 0.3)' },
    cancelled: { bg: 'rgba(107, 114, 128, 0.15)', color: '#d1d5db', border: 'rgba(107, 114, 128, 0.3)' },
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
