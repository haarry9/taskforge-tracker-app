
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { BoardDetailsPanel } from '@/components/boards/BoardDetailsPanel';

interface BoardSidePanelProps {
  isOpen: boolean;
  boardId: string;
  onClose: () => void;
}

export function BoardSidePanel({ isOpen, boardId, onClose }: BoardSidePanelProps) {
  if (!isOpen) return null;
  
  return (
    <div className="w-80 h-full bg-white border-l border-border/50 overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium">Board Details</h3>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={onClose}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
        {boardId && <BoardDetailsPanel boardId={boardId} />}
      </div>
    </div>
  );
}
