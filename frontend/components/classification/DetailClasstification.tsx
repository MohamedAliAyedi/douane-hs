import { getQuery, QueryResponse } from "@/service/classification.service";
import { Card, CardContent } from "../ui/card";
import { useCallback, useEffect, useState } from "react";
import Loading from "../shared/Loading";

interface DetailClasstificationProps {
  hsCode: string;
}

export const DetailClasstification = ({
  hsCode,
}: DetailClasstificationProps) => {
  const [detailClasstification, setDetailClasstification] =
    useState<QueryResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchDetailClasstification = useCallback(async () => {
    if (!hsCode || hsCode.length === 0 || detailClasstification || loading)
      return;
    if (loading) return;

    try {
      setLoading(true);
      const response = await getQuery(hsCode.substring(0, 4));
      // const response = await getQuery("8802");
      setDetailClasstification(response);
    } catch (error) {
      console.error("Error fetching court case:", error);
      setDetailClasstification(null);
    } finally {
      setLoading(false);
    }
  }, [hsCode, detailClasstification]); // Removed `loading` from dependencies

  useEffect(() => {
    fetchDetailClasstification(); // Called only when hsCode changes
  }, [fetchDetailClasstification]);

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
        <div className="gap-4 mb-4">
          <div className="flex items-center border-b pb-4 mb-2 mt-4">
            <label className="block text-sm font-medium text-gray-700 mr-6">
              Chapter
            </label>
            <span className="text-blue-600 flex justify-center items-center rounded-md border border-blue-600 px-2 rounded">
              {hsCode.substring(0, 2)}
              {false && (
                <div className="bg-gray-200 ml-2 pl-1 pr-1 rounded-md">
                  <p className="text-black text-xs">R</p>
                </div>
              )}
            </span>
          </div>
          <div className="flex items-center border-b pb-4 mb-2 mt-4">
            <label className="block text-sm font-medium text-gray-700 mr-6">
              Heading
            </label>
            <span className="text-blue-600 flex justify-center items-center rounded-md border border-blue-600 px-2 rounded">
              {hsCode.substring(0, 4)}
              {false && (
                <div className="bg-gray-200 ml-2 pl-1 pr-1 rounded-md">
                  <p className="text-black text-xs">R</p>
                </div>
              )}
            </span>
          </div>
          <div className="flex items-center border-b pb-4 mb-2 mt-4">
            <label className="block text-sm font-medium text-gray-700 mr-6">
              HS Code
            </label>
            <span className="text-blue-600 flex justify-center items-center rounded-md border border-blue-600 px-2 rounded">
              {hsCode}
              {false && (
                <div className="bg-gray-200 ml-2 pl-1 pr-1 rounded-md">
                  <p className="text-black text-xs">R</p>
                </div>
              )}
            </span>
          </div>
        </div>
        <div className="overflow-x-auto">
          {detailClasstification && detailClasstification.related_hs_codes && detailClasstification.related_hs_codes.length != 0 ? (
            detailClasstification.related_hs_codes
              .filter((_hsCode) => _hsCode.startsWith(hsCode.substring(0, 4)))
              .map((_hsCode, index) => (
                <div
                  key={index}
                  className="flex items-center border-b pb-4 mb-2 mt-4"
                >
                  <span className="text-blue-600 flex justify-center items-center rounded-md border border-blue-600 px-2 rounded mr-6">
                    {_hsCode.replace("--", " - ").split(" - ")[0]}
                  </span>
                  <label className="block text-sm font-medium text-gray-700 ">
                    {_hsCode.replace("--", " - ").split(" - ")[1]}
                  </label>
                </div>
              ))
          ) : (
            <label className="block text-sm font-medium text-gray-700 ">
              {detailClasstification?.description?.length !== 0 ? detailClasstification?.description : "No data found!"}
            </label>
          )}
          {/* <table className="min-w-full divide-y divide-gray-200 rounded-md">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  QTY
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  EXC
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  UOM
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="text-blue-600 flex justify-center w-1/2 items-center rounded-md border border-blue-600 px-2 py-0.5 rounded">
                    01
                    {true && (
                      <div className="bg-gray-200 ml-4 pl-1 pr-1 rounded-md">
                        <p className="text-black text-xs">R</p>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Horses for sport (Restricted by UAE Ministry of Climate Change
                  and Environment (MOCCAE))
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  U
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="text-blue-600 flex justify-center w-1/2 items-center rounded-md border border-blue-600 px-2  py-0.5 rounded">
                    20
                    {true && (
                      <div className="bg-gray-200 ml-4 pl-1 pr-1 rounded-md">
                        <p className="text-black text-xs">R</p>
                      </div>
                    )}
                  </div>{" "}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Ponies (Restricted by UAE Ministry of Climate Change and
                  Environment (MOCCAE))
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  U
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  <div className="text-blue-600 flex justify-center w-1/2 items-center rounded-md border border-blue-600 px-2  py-0.5 rounded">
                    90
                    {true && (
                      <div className="bg-gray-200 ml-4 pl-1 pr-1 rounded-md">
                        <p className="text-black text-xs">R</p>
                      </div>
                    )}
                  </div>{" "}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  Other (Restricted by UAE Ministry of Climate Change and
                  Environment (MOCCAE))
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  0%
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  U
                </td>
              </tr>
            </tbody>
          </table> */}
        </div>
      </CardContent>
    </Card>
  );
};
