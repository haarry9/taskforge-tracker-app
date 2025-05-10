
import { useCallback } from 'react';
import { DropResult } from 'react-beautiful-dnd';
import { Task } from '@/hooks/useTasks';
import { toast } from '@/components/ui/use-toast';

export function useDragAndDrop(
  tasks: Task[], 
  columns: any[] | undefined, 
  moveTask: Function, 
  getTasksByColumn: Function,
  createActivity: Function,
  boardId: string | undefined
) {
  // Handle drag end event with improved error handling and logging
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
    
    const movedTask = tasks.find(task => task.id === taskId);
    if (!movedTask) {
      toast({
        title: "Error moving task",
        description: "Could not find the task you're trying to move.",
        variant: "destructive",
      });
      return;
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
        onError: (error: any) => {
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
  }, [tasks, columns, boardId, moveTask, createActivity, getTasksByColumn]);

  return { handleDragEnd };
}
