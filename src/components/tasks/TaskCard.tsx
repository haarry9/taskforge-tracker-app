
import React from 'react';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  // Define priority badge colors
  const priorityColors = {
    Low: "bg-blue-100 text-blue-800",
    Medium: "bg-yellow-100 text-yellow-800",
    High: "bg-red-100 text-red-800",
  };

  return (
    <Card className="mb-2 shadow-sm border hover:shadow-md transition-shadow">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-sm">{task.title}</h3>
          <div className="flex">
            <DropdownMenu>
              <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-muted focus:outline-none">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(task)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}
        
        <div className="flex justify-between items-center pt-1">
          <span 
            className={cn(
              "px-2 py-0.5 rounded-full text-xs font-medium",
              priorityColors[task.priority]
            )}
          >
            {task.priority}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
