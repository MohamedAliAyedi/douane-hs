import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { getDescription } from "@/service/classification.service";
import Loading from "../shared/Loading";
import EmptyState from "../shared/Empty";

interface ExplanatoryNotesProps {
  hsCode: string;
}

export const ExplanatoryNotes = ({ hsCode }: ExplanatoryNotesProps) => {
  const [explanatoryNotes, setexplanatoryNotes] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchexplanatoryNotes = useCallback(async () => {
    if (!hsCode || hsCode.length === 0 || explanatoryNotes || loading) return;

    try {
      setLoading(true);
      const response = await getDescription(hsCode);
      // const response = await getDescription("8802.20");
      setexplanatoryNotes(response);
    } catch (error) {
      console.error("Error fetching court case:", error);
      setexplanatoryNotes(null);
    } finally {
      setLoading(false);
    }
  }, [hsCode, explanatoryNotes]); // Removed `loading` from dependencies

  useEffect(() => {
    fetchexplanatoryNotes(); // Called only when hsCode changes
  }, [fetchexplanatoryNotes]);

  if (loading) {
    // Full-screen or card-wide loading spinner/message
    return (
      <div className="pt-8">
        <Loading />
      </div>
    );
  }

  return (
    <>
      {explanatoryNotes && explanatoryNotes.length > 0 ? (
        <Card className="bg-gray-100 border-none">
          <CardContent className="p-4">
            <h3 className="font-bold mb-2 text-base">Notes: </h3>
            <pre className="text-gray-700 font-sans whitespace-break-spaces mb-4">
              {explanatoryNotes}
            </pre>
          </CardContent>
        </Card>
      ) : (
        <EmptyState message="No explanatory notes found" />
      )}
    </>
  );
};
