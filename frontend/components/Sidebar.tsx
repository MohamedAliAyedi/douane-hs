"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Clock,
  Settings,
  X,
  Menu,
  Image as ImageIcon,
  Sparkles,
  ChevronRight,
  User,
  Bell,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close sidebar on pathname change
  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const navigationItems = [
    {
      href: "/dashboard",
      icon: LayoutDashboard,
      label: "Dashboard",
      badge: null,
    },
    {
      href: "/process-image",
      icon: ImageIcon,
      label: "Process Image",
      badge: null,
    },
    {
      href: "/chat",
      icon: MessageSquare,
      label: "AI Chat",
      badge: null,
    },
    {
      href: "/classification",
      icon: Clock,
      label: "Classification",
      badge: null,
    },
    {
      href: "/declaration",
      icon: FileText,
      label: "Declaration",
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="md:hidden fixed top-4 right-4 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          size="sm"
          className="bg-white/90 backdrop-blur-sm shadow-lg border border-slate-200 text-slate-700 hover:bg-white hover:text-slate-900"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`inset-y-0 left-0 z-40 w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-xl transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-slate-200/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold text-sm">DA</span>
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></div>
                </div>
                <div>
                  <h1 className="font-bold text-lg text-slate-900">
                    Douane AI
                  </h1>
                  <p className="text-xs text-slate-500">Smart Classification</p>
                </div>
              </div>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                size="sm"
                className="md:hidden text-slate-500 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Input
                placeholder="Search features..."
                className="pl-10 bg-slate-50/50 border-slate-200 focus:bg-white focus:border-blue-300 transition-all duration-200"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 space-y-2">
            <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
                Main Features
              </p>
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

                return (
                  <Link key={item.href} href={item.href} passHref>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start h-12 px-3 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? "bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200/50 shadow-sm"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center">
                          <Icon
                            className={`mr-3 h-5 w-5 transition-colors ${
                              isActive
                                ? "text-blue-600"
                                : "text-slate-500 group-hover:text-slate-700"
                            }`}
                          />
                          <span className="font-medium">{item.label}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.badge && (
                            <Badge
                              variant="secondary"
                              className={`text-xs px-2 py-0.5 ${
                                item.badge === "AI"
                                  ? "bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 border-purple-200"
                                  : item.badge === "New"
                                  ? "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-700 border-emerald-200"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.badge}
                            </Badge>
                          )}
                          {isActive && (
                            <ChevronRight className="h-4 w-4 text-blue-600" />
                          )}
                        </div>
                      </div>
                    </Button>
                  </Link>
                );
              })}
            </div>

            {/* Quick Actions */}
            {/* <div className="mb-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-3">
                Quick Actions
              </p>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <Sparkles className="mr-3 h-4 w-4 text-slate-500" />
                  <span className="text-sm">AI Assistant</span>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start h-10 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                >
                  <HelpCircle className="mr-3 h-4 w-4 text-slate-500" />
                  <span className="text-sm">Help Center</span>
                </Button>
              </div>
            </div> */}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-slate-200/60 space-y-3">
            {/* User Profile */}
            <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50/50 hover:bg-slate-100/50 transition-colors cursor-pointer">
              <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg flex items-center justify-center">
                <User className="h-4 w-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  User Account
                </p>
                <p className="text-xs text-slate-500 truncate">
                  user@douane.ai
                </p>
              </div>
              <Bell className="h-4 w-4 text-slate-400" />
            </div>

            {/* Settings */}
            {/* <Button
              variant="ghost"
              className="w-full justify-start h-10 px-3 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <Settings className="mr-3 h-4 w-4 text-slate-500" />
              <span className="text-sm">Settings</span>
            </Button> */}

            {/* Version */}
            {/* <div className="text-center">
              <Badge
                variant="outline"
                className="text-xs text-slate-500 border-slate-200"
              >
                v2.1.0
              </Badge>
            </div> */}
          </div>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
