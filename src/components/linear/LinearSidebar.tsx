'use client';

import { Inbox, AlertCircle, AlertTriangle, CheckCircle, Star, Send, FileText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

type View = 'inbox' | 'high-risk' | 'medium-risk' | 'low-risk' | 'starred' | 'sent' | 'drafts' | 'settings';

interface LinearSidebarProps {
  activeView: View;
  onViewChange: (view: View) => void;
  counts: {
    inbox: number;
    highRisk: number;
    mediumRisk: number;
    lowRisk: number;
    starred: number;
  };
}

interface NavItem {
  id: View;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
  color?: string;
}

export function LinearSidebar({ activeView, onViewChange, counts }: LinearSidebarProps) {
  const mainItems: NavItem[] = [
    { id: 'inbox', label: 'Inbox', icon: Inbox, count: counts.inbox },
  ];

  const riskItems: NavItem[] = [
    {
      id: 'high-risk',
      label: 'High Risk',
      icon: AlertCircle,
      count: counts.highRisk,
      color: 'text-red-600'
    },
    {
      id: 'medium-risk',
      label: 'Medium Risk',
      icon: AlertTriangle,
      count: counts.mediumRisk,
      color: 'text-amber-600'
    },
    {
      id: 'low-risk',
      label: 'Low Risk',
      icon: CheckCircle,
      count: counts.lowRisk,
      color: 'text-green-600'
    },
  ];

  const otherItems: NavItem[] = [
    { id: 'starred', label: 'Starred', icon: Star, count: counts.starred },
    { id: 'sent', label: 'Sent', icon: Send },
    { id: 'drafts', label: 'Drafts', icon: FileText },
  ];

  const bottomItems: NavItem[] = [
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = activeView === item.id;

    return (
      <button
        key={item.id}
        onClick={() => onViewChange(item.id)}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors group",
          isActive
            ? "bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
            : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <div className="flex items-center gap-3">
          <Icon className={cn(
            "h-4 w-4",
            isActive ? "text-purple-600" : item.color || "text-gray-500"
          )} />
          <span>{item.label}</span>
        </div>
        {item.count !== undefined && item.count > 0 && (
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full",
            isActive
              ? "bg-purple-100 text-purple-700"
              : "bg-gray-100 text-gray-600"
          )}>
            {item.count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside className="w-56 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 flex flex-col h-full">
      {/* Main navigation */}
      <nav className="flex-1 p-3 space-y-6">
        {/* Inbox */}
        <div className="space-y-1">
          {mainItems.map(renderNavItem)}
        </div>

        {/* Students by Risk */}
        <div className="space-y-1">
          <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Students
          </div>
          {riskItems.map(renderNavItem)}
        </div>

        {/* Other */}
        <div className="space-y-1">
          {otherItems.map(renderNavItem)}
        </div>
      </nav>

      {/* Bottom navigation */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        {bottomItems.map(renderNavItem)}
      </div>

      {/* Tool Integration Badge */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">
          <span className="font-semibold">5 Tools Active</span>
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">🧠 Claude</span>
          <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">🔐 Stack</span>
          <span className="text-xs px-1.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 rounded">📊 s2</span>
          <span className="text-xs px-1.5 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">🌍 Lingo</span>
          <span className="text-xs px-1.5 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded">⚡ Cactus</span>
        </div>
      </div>
    </aside>
  );
}
