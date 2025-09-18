"use client";

import React, { useState } from "react";
import { Search, ChevronLeft, X, Loader2, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { API_SEARCH } from "@/service/api";

interface SubCodeResult {
  description?: string;
  Description?: string;
  File_Name: string;
  rubrique: string;
  Similarité?: number | null;
  contenu: string;
}

interface SubCode {
  sous_code: string;
  resultats: SubCodeResult[];
}

interface SearchResult {
  HS_Code: string;
  Product_Name: string;
  File_Name: string;
  rubrique: string;
  score: number;
  contenu: string;
  sous_codes: SubCode[];
}

export default function HSClassificationTool() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("explanatory");

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_SEARCH}/search`, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query.trim(),
          top_k: 5,
        }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setResults(data);
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    setSelectedCode(null);
  };

  const formatScore = (score: number) => {
    return (score * 100).toFixed(1);
  };

  const getSelectedResult = () => {
    return results.find((result) => result.HS_Code === selectedCode);
  };

  const getRubriqueColor = (rubrique: string) => {
    switch (rubrique.toLowerCase()) {
      case "note explicative":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "decision omd":
        return "bg-blue-50 text-blue-700 border-blue-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const translateRubrique = (rubrique: string) => {
    switch (rubrique.toLowerCase()) {
      case "note explicative":
        return "Explanatory Notes";
      case "decision omd":
        return "OMD Decision";
      default:
        return rubrique;
    }
  };

  const selectedResult = getSelectedResult();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-7xl mx-auto">
        {!selectedCode ? (
          /* Search Results */
          <div className="space-y-6">
            {/* Search Bar */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Search className="h-5 w-5 mr-3 text-blue-600" />
                  Product Classification Search
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Input
                    placeholder="Enter product name or description (e.g., drone, camera, electronics...)"
                    className="pr-12 h-14 text-lg bg-slate-50/50 border-slate-200 focus:bg-white transition-all duration-200"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                    {query && (
                      <button
                        onClick={clearSearch}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                    <Button
                      onClick={handleSearch}
                      disabled={loading || !query.trim()}
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results */}
            {results.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-slate-900">
                    Classification Results ({results.length})
                  </h2>
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    Query: &quot;{query}&quot;
                  </Badge>
                </div>

                {results.map((result, index) => (
                  <Card
                    key={index}
                    className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <CardContent className="p-0">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-slate-100">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-4">
                            <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 text-base font-mono shadow-lg">
                              {result.HS_Code}
                            </Badge>
                            {/* <Badge
                              variant="outline"
                              className="text-slate-600 border-slate-300"
                            >
                              Proposition {index + 1}
                            </Badge> */}
                            <div className="flex items-center space-x-2">
                              <Star className="h-4 w-4 text-yellow-500" />
                              <span className="font-semibold text-blue-700">
                                {formatScore(result.score)}% match
                              </span>
                            </div>
                          </div>
                          {result.rubrique && (
                            <Badge
                              className={getRubriqueColor(result.rubrique)}
                            >
                              {translateRubrique(result.rubrique)}
                            </Badge>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-slate-900 mb-2 leading-relaxed">
                          {result.Product_Name}
                        </h3>
                        {result.contenu && (
                          <p
                            className="text-slate-700 leading-relaxed"
                            style={{
                              height: "80px",
                              overflow: "hidden",
                              // whiteSpace: "pre-wrap",
                              // wordBreak: "break-word",
                            }}
                          >
                            {result.contenu}
                          </p>
                        )}
                      </div>

                      <div className="p-6">
                        {/* Sub-codes */}
                        <div className="space-y-4 mb-6">
                          {result.sous_codes.map((subCode, subIndex) => (
                            <>
                              {subCode && subCode.sous_code != "note" && (
                                <div
                                  key={subIndex}
                                  className="flex items-start space-x-4 p-4 bg-slate-50 rounded-xl"
                                >
                                  <div className="flex items-center space-x-3">
                                    <Badge
                                      variant="outline"
                                      className="bg-blue-100 text-blue-700 border-blue-200 font-mono px-3 py-1"
                                    >
                                      {subCode.sous_code}
                                    </Badge>
                                    <Badge
                                      variant="secondary"
                                      className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                                    >
                                      R
                                    </Badge>
                                  </div>
                                  <div className="flex-1 space-y-2">
                                    {subCode.resultats.map(
                                      (subResult, resultIndex) => (
                                        <div
                                          key={resultIndex}
                                          className="text-sm text-slate-700 leading-relaxed"
                                        >
                                          <div className="font-medium mb-1">
                                            {subResult.description ||
                                              subResult.Description}
                                          </div>
                                          {subResult.rubrique && (
                                            <Badge
                                              className={getRubriqueColor(
                                                subResult.rubrique
                                              )}
                                              variant="outline"
                                            >
                                              {translateRubrique(
                                                subResult.rubrique
                                              )}
                                            </Badge>
                                          )}
                                          {subResult.Similarité && (
                                            <Badge
                                              variant="secondary"
                                              className="text-xs ml-2"
                                            >
                                              {formatScore(
                                                subResult.Similarité
                                              )}
                                              % similarity
                                            </Badge>
                                          )}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </>
                          ))}
                        </div>

                        <Separator className="my-4" />

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-sm text-slate-600">
                            <FileText className="h-4 w-4 mr-2" />
                            Source: {result.File_Name}
                          </div>
                          <Button
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => setSelectedCode(result.HS_Code)}
                          >
                            View Detailed Information
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {loading && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    Searching HS Codes...
                  </h3>
                  <p className="text-slate-600">
                    Analyzing your query with AI classification
                  </p>
                </CardContent>
              </Card>
            )}

            {!loading && results.length === 0 && query && (
              <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                <CardContent className="text-center py-12">
                  <Search className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">
                    No Classifications Found
                  </h3>
                  <p className="text-slate-600 mb-4">
                    We couldn&apos;t find any HS codes matching your search
                    query.
                  </p>
                  <Button variant="outline" onClick={clearSearch}>
                    Try a Different Search
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          /* Detail View */
          <div className="space-y-6">
            {/* Back Button */}
            <Button
              variant="ghost"
              onClick={() => setSelectedCode(null)}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto"
            >
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Results
            </Button>

            {/* Code Header */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-6">
                    <Badge className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 text-2xl font-mono shadow-lg">
                      {selectedCode}
                    </Badge>
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900">
                        {selectedResult?.Product_Name}
                      </h2>
                      <p className="text-slate-600 mt-1">
                        Detailed Classification Information
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Star className="h-5 w-5 text-yellow-500" />
                    <span className="font-semibold text-blue-700 text-lg">
                      {selectedResult && formatScore(selectedResult.score)}%
                      match
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <div className="border-b border-slate-200">
                    <TabsList className="grid w-full grid-cols-5 bg-transparent h-auto p-0">
                      <TabsTrigger
                        value="explanatory"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4 px-6 font-medium"
                      >
                        Explanatory Notes
                      </TabsTrigger>
                      <TabsTrigger
                        value="court"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4 px-6 font-medium"
                      >
                        Court Case
                      </TabsTrigger>
                      <TabsTrigger
                        value="decision"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4 px-6 font-medium"
                      >
                        Decision OMD
                      </TabsTrigger>
                      <TabsTrigger
                        value="memorandum"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4 px-6 font-medium"
                      >
                        Memorandum
                      </TabsTrigger>
                      <TabsTrigger
                        value="nenc"
                        className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none py-4 px-6 font-medium"
                      >
                        NENC
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="explanatory" className="p-8">
                    <div className="space-y-8">
                      {selectedResult?.sous_codes
                        .filter((sc) =>
                          sc.resultats.some(
                            (r) => r.rubrique === "note explicative"
                          )
                        )
                        .map((subCode, index) => (
                          <div key={index}>
                            {subCode.resultats
                              .filter((r) => r.rubrique === "note explicative")
                              .map((result, resultIndex) => (
                                <div key={resultIndex} className="space-y-6">
                                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl p-6 border border-emerald-100">
                                    <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                                      <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
                                      {result.description ||
                                        "Explanatory Notes"}
                                    </h3>
                                    <div className="bg-white/60 p-4 rounded-lg border border-emerald-100">
                                      <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {result.contenu}
                                      </p>
                                    </div>
                                    <div className="mt-3 flex items-center text-sm text-slate-600">
                                      <FileText className="h-4 w-4 mr-2" />
                                      Source: {result.File_Name}
                                    </div>
                                  </div>
                                </div>
                              ))}
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="court" className="p-8">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-100 text-center">
                      <FileText className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Court Case Information
                      </h3>
                      <p className="text-slate-600">
                        Court case documentation will be displayed here when
                        available.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="decision" className="p-8">
                    <div className="space-y-6">
                      {selectedResult?.sous_codes
                        .filter((sc) =>
                          sc.resultats.some(
                            (r) => r.rubrique === "decision OMD"
                          )
                        )
                        .map((subCode, index) => (
                          <div key={index} className="space-y-4">
                            {subCode.resultats
                              .filter((r) => r.rubrique === "decision OMD")
                              .map((result, resultIndex) => (
                                <div
                                  key={resultIndex}
                                  className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100"
                                >
                                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                                    {result.Description ||
                                      "OMD Decision Details"}
                                  </h4>
                                  <div className="bg-white/60 p-4 rounded-lg border border-purple-100">
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                      {result.contenu}
                                    </p>
                                  </div>
                                  <div className="mt-3 flex items-center text-sm text-slate-600">
                                    <FileText className="h-4 w-4 mr-2" />
                                    Source: {result.File_Name}
                                  </div>
                                </div>
                              ))}
                          </div>
                        ))}
                    </div>
                  </TabsContent>

                  <TabsContent value="memorandum" className="p-8">
                    <div className="bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl p-8 border border-teal-100 text-center">
                      <FileText className="h-16 w-16 text-teal-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        Memorandum Information
                      </h3>
                      <p className="text-slate-600">
                        Memorandum documentation will be displayed here when
                        available.
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="nenc" className="p-8">
                    <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-xl p-8 border border-rose-100 text-center">
                      <FileText className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-slate-900 mb-2">
                        NENC Information
                      </h3>
                      <p className="text-slate-600">
                        NENC documentation will be displayed here when
                        available.
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
