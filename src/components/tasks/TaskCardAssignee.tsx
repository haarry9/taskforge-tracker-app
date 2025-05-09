
import React from 'react';
import { User } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useBoards } from '@/hooks/useBoards';

interface TaskCardAssigneeProps {
  assigneeId?: string | null;
  boardId: string;
}

export function TaskCardAssignee({ assigneeId, boardId }: TaskCardAssigneeProps) {
  const { useBoardMembers } = useBoards();
  const { data: boardMembers = [] } = useBoardMembers(boardId);
  
  if (!assigneeId) return null;
  
  const assignee = boardMembers.find(member => member.user_id === assigneeId);
  
  if (!assignee) return null;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="bg-gray-100 rounded-full p-1 flex items-center justify-center cursor-pointer">
            <User className="h-3 w-3 text-gray-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>Assigned to: {assignee.email}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
