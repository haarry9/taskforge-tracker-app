
import { useState } from 'react';
import { useColumnOperations } from '@/hooks/useColumnOperations';
import { useTaskOperations } from '@/hooks/useTaskOperations';
import { useDependencyOperations } from '@/hooks/useDependencyOperations';
import { useDragAndDrop } from '@/hooks/useDragAndDrop';
import { useActivities } from '@/hooks/useActivities';
import { useTasks } from '@/hooks/useTasks';

export function useBoardPage(boardId: string | undefined) {
  // UI state
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState<boolean>(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState<boolean>(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState<boolean>(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState<boolean>(false);
  const [isDependencyOverlayVisible, setIsDependencyOverlayVisible] = useState<boolean>(false);

  // Get column operations
  const {
    columns,
    isColumnsLoading,
    isColumnsError,
    handleAddColumn
  } = useColumnOperations(boardId);

  // Get task operations
  const {
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
  } = useTaskOperations(boardId, columns);

  // Get dependency operations
  const {
    dependencies,
    isDependenciesLoading,
    handleCreateDependencies,
    handleUpdateDependencies,
    handleDeleteDependency
  } = useDependencyOperations(boardId, tasks);

  // Activities hook for dnd logging
  const { createActivity } = useActivities(boardId);
  
  // Get task operations needed for drag and drop
  const { moveTask } = useTasks(boardId);

  // Get drag and drop handler
  const { handleDragEnd } = useDragAndDrop(
    tasks, 
    columns, 
    moveTask, 
    getTasksByColumn, 
    createActivity, 
    boardId
  );

  // Wrap handleAddTaskClick to manage dialog state
  const onAddTaskClick = (columnId: string) => {
    setCurrentColumnId(columnId);
    setIsAddTaskDialogOpen(true);
  };

  // Wrap handleEditTask to manage dialog state
  const onEditTask = (task: Task) => {
    handleEditTask(task);
    setIsEditTaskDialogOpen(true);
  };

  // Wrap handleCreateTask to handle dependencies
  const onCreateTask = (taskData: NewTask, dependencyIds: string[]) => {
    handleCreateTask(taskData, {
      onSuccess: (newTask) => {
        if (newTask && dependencyIds && dependencyIds.length > 0) {
          handleCreateDependencies(newTask.id, dependencyIds);
        }
      }
    });
  };

  // Wrap handleUpdateTask to handle dependencies
  const onUpdateTask = (taskData: NewTask, dependencyIds: string[]) => {
    if (!currentTask) return;
    
    handleUpdateTask(taskData, {
      onSuccess: (result) => {
        if (result && dependencyIds) {
          handleUpdateDependencies(currentTask.id, dependencyIds);
        }
      }
    });
  };

  // Find the board data from tasks array to display board info
  const board = tasks && tasks.length > 0 
    ? { title: "Board", description: "Loading..." } // Default values
    : { title: "Board", description: "No tasks yet" };

  return {
    // State
    isAddTaskDialogOpen,
    isEditTaskDialogOpen,
    isAddColumnDialogOpen,
    isDetailsPanelOpen,
    isDependencyOverlayVisible,
    currentColumnId,
    currentTask,
    
    // Data
    columns,
    tasks,
    dependencies,
    board,
    
    // Loading states
    isLoading: isColumnsLoading || isTasksLoading || isDependenciesLoading,
    isError: isColumnsError || isTasksError,
    
    // Action handlers
    setIsAddTaskDialogOpen,
    setIsEditTaskDialogOpen,
    setIsAddColumnDialogOpen,
    setIsDetailsPanelOpen,
    setIsDependencyOverlayVisible,
    handleAddTaskClick: onAddTaskClick,
    handleCreateTask: onCreateTask,
    handleEditTask: onEditTask,
    handleUpdateTask: onUpdateTask,
    handleDeleteTask,
    handleDeleteDependency,
    handleAddColumn,
    handleDragEnd,
    getTasksByColumn
  };
}

// Type import needed for onEditTask
import { Task } from '@/hooks/useTasks';
import { NewTask } from '@/types/task-types';
