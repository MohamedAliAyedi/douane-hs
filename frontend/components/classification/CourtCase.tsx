import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "../ui/card";
import { getCourtCase } from "@/service/classification.service";
import Loading from "../shared/Loading";
import { cleanCourtCastText } from "@/lib/utils";

interface CourtCaseProps {
  hsCode: string;
}

export const CourtCase: React.FC<CourtCaseProps> = ({ hsCode }) => {
  const [courtCase, setCourtCase] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchCourtCase = useCallback(async () => {
    if (!hsCode || hsCode.length === 0 || courtCase || loading) return; // Avoid duplicate or unnecessary calls

    try {
      setLoading(true);
      const response = await getCourtCase(hsCode);
      // const response = await getCourtCase("8802.20");
      setCourtCase(response);
    } catch (error) {
      console.error("Error fetching court case:", error);
      setCourtCase(null);
    } finally {
      setLoading(false);
    }
  }, [hsCode, courtCase]); // Removed `loading` from dependencies

  useEffect(() => {
    fetchCourtCase(); // Called only when hsCode changes
  }, [fetchCourtCase]);

  if (loading) {
    // Full-screen or card-wide loading spinner/message
    return (
      <div className="pt-8">
       <Loading />
      </div>
    );
  }

  return (
    <Card className="border-none">
      <CardContent className="p-4">
        <div className="grid gap-4 mb-4">
          <div className="flex items-center border-b pb-4 mb-2 mt-4">
            <label className="block text-sm font-medium text-gray-700 mr-6 w-1/5">
              Case Number
            </label>
            <span className="text-blue-600 flex justify-center items-center rounded-md border border-blue-600 px-2 py-0.5">
              C-291/11
            </span>
          </div>
          <div className="flex items-center border-b pb-4 mb-2 mt-4">
            <label className="block text-sm font-medium text-gray-700 mr-6 w-1/5">
              HS Code (Product Won)
            </label>
            <span className="text-blue-600 flex justify-center items-center rounded-md border border-blue-600 px-2 py-0.5">
              {hsCode}
            </span>
          </div>
          <div className="flex items-center border-b pb-4 mb-2 mt-4">
            <label className="block text-sm font-medium text-gray-700 mr-6 w-1/5">
              HS Code (Product Lose)
            </label>
            <span className="text-blue-600 flex justify-center items-center rounded-md border border-blue-600 px-2 py-0.5">
              {hsCode}
            </span>
          </div>
        </div>
        <h3 className="font-bold mb-2">Description Of The Product</h3>
        <pre className="text-gray-700 font-sans whitespace-break-spaces mb-4">
        {courtCase
            ? courtCase
            : "There is no court case for this HS code."}
        </pre>
      </CardContent>
    </Card>
  );
};
