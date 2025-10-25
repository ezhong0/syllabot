'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import UnreadTab from './tabs/UnreadTab';
import InboxTab from './tabs/InboxTab';
import StudentsTab from './tabs/StudentsTab';
import DashboardTab from './tabs/DashboardTab';
import type { DemoEmail } from '@/types';

interface MainTabsProps {
  unreadCount?: number;
  totalCount?: number;
  studentCount?: number;
  dynamicEmails?: DemoEmail[];
}

export default function MainTabs({
  unreadCount = 12,
  totalCount = 47,
  studentCount = 4,
  dynamicEmails = [],
}: MainTabsProps) {
  const [activeTab, setActiveTab] = useState('unread');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full h-full">
      <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-6">
        <TabsList className="h-14 bg-transparent border-b-0">
          <TabsTrigger
            value="unread"
            className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Unread
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="inbox"
            className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Inbox
            <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {totalCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Students
            <Badge variant="secondary" className="ml-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
              {studentCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger
            value="dashboard"
            className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 rounded-none text-gray-700 dark:text-gray-300 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
          >
            Dashboard
          </TabsTrigger>
        </TabsList>
      </div>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="unread" className="h-full m-0">
          <UnreadTab dynamicEmails={dynamicEmails} />
        </TabsContent>
        <TabsContent value="inbox" className="h-full m-0">
          <InboxTab dynamicEmails={dynamicEmails} />
        </TabsContent>
        <TabsContent value="students" className="h-full m-0">
          <StudentsTab dynamicEmails={dynamicEmails} />
        </TabsContent>
        <TabsContent value="dashboard" className="h-full m-0">
          <DashboardTab dynamicEmails={dynamicEmails} />
        </TabsContent>
      </div>
    </Tabs>
  );
}
