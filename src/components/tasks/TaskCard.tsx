
import React from 'react';
import { format } from 'date-fns';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { MoreHorizontal, Calendar, GripVertical } from 'lucide-react';
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

// Function to determine the sticky note background color based on priority
const getStickyNoteColor = (priority: string) => {
  switch (priority) {
    case 'High':
      return 'bg-amber-100 hover:bg-amber-200';
    case 'Medium':
      return 'bg-blue-100 hover:bg-blue-200';
    case 'Low':
      return 'bg-green-100 hover:bg-green-200';
    default:
      return 'bg-yellow-100 hover:bg-yellow-200';
  }
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  // Define priority badge colors
  const priorityColors = {
    Low: "bg-green-100 text-green-700",
    Medium: "bg-blue-100 text-blue-700",
    High: "bg-red-100 text-red-700",
  };

  // Format the due date if it exists
  const formattedDueDate = task.due_date ? format(new Date(task.due_date), 'MMM d') : null;
  
  // Calculate if task is overdue
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && new Date(task.due_date).setHours(0,0,0,0) !== new Date().setHours(0,0,0,0);

  return (
    <Card 
      className={cn(
        "relative border shadow-sm transition-all duration-200 rotate-0 hover:-rotate-1",
        getStickyNoteColor(task.priority),
        "transform-gpu"
      )}
      onClick={(e) => {
        // Prevent click if we're clicking the dropdown menu
        if (!(e.target as HTMLElement).closest('.task-dropdown')) {
          onEdit(task);
        }
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full opacity-0 hover:opacity-10 bg-black z-10"></div>
      <div className="absolute top-0 left-0 w-6 h-full cursor-grab active:cursor-grabbing"></div>
      <CardContent className="p-3 space-y-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <GripVertical className="h-4 w-4 mr-2 text-gray-400 cursor-grab active:cursor-grabbing" />
            <h3 className="font-medium text-gray-800">{task.title}</h3>
          </div>
          <div className="flex task-dropdown">
            <DropdownMenu>
              <DropdownMenuTrigger className="h-7 w-7 inline-flex items-center justify-center rounded-md hover:bg-black/10 focus:outline-none cursor-pointer z-20">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-lg">
                <DropdownMenuItem onClick={() => onEdit(task)} className="rounded hover:bg-blue-50 cursor-pointer">
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="text-red-600 rounded hover:bg-red-50 cursor-pointer"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {task.description && (
          <p className="text-sm text-gray-700 whitespace-pre-wrap break-words pl-6">
            {task.description}
          </p>
        )}
        
        <div className="flex justify-between items-center pt-1 pl-6">
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
