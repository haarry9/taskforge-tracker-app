
import React, { useState, useEffect } from 'react';
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Task } from '@/types/task-types';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TasksByColumn {
  [columnId: string]: {
    columnTitle: string;
    tasks: Task[];
  };
}

interface DependencySelectProps {
  boardId: string;
  columnId: string;
  availableTasks: Task[];
  selectedTaskIds: string[];
  currentTaskId?: string;
  onSelectDependencies: (taskIds: string[]) => void;
}

export default function DependencySelect({
  availableTasks,
  selectedTaskIds,
  currentTaskId,
  onSelectDependencies,
}: DependencySelectProps) {
  const [open, setOpen] = useState(false);
  const [tasksByColumn, setTasksByColumn] = useState<TasksByColumn>({});
  const [selectedIds, setSelectedIds] = useState<string[]>(selectedTaskIds);

  useEffect(() => {
    // Group tasks by column
    const groupedTasks: TasksByColumn = {};
    
    // Create a map of column IDs to column titles
    const columnMap = new Map<string, string>();
    availableTasks.forEach(task => {
      // Find all unique columns
      if (!columnMap.has(task.column_id)) {
        // Try to find any task with this column_id to use its column as reference
        const tasksInColumn = availableTasks.filter(t => t.column_id === task.column_id);
        if (tasksInColumn.length > 0) {
          // For simplicity, we'll just use the first task's column info
          columnMap.set(task.column_id, `Column ${task.column_id.substring(0, 4)}...`);
        }
      }
    });
    
    availableTasks.forEach(task => {
      // Skip the current task as it can't depend on itself
      if (currentTaskId && task.id === currentTaskId) {
        return;
      }

      if (!groupedTasks[task.column_id]) {
        groupedTasks[task.column_id] = {
          columnTitle: columnMap.get(task.column_id) || `Column ${task.column_id.substring(0, 4)}...`,
          tasks: []
        };
      }
      
      groupedTasks[task.column_id].tasks.push(task);
    });
    
    setTasksByColumn(groupedTasks);
  }, [availableTasks, currentTaskId]);

  const toggleTask = (taskId: string) => {
    const updatedSelection = selectedIds.includes(taskId)
      ? selectedIds.filter(id => id !== taskId)
      : [...selectedIds, taskId];
    
    setSelectedIds(updatedSelection);
    onSelectDependencies(updatedSelection);
  };

  const removeTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSelection = selectedIds.filter(id => id !== taskId);
    setSelectedIds(updatedSelection);
    onSelectDependencies(updatedSelection);
  };

  // Find selected task objects to display badges
  const selectedTasks = availableTasks.filter(task => 
    selectedIds.includes(task.id)
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedIds.length > 0 
              ? `${selectedIds.length} dependencies selected` 
              : "Select dependencies"}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tasks..." />
            <CommandEmpty>No tasks found.</CommandEmpty>
            <CommandList>
              <ScrollArea className="h-[300px]">
                {Object.entries(tasksByColumn).map(([columnId, { columnTitle, tasks }]) => (
                  <CommandGroup key={columnId} heading={columnTitle}>
                    {tasks.map((task) => (
                      <CommandItem
                        key={task.id}
                        value={`${task.id}-${task.title}`}
                        onSelect={() => toggleTask(task.id)}
                        className="cursor-pointer"
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedIds.includes(task.id) ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{task.title}</span>
                          <span className="text-xs text-muted-foreground truncate">
                            {task.description?.substring(0, 30) || "No description"}
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </ScrollArea>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Selected dependencies badges */}
      {selectedTasks.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {selectedTasks.map((task) => (
            <Badge key={task.id} variant="secondary" className="px-2 py-1">
              {task.title.length > 30 
                ? task.title.substring(0, 30) + '...' 
                : task.title}
              <button 
                onClick={(e) => removeTask(task.id, e)} 
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
