
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Link, ArrowLeft, Plus, Users, Settings, MoreHorizontal } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import ActivityPanel from '@/components/boards/ActivityPanel';

interface BoardHeaderProps {
  boardTitle: string;
  boardDescription: string;
  boardId?: string;
  isDependencyOverlayVisible: boolean;
  setIsDependencyOverlayVisible: (visible: boolean) => void;
  setIsAddColumnDialogOpen: (open: boolean) => void;
  setIsDetailsPanelOpen: (open: boolean) => void;
}

export function BoardHeader({
  boardTitle,
  boardDescription,
  boardId,
  isDependencyOverlayVisible,
  setIsDependencyOverlayVisible,
  setIsAddColumnDialogOpen,
  setIsDetailsPanelOpen
}: BoardHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="bg-white border-b border-border/50 py-3 px-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground" 
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-semibold truncate">{boardTitle}</h1>
            <p className="text-xs text-muted-foreground truncate">{boardDescription}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Dependency Visualization Toggle Button */}
          <Button 
            variant={isDependencyOverlayVisible ? "default" : "outline"}
            size="sm" 
            className={`text-xs flex items-center gap-1 ${isDependencyOverlayVisible ? "bg-blue-600" : ""}`}
            onClick={() => setIsDependencyOverlayVisible(!isDependencyOverlayVisible)}
          >
            <Link className="h-4 w-4" />
            <span className="hidden sm:inline">Dependencies</span>
          </Button>
          
          {/* Activity Button */}
          {boardId && <ActivityPanel boardId={boardId} />}
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs hidden sm:flex items-center gap-1"
            onClick={() => setIsDetailsPanelOpen(true)}
          >
            <Users className="h-4 w-4" />
            <span>Members</span>
          </Button>
          
          <div className="hidden sm:block">
            <Separator orientation="vertical" className="h-6" />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsAddColumnDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Column
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDetailsPanelOpen(true)}>
                <Users className="h-4 w-4 mr-2" />
                Members
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsDependencyOverlayVisible(!isDependencyOverlayVisible)}>
                <Link className="h-4 w-4 mr-2" />
                {isDependencyOverlayVisible ? "Hide Dependencies" : "Show Dependencies"}
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
