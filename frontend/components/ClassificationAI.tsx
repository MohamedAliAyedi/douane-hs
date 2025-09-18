"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronLeft } from "lucide-react";
import React from "react";
import { TreeItem, TreeNode } from "./classification/TreeNode";
import { NENC } from "./classification/NENC";
import { CourtCase } from "./classification/CourtCase";
import { Memorandum } from "./classification/Memorandum";
import { DecisionOMD } from "./classification/DecisionOMD";
import { ExplanatoryNotes } from "./classification/ExplanatoryNotes";
import { DetailClasstification } from "./classification/DetailClasstification";
import { SearchInput } from "./classification/SearchInput";
import Loading from "./shared/Loading";
import EmptyState from "./shared/Empty";
import { getSimilarProducts } from "@/service/classification.service";

export default function ClassificationAI() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedHsCode, setSelectedHsCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeItem[] | null>(null);

  const tabs = [
    {
      id: "explanatory-notes",
      label: "Explanatory notes",
    },
    {
      id: "court-case",
      label: "Court Case",
    },
    {
      id: "decision-omd",
      label: "Decision OMD",
    },
    {
      id: "memorandum",
      label: "Memorandum",
    },
    {
      id: "nenc",
      label: "NENC",
    },
  ];

  // Fetch tree data based on search term
  React.useEffect(() => {
    if (!searchTerm) return;
    setSelectedHsCode("");
    setTreeData(null);
    const fetchTreeData = async () => {
      setIsLoading(true);
      try {
        const data = await getSimilarProducts(searchTerm);
        setTreeData(data);
        console.log("Tree data:", data);
      } catch (error) {
        console.error("Error fetching tree data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTreeData();
  }, [searchTerm]);

  return (
    <div className="flex-1 overflow-y-auto p-4 h-full bg-white">
      <h2 className="text-xl md:text-2xl font-bold mb-8 md:mb-12">
        Smart HS Classification Tool
      </h2>

      <SearchInput
        setSearchTerm={setSearchTerm}
        searchTerm={searchTerm}
        setIsLoading={setIsLoading}
      />

      {/* Loading State */}
      {isLoading ? (
        <Loading />
      ) : (
        <>
          {searchTerm.length === 0 && selectedHsCode.length === 0 ? (
            <EmptyState />
          ) : selectedHsCode.length === 0 && treeData?.length ? (
            <div className="space-y-2 md:space-y-1 font-sans">
              {treeData.map((item, index) => (
                <TreeNode
                  key={item.id}
                  item={item}
                  level={0}
                  isLast={index === treeData.length - 1}
                  setSelectedHsCode={setSelectedHsCode}
                />
              ))}
            </div>
          ) : (
            <div>
              <Button
                variant="link"
                className="text-blue-600 pl-0 mb-4"
                onClick={() => setSelectedHsCode("")}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back
              </Button>

              <Tabs defaultValue="detailClasstification">
                {/* Responsive Tabs List */}
                <TabsList className="flex w-full overflow-x-auto justify-around bg-white border-b border-gray-200 mb-4">
                  <TabsTrigger
                    value="detailClasstification"
                    className="text-black font-bold border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:-mb-[5px] rounded-none px-2 md:px-4"
                  >
                    {selectedHsCode}
                  </TabsTrigger>
                  {tabs.map((tab) => (
                    <TabsTrigger
                      key={tab.id}
                      value={tab.id}
                      className="text-black font-bold border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:-mb-[5px] rounded-none px-2 md:px-4"
                    >
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                <div className="space-y-6">
                  <TabsContent value="detailClasstification">
                    <DetailClasstification hsCode={selectedHsCode} />
                  </TabsContent>
                  <TabsContent value="explanatory-notes">
                    <ExplanatoryNotes hsCode={selectedHsCode} />
                  </TabsContent>
                  <TabsContent value="court-case">
                    <CourtCase hsCode={selectedHsCode} />
                  </TabsContent>
                  <TabsContent value="decision-omd">
                    <DecisionOMD />
                  </TabsContent>
                  <TabsContent value="memorandum">
                    <Memorandum />
                  </TabsContent>
                  <TabsContent value="nenc">
                    <NENC />
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          )}
        </>
      )}
    </div>
  );
}
