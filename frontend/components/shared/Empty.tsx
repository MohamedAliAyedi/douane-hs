// components/EmptyState.js
import React from 'react';
import { Search } from 'lucide-react';

const EmptyState = ({ message = "Please type something to start your search." }) => {
  return (
    <div className="flex items-center justify-center h-1/2 bg-white">
      <div className="flex flex-col items-center text-center">
        <Search className="h-12 w-12 text-blue-600 mb-4" />
        <p className="text-lg text-gray-700">{message}</p>
        <p className="text-sm text-gray-500 mt-2">You can start by typing a keyword in the search box above.</p>
      </div>
    </div>
  );
};

export default EmptyState;
