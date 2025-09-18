import React from 'react';

export const Skeleton = ({ className }: { className?: string }) => {
  return (
    <div
      className={`animate-pulse bg-gray-300 rounded ${className}`}
      style={{ height: '1.5rem' }} // Default height for skeleton
    ></div>
  );
};
