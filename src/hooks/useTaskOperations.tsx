
import { useState } from 'react';
import { useTasks, Task, NewTask } from '@/hooks/useTasks';
import { useActivities } from '@/hooks/useActivities';
import { toast } from '@/components/ui/use-toast';

export function useTaskOperations(boardId: string | undefined, columns: any[] | undefined) {
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [currentColumnId, setCurrentColumnId] = useState<string>("");
  
  const { 
    tasks, 
    isLoading: isTasksLoading, 
    isError: isTasksError, 
    createTask, 
    updateTask, 
    moveTask, 
    deleteTask, 
    getTasksByColumn 
  } = useTasks(boardId);

  // Activities hook for logging actions
  const { createActivity } = useActivities(boardId);

  // Handle opening the add task dialog for a specific column
  const handleAddTaskClick = (columnId: string) => {
    setCurrentColumnId(columnId);
    return true; // Signal to open dialog
  };

  // Handle creating a new task with dependencies
  const handleCreateTask = (taskData: NewTask, dependencyIds?: string[]) => {
    createTask(taskData, {
      onSuccess: (newTask) => {
        // Log activity when task is created
        const columnName = columns?.find(col => col.id === taskData.column_id)?.title || "Unknown";
        createActivity({
          board_id: boardId || "",
          action_type: "create",
          action_description: `Created task "${taskData.title}" in ${columnName}`,
          task_id: newTask.id,
          metadata: {
            column_name: columnName
          }
        });
        
        return { newTask, dependencyIds }; // Return for dependency creation
      }
    });
  };
  
  // Handle editing a task
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setCurrentColumnId(task.column_id);
    return true; // Signal to open edit dialog
  };
  
  // Handle updating a task with dependencies
  const handleUpdateTask = (taskData: NewTask, dependencyIds?: string[]) => {
    if (currentTask) {
      updateTask({
        taskId: currentTask.id,
        updates: {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          due_date: taskData.due_date ? taskData.due_date.toISOString() : null
        }
      }, {
        onSuccess: () => {
          // Log activity for task update
          createActivity({
            board_id: boardId || "",
            action_type: "update",
            action_description: `Updated task "${taskData.title}"`,
            task_id: currentTask.id
          });
          
          return { updatedTaskId: currentTask.id, dependencyIds }; // Return for dependency updates
        }
      });
    }
  };
  
  // Handle deleting a task
  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete) {
      deleteTask(taskId, {
        onSuccess: () => {
          // Log activity for task deletion
          const columnName = columns?.find(col => col.id === taskToDelete.column_id)?.title || "Unknown";
          createActivity({
            board_id: boardId || "",
            action_type: "delete",
            action_description: `Deleted task "${taskToDelete.title}" from ${columnName}`,
            task_id: null, // Task is deleted, so we don't reference it
            metadata: {
              column_name: columnName
            }
          });
        }
      });
    }
  };

  return {
    tasks,
    isTasksLoading,
    isTasksError,
    currentTask,
    currentColumnId,
    setCurrentColumnId,
    handleAddTaskClick,
    handleCreateTask,
    handleEditTask,
    handleUpdateTask,
    handleDeleteTask,
    getTasksByColumn
  };
}
