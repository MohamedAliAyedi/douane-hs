import React from 'react';
import { Loader2 } from 'lucide-react';

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="flex items-center justify-center h-1/2 bg-white">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin h-12 w-12 text-blue-600 mb-4" />
        {/* <p className="text-lg text-gray-700">{message}</p> */}
      </div>
    </div>
  );
};

export default Loading;
