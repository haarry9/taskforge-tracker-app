
import React from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { Task } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';

interface BoardColumnProps {
  column: {
    id: string;
    title: string;
  };
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
}

export function BoardColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask
}: BoardColumnProps) {
  return (
    <div 
      key={column.id} 
      className="board-column flex flex-col min-w-[300px] max-w-[300px]"
    >
      <div className="column-header text-foreground bg-gray-50 p-2 rounded-t-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="font-medium truncate">{column.title}</span>
            <span className="ml-2 text-xs bg-accent px-2 py-0.5 rounded-full text-muted-foreground">
              {tasks.length}
            </span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent" 
            onClick={() => onAddTask(column.id)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <Droppable droppableId={column.id} type="TASK">
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={cn(
              "flex-1 p-2 overflow-y-auto rounded-b-md min-h-[300px]",
              snapshot.isDraggingOver ? 'bg-blue-50/50' : 'bg-gray-50'
            )}
            data-column-id={column.id}
          >
            {tasks.length > 0 ? (
              tasks.map((task, index) => (
                <Draggable 
                  key={task.id} 
                  draggableId={task.id} 
                  index={index}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className={cn("mb-3", snapshot.isDragging ? 'opacity-70' : '')}
                      data-task-id={task.id}
                    >
                      <TaskCard 
                        task={task}
                        onEdit={onEditTask}
                        onDelete={onDeleteTask}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  No tasks yet
                </p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="mt-2 text-xs" 
                  onClick={() => onAddTask(column.id)}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add task
                </Button>
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
