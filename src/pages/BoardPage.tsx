
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBoards } from '@/hooks/useBoards';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { useBoardColumns } = useBoards();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const { data: columns, isLoading, isError } = useBoardColumns(boardId);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
        <p className="text-destructive">Failed to load board</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center" 
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold">Board View</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
          {columns?.map((column) => (
            <div 
              key={column.id} 
              className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border"
            >
              <div className="p-3 font-medium bg-gray-50 border-b rounded-t-lg">
                {column.title}
              </div>
              <div className="p-2 min-h-[200px]">
                {/* Task cards will go here in the future */}
                <div className="text-center text-sm text-muted-foreground p-4">
                  No tasks yet
                </div>
              </div>
            </div>
          ))}
          
          {columns?.length === 0 && (
            <div className="w-full flex items-center justify-center">
              <p className="text-muted-foreground">No columns found for this board.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
