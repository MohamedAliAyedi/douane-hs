import React from "react";
import { Download, HelpCircle, Upload } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface ISearchInput {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  setIsLoading: (value: boolean) => void;
}

export const SearchInput = ({ searchTerm, setSearchTerm, setIsLoading }: ISearchInput) => {

  const [localSearchTerm, setLocalSearchTerm] = React.useState(searchTerm);

  React.useEffect(() => {
    setIsLoading(true);
    const timeoutId = setTimeout(() => {
      setSearchTerm(localSearchTerm);
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeoutId);
  }, [localSearchTerm, setSearchTerm]);

  return (
    <div className="flex items-center space-x-2 mb-8">
      <div className="relative flex-grow">
        <Input
          placeholder="Search by commercial good description, HS code, or GTIN code"
          value={localSearchTerm}
          onChange={(e) => setLocalSearchTerm(e.target.value)}
          className="pl-8 pr-4 py-2 w-full"
        />
        <span className="absolute inset-y-0 left-0 flex items-center pl-2">
          <svg
            className="h-5 w-5 text-gray-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
        </span>
        {searchTerm && (
          <button
            className="absolute inset-y-0 right-0 flex items-center pr-3"
            onClick={() => {
              setLocalSearchTerm("");
            }}
          >
            <svg
              className="h-5 w-5 text-gray-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>
      {searchTerm.length > 0 ? (
        <>
          <Button variant="outline" className="hidden text-blue-600 border-blue-600 sm:flex">
            <HelpCircle className="h-4 w-4 mr-2" />
            Need Support?
          </Button>
          <Button variant="outline" className="text-blue-600 border-blue-600">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </>
      ) : (
        <>
          <Button variant="outline" className="text-blue-600 border-blue-600">
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <Button variant="outline" className="hidden text-blue-600 border-blue-600 sm:flex">
            <HelpCircle className="h-4 w-4 mr-2" />
            Need Support?
          </Button>
        </>
      )}
    </div>
  );
};
