"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Folder,
  Search,
  FileText,
  Database,
  Activity,
  Calendar,
  Download,
  Eye,
  Clock,
  ArrowUpRight,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  HardDrive,
  FolderOpen,
} from "lucide-react";
import { API_HS_CODE } from "@/service/api";

interface DashboardStats {
  summary: {
    total_files: number;
    pdf_files: number;
    csv_files: number;
    total_size_mb: number;
    top_folder_count: number;
    recent_files_sample: number;
  };
  file_types: {
    extensions: Record<string, number>;
    pdf_percentage: number;
    csv_percentage: number;
  };
  top_folders: Array<{
    name: string;
    size_mb: number;
    item_count: number;
  }>;
  recent_activity: Array<{
    name: string;
    modified: string;
    size_mb: number;
  }>;
}

export default function Dashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [dashboardData, setDashboardData] = useState<DashboardStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_HS_CODE}/dashboard_stats/`, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch dashboard stats: ${response.status}`);
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const formatFileSize = (sizeInMB: number) => {
    if (sizeInMB >= 1024) {
      return `${(sizeInMB / 1024).toFixed(2)} GB`;
    }
    return `${sizeInMB.toFixed(2)} MB`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const getFileTypeIcon = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "📄";
      case "csv":
        return "📊";
      case "xml":
        return "📋";
      case "json":
        return "🔧";
      default:
        return "📁";
    }
  };

  const getFileTypeColor = (filename: string) => {
    const extension = filename.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "pdf":
        return "bg-red-100 text-red-700 border-red-200";
      case "csv":
        return "bg-green-100 text-green-700 border-green-200";
      case "xml":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "json":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const filteredRecentFiles =
    dashboardData?.recent_activity.filter((file) => {
      const matchesSearch = file.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return matchesSearch;
    }) || [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm p-8">
          <div className="text-center space-y-4">
            <div className="relative">
              <div className="bg-blue-100 p-4 rounded-full mx-auto w-fit">
                <Database className="h-8 w-8 text-blue-600" />
              </div>
              <Loader2 className="absolute inset-0 h-16 w-16 animate-spin text-blue-600/30" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Loading Dashboard
              </h3>
              <p className="text-slate-600 mt-1">
                Fetching your customs data...
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm p-8 max-w-md">
          <div className="text-center space-y-4">
            <div className="bg-red-100 p-4 rounded-full mx-auto w-fit">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                Failed to Load Data
              </h3>
              <p className="text-slate-600 mt-1 text-sm">{error}</p>
            </div>
            <Button
              onClick={fetchDashboardStats}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (!dashboardData) return null;

  const statsData = [
    {
      title: "Total Files",
      value: dashboardData.summary.total_files.toLocaleString(),
      subtitle: `${dashboardData.summary.pdf_files} PDFs, ${dashboardData.summary.csv_files} CSVs`,
      change: `${dashboardData.file_types.pdf_percentage.toFixed(1)}% PDF`,
      trend: "up",
      icon: FileText,
      color: "from-blue-600 to-indigo-600",
      bgColor: "from-blue-50 to-indigo-50",
    },
    {
      title: "Storage Used",
      value: formatFileSize(dashboardData.summary.total_size_mb),
      subtitle: `Across ${dashboardData.summary.top_folder_count} main folders`,
      change: "Organized",
      trend: "up",
      icon: HardDrive,
      color: "from-emerald-600 to-green-600",
      bgColor: "from-emerald-50 to-green-50",
    },
    {
      title: "Top Folders",
      value: dashboardData.summary.top_folder_count.toString(),
      subtitle: `${dashboardData.top_folders[0]?.name} (${dashboardData.top_folders[0]?.item_count} items)`,
      change: "Active",
      trend: "up",
      icon: FolderOpen,
      color: "from-purple-600 to-pink-600",
      bgColor: "from-purple-50 to-pink-50",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="flex-1 flex flex-col">
        {/* Enhanced Header */}
        <header className="bg-white/95 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
          <div className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="flex items-center space-x-4">
                  <h1 className="text-3xl font-bold text-slate-900">
                    Dashboard
                  </h1>
                  <Badge className="bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200">
                    <Activity className="h-3 w-3 mr-1" />
                    Live Data
                  </Badge>
                </div>
                <p className="text-slate-600 text-lg">
                  Monitor and analyze your customs documentation and
                  classification data.
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={fetchDashboardStats}
                  className="border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
                {/* <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Files
                </Button> */}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsData.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card
                    key={index}
                    className={`border-0 shadow-lg bg-gradient-to-r ${stat.bgColor} overflow-hidden`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-slate-600">
                            {stat.title}
                          </p>
                          <div className="space-y-1">
                            <p className="text-3xl font-bold text-slate-900">
                              {stat.value}
                            </p>
                            <p className="text-xs text-slate-600">
                              {stat.subtitle}
                            </p>
                          </div>
                          <div className="flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 w-fit">
                            <ArrowUpRight className="h-3 w-3" />
                            <span>{stat.change}</span>
                          </div>
                        </div>
                        <div
                          className={`p-4 rounded-2xl bg-gradient-to-br ${stat.color} shadow-lg`}
                        >
                          <Icon className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-8 space-y-8">
          {/* Top Folders Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-8">
            {/* Top Folders */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <Folder className="h-5 w-5 mr-3 text-blue-600" />
                  Top Folders by Size
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {dashboardData.top_folders.map((folder, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                        <Folder className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">
                          {folder.name}
                        </p>
                        <p className="text-sm text-slate-600">
                          {folder.item_count} items
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">
                        {formatFileSize(folder.size_mb)}
                      </p>
                      <p className="text-xs text-slate-500">
                        {(
                          (folder.size_mb /
                            dashboardData.summary.total_size_mb) *
                          100
                        ).toFixed(1)}
                        %
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* File Types Distribution */}
            {/* <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center text-xl">
                  <PieChart className="h-5 w-5 mr-3 text-blue-600" />
                  File Types Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(dashboardData.file_types.extensions).map(
                  ([extension, count]) => {
                    const percentage = (
                      (count / dashboardData.summary.total_files) *
                      100
                    ).toFixed(1);
                    return (
                      <div key={extension} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Badge
                              className={getFileTypeColor(`file${extension}`)}
                            >
                              {extension.toUpperCase()}
                            </Badge>
                            <span className="font-medium text-slate-900">
                              {count.toLocaleString()} files
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-slate-700">
                            {percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  }
                )}
              </CardContent>
            </Card> */}
          </div>

          {/* Recent Activity */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold text-slate-900 flex items-center">
                  <Clock className="h-5 w-5 mr-3 text-blue-600" />
                  Recent Activity ({filteredRecentFiles.length})
                </CardTitle>
                <div className="flex items-center space-x-4">
                  {/* <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                    <Input
                      placeholder="Search recent files..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64 bg-white/50 border-slate-200 focus:bg-white focus:border-blue-300 transition-all duration-200"
                    />
                  </div> */}
                  {/* <Button
                    variant="outline"
                    className="border-slate-300 hover:bg-slate-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button> */}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                      <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        File Details
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        Last Modified
                      </TableHead>
                      <TableHead className="px-6 py-4 text-left text-sm font-semibold text-slate-700">
                        File Size
                      </TableHead>
                      <TableHead className="px-6 py-4 text-right text-sm font-semibold text-slate-700">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecentFiles.map((file, index) => (
                      <TableRow
                        key={index}
                        className="hover:bg-slate-50/50 transition-colors duration-200 border-b border-slate-100"
                      >
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-xl shadow-sm">
                              {getFileTypeIcon(file.name)}
                            </div>
                            <div className="space-y-1">
                              <div className="font-semibold text-slate-900 flex items-center">
                                {file.name}
                                <Sparkles className="h-3 w-3 ml-2 text-blue-500" />
                              </div>
                              <Badge
                                className={getFileTypeColor(file.name)}
                                variant="outline"
                              >
                                {file.name.split(".").pop()?.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <div className="flex items-center text-slate-600">
                            <Calendar className="h-4 w-4 mr-2" />
                            {formatDate(file.modified)}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <div className="flex items-center text-slate-600">
                            <Database className="h-4 w-4 mr-2" />
                            {formatFileSize(file.size_mb)}
                          </div>
                        </TableCell>

                        <TableCell className="px-6 py-4">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Empty State for Search */}
          {filteredRecentFiles.length === 0 && searchTerm && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="text-center py-16">
                <div className="space-y-4">
                  <div className="bg-slate-100 p-4 rounded-full mx-auto w-fit">
                    <Search className="h-8 w-8 text-slate-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">
                      No files found
                    </h3>
                    <p className="text-slate-600 mb-4">
                      No files match your search term &quot;{searchTerm}&quot;.
                      Try a different search.
                    </p>
                    <Button
                      onClick={() => setSearchTerm("")}
                      variant="outline"
                      className="border-slate-300 hover:bg-slate-50"
                    >
                      Clear search
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
