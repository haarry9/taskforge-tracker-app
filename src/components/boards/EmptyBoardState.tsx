
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface EmptyBoardStateProps {
  onAddColumn: () => void;
}

export function EmptyBoardState({ onAddColumn }: EmptyBoardStateProps) {
  return (
    <div className="flex items-center justify-center w-full">
      <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-border/40 max-w-md">
        <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
          <Plus className="h-6 w-6 text-primary" />
        </div>
        <h3 className="text-lg font-medium mb-2">No columns found</h3>
        <p className="text-muted-foreground mb-6">
          Get started by creating your first column to organize tasks.
        </p>
        <Button 
          onClick={onAddColumn}
          className="rounded-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Your First Column
        </Button>
      </div>
    </div>
  );
}
