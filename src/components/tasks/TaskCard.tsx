
import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Calendar } from 'lucide-react';
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
  // Define priority badge colors with updated blue theme
  const priorityColors = {
    Low: "bg-blue-100 text-blue-700",
    Medium: "bg-yellow-100 text-yellow-700",
    High: "bg-red-100 text-red-700",
  };

  // Format the due date if it exists
  const formattedDueDate = task.due_date ? format(new Date(task.due_date), 'MMM d') : null;
  
  // Calculate if task is overdue
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && new Date(task.due_date).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);

  return (
    <Card className="mb-2 shadow-sm border hover:shadow-md transition-shadow rounded-lg bg-white">
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-medium text-sm text-blue-800">{task.title}</h3>
          <div className="flex">
            <DropdownMenu>
              <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-blue-50 focus:outline-none">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-lg">
                <DropdownMenuItem onClick={() => onEdit(task)} className="rounded hover:bg-blue-50">
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(task.id)}
                  className="text-red-600 rounded hover:bg-red-50"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.description && (
          <p className="text-xs text-slate-600 line-clamp-2">
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

          {formattedDueDate && (
            <div className={cn(
              "flex items-center text-xs py-0.5 px-2 rounded-full",
              isOverdue ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"
            )}>
              <Calendar className="h-3 w-3 mr-1" />
              <span>{formattedDueDate}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
