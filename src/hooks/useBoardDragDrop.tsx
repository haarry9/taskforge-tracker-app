
import { useCallback } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { useTasks } from '@/hooks/useTasks';
import { useActivities } from '@/hooks/useActivities';
import { toast } from '@/components/ui/use-toast';
import { getTransitiveDependencies } from '@/utils/dependency-utils';
import { Task } from '@/types/task-types';
import { TaskDependency } from '@/types/dependency-types';
import { BoardColumn } from '@/hooks/useBoards';

export function useBoardDragDrop(
  boardId: string | undefined, 
  tasks: Task[], 
  dependencies: TaskDependency[], 
  columns?: BoardColumn[]
) {
  const { moveTask, getTasksByColumn } = useTasks(boardId);
  const { createActivity } = useActivities(boardId);

  // Handle drag end event with improved error handling and dependency validation
  const handleDragEnd = useCallback((result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // If there's no destination or the item was dropped back to its original position
    if (!destination) {
      return;
    }
    
    if (destination.droppableId === source.droppableId && 
        destination.index === source.index) {
      return;
    }
    
    const taskId = draggableId;
    const sourceColumnId = source.droppableId;
    const destinationColumnId = destination.droppableId;
    
    console.log(`[Drag end] Moving task ${taskId} from column ${sourceColumnId} to column ${destinationColumnId}`);
    
    const movedTask = tasks.find(task => task.id === taskId);
    if (!movedTask) {
      toast({
        title: "Error moving task",
        description: "Could not find the task you're trying to move.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if columns array exists and has items
    if (!columns || columns.length === 0) {
      toast({
        title: "Error moving task",
        description: "Board columns are not available.",
        variant: "destructive",
      });
      return;
    }

    // Find the last column (we assume it's the column with the highest position)
    const lastColumn = [...columns].sort((a, b) => b.position - a.position)[0];
    console.log(`[Drag end] Last column identified as: "${lastColumn.title}" (${lastColumn.id})`);
    
    // If moving to the last column, check dependencies
    if (destinationColumnId === lastColumn.id && sourceColumnId !== lastColumn.id) {
      console.log(`[Drag end] Task being moved to last column. Checking dependencies...`);
      
      // Check both direct and transitive dependencies
      const { canMove, blockingDependencies } = getTransitiveDependencies(
        taskId,
        tasks,
        dependencies,
        lastColumn.id
      );
      
      console.log(`[Drag end] Can move? ${canMove}. Blocking dependencies: ${blockingDependencies.join(', ')}`);
      
      if (!canMove) {
        // Format the dependency titles for display
        const dependencyList = blockingDependencies.join(', ');
        
        // Show a toast with the error message
        toast({
          title: `Cannot move "${movedTask.title}" to ${lastColumn.title}`,
          description: `The following dependencies must be in ${lastColumn.title} first: ${dependencyList}`,
          variant: "destructive",
        });
        return;
      }
    }
    
    const sourceColumnTitle = columns?.find(col => col.id === sourceColumnId)?.title || "Unknown";
    const destinationColumnTitle = columns?.find(col => col.id === destinationColumnId)?.title || "Unknown";
    
    // Calculate new position
    const destinationTasks = getTasksByColumn(destinationColumnId);
    let newPosition = 0;
    
    try {
      if (destination.index === 0) {
        // If dropped at the beginning
        const firstTask = destinationTasks[0];
        newPosition = firstTask ? firstTask.position / 2 : 0;
      } else if (destination.index >= destinationTasks.length) {
        // If dropped at the end
        const lastTask = destinationTasks[destinationTasks.length - 1];
        newPosition = lastTask ? lastTask.position + 1 : destination.index;
      } else {
        // If dropped in the middle
        const beforeTask = destinationTasks[destination.index - 1];
        const afterTask = destinationTasks[destination.index];
        newPosition = (beforeTask.position + afterTask.position) / 2;
      }
      
      // Move the task
      moveTask({
        taskId,
        newColumnId: destinationColumnId,
        oldColumnId: sourceColumnId,
        newPosition
      }, {
        onSuccess: () => {
          // Only log activity if the column changed
          if (sourceColumnId !== destinationColumnId) {
            createActivity({
              board_id: boardId || "",
              action_type: "move",
              action_description: `Moved task "${movedTask.title}"`,
              task_id: taskId,
              metadata: {
                from_column: sourceColumnTitle,
                to_column: destinationColumnTitle
              }
            });
          }
        },
        onError: (error) => {
          console.error("Error moving task:", error);
        }
      });
    } catch (error) {
      console.error("Error in drag end handler:", error);
      toast({
        title: "Error moving task",
        description: "There was an error moving the task. Please try again.",
        variant: "destructive",
      });
    }
  }, [tasks, columns, boardId, moveTask, createActivity, getTasksByColumn, dependencies]);

  return {
    handleDragEnd
  };
}
