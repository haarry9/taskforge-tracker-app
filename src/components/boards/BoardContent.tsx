
import React from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Task } from '@/hooks/useTasks';
import { BoardColumn } from './BoardColumn';
import { EmptyBoardState } from './EmptyBoardState';
import { BoardColumn as BoardColumnType } from '@/hooks/useBoards';
import DependencyOverlay from '@/components/tasks/DependencyOverlay';
import { TaskDependency } from '@/hooks/useDependencies';

interface BoardContentProps {
  columns: BoardColumnType[] | undefined;
  tasks: Task[];
  dependencies: TaskDependency[];
  getTasksByColumn: (columnId: string) => Task[];
  isDependencyOverlayVisible: boolean;
  onDragEnd: (result: DropResult) => void;
  onAddTask: (columnId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onAddColumn: () => void;
  onDeleteDependency: (dependencyId: string) => void;
  setIsDependencyOverlayVisible: (visible: boolean) => void;
}

export function BoardContent({
  columns,
  tasks,
  dependencies,
  getTasksByColumn,
  isDependencyOverlayVisible,
  onDragEnd,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onAddColumn,
  onDeleteDependency,
  setIsDependencyOverlayVisible
}: BoardContentProps) {
  return (
    <div className="flex-1 overflow-x-auto p-4 relative">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4 h-full">
          {columns?.length === 0 ? (
            <EmptyBoardState onAddColumn={onAddColumn} />
          ) : (
            columns?.map((column) => {
              const columnTasks = getTasksByColumn(column.id);
              return (
                <BoardColumn
                  key={column.id}
                  column={column}
                  tasks={columnTasks}
                  onAddTask={onAddTask}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                />
              );
            })
          )}
          
          {columns?.length > 0 && (
            <div className="min-w-[280px]">
              <Button 
                variant="outline" 
                className="h-12 flex items-center justify-center w-full border-dashed"
                onClick={onAddColumn}
              >
                <Plus className="h-4 w-4 mr-2" /> 
                Add Column
              </Button>
            </div>
          )}
        </div>
      </DragDropContext>
      
      {/* Dependency Visualization Overlay */}
      {isDependencyOverlayVisible && (
        <DependencyOverlay 
          isVisible={isDependencyOverlayVisible}
          onClose={() => setIsDependencyOverlayVisible(false)}
          dependencies={dependencies}
          tasks={tasks}
          onDeleteDependency={onDeleteDependency}
        />
      )}
    </div>
  );
}
