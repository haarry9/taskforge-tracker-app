
import { useState } from 'react';
import { useTasks, Task, NewTask } from '@/hooks/useTasks';
import { useActivities } from '@/hooks/useActivities';
import { toast } from '@/components/ui/use-toast';

export function useTaskManagement(boardId: string | undefined) {
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);
  const [currentColumnId, setCurrentColumnId] = useState<string>("");
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState<boolean>(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState<boolean>(false);

  // Fetch tasks for this board
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

  // Activities hook
  const { createActivity } = useActivities(boardId);

  // Handle opening the add task dialog for a specific column
  const handleAddTaskClick = (columnId: string) => {
    setCurrentColumnId(columnId);
    setIsAddTaskDialogOpen(true);
  };

  // Handle creating a new task
  const handleCreateTask = (taskData: NewTask, dependencyIds?: string[]) => {
    createTask(taskData, {
      onSuccess: (newTask) => {
        // Return the new task and dependency IDs to be handled by dependency management
        return { newTask, dependencyIds };
      }
    });
  };
  
  // Handle editing a task
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setCurrentColumnId(task.column_id);
    setIsEditTaskDialogOpen(true);
  };
  
  // Handle updating a task 
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
          
          // Return current task and dependency IDs to be handled by dependency management
          return { currentTask, dependencyIds };
        }
      });
    }
  };
  
  // Handle deleting a task
  const handleDeleteTask = (taskId: string, columns?: any[]) => {
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
    currentTask,
    currentColumnId,
    isAddTaskDialogOpen,
    isEditTaskDialogOpen,
    isTasksLoading,
    isTasksError,
    setCurrentTask,
    setCurrentColumnId,
    setIsAddTaskDialogOpen,
    setIsEditTaskDialogOpen,
    handleAddTaskClick,
    handleCreateTask,
    handleEditTask,
    handleUpdateTask,
    handleDeleteTask,
    getTasksByColumn
  };
}
