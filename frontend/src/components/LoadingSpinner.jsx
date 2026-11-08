import React from 'react';

const LoadingSpinner = ({ label = 'Loading Artogram...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-4">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-[#E8DEC8] border-t-[#C85A32] animate-spin"></div>
        <div className="absolute inset-2 w-8 h-8 rounded-full border-2 border-[#5C6B47] border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-sm font-medium text-[#55443B] tracking-wide">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
