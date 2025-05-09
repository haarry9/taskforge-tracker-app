
import React from 'react';
import { Button } from '@/components/ui/button';

interface BoardLoadingStateProps {
  isLoading: boolean;
  isError: boolean;
}

export function BoardLoadingState({ isLoading, isError }: BoardLoadingStateProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-accent">
        <div className="text-center animate-pulse space-y-2">
          <div className="h-8 w-8 bg-primary/20 rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-accent space-y-4">
        <p className="text-destructive">Failed to load board</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }
  
  return null;
}
