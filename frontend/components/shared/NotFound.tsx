import React from 'react';
import { Frown } from 'lucide-react';

const NotFound = ({ message = "No data found" }) => {
  return (
    <div className="flex items-center justify-center h-1/2">
      <div className="flex flex-col items-center">
        <Frown className="h-12 w-12 text-blue-400 mb-4" />
        <p className="text-lg text-blue-900">{message}</p>
      </div>
    </div>
  );
};

export default NotFound;
