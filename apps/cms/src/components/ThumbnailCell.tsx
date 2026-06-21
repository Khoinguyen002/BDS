'use client';
import React from 'react';

export const ThumbnailCell: React.FC<{ cellData: unknown }> = ({ cellData }) => {
  // Payload v3 có thể pass cellData là ID hoặc object đã populate.
  // Tuy nhiên, đối với type 'upload', cellData thường là object của file.
  if (!cellData) return <span>-</span>;
  
  const url = typeof cellData === 'object' && cellData !== null ? (cellData as Record<string, unknown>)?.url : null;

  if (!url) return <span>-</span>;

  return (
    <div style={{ display: 'flex', alignItems: 'center', height: '100%' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url as string}
        alt="Logo"
        style={{
          width: '40px',
          height: '40px',
          objectFit: 'contain',
          borderRadius: 0,
          backgroundColor: '#f4f4f5'
        }}
      />
    </div>
  );
};
