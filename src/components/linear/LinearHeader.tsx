'use client';

import { Search, Settings, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface LinearHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onComposeClick: () => void;
  onSettingsClick?: () => void;
}

export function LinearHeader({
  searchQuery,
  onSearchChange,
  onComposeClick,
  onSettingsClick
}: LinearHeaderProps) {
  return (
    <header className="h-14 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex items-center justify-between px-4 sticky top-0 z-50">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎓</span>
          <span className="text-base font-semibold text-gray-900 dark:text-gray-100">SyllaBot</span>
        </div>
        <Badge className="bg-purple-100 text-purple-700 text-xs border-purple-200 hover:bg-purple-100">
          AI-Powered
        </Badge>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search emails... (⌘K)"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-10 pr-4 text-sm border border-gray-200 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-750 transition-colors text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2">
        <Button
          onClick={onComposeClick}
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white h-9 px-4 text-sm font-medium"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Compose
        </Button>

        {/* User Profile */}
        <div className="flex items-center gap-2 ml-2 pl-2 border-l border-gray-200 dark:border-gray-700">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-medium text-gray-900 dark:text-gray-100">Ms. Johnson</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">Stack Auth</div>
          </div>
          <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            MJ
          </div>
        </div>

        {onSettingsClick && (
          <Button variant="ghost" size="sm" onClick={onSettingsClick} className="h-9 w-9 p-0">
            <Settings className="h-4 w-4 text-gray-600" />
          </Button>
        )}
      </div>
    </header>
  );
}
