
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BoardMembers } from '@/components/boards/BoardMembers';
import { Card } from '@/components/ui/card';
import { useBoards } from '@/hooks/useBoards';

interface BoardDetailsPanelProps {
  boardId: string;
}

export function BoardDetailsPanel({ boardId }: BoardDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('members');
  
  return (
    <Card className="p-4">
      <Tabs defaultValue="members" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="members" className="mt-4">
          <BoardMembers boardId={boardId} />
        </TabsContent>
        <TabsContent value="settings" className="mt-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Board Settings</h3>
            <p className="text-sm text-gray-500">
              Additional board settings will appear here.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
}
