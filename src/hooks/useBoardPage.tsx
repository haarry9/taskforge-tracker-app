
import { useState } from 'react';
import { useTaskManagement } from '@/hooks/useTaskManagement';
import { useDependencyManagement } from '@/hooks/useDependencyManagement';
import { useBoardColumns } from '@/hooks/useBoardColumns';
import { useBoardDragDrop } from '@/hooks/useBoardDragDrop';
import { Task, NewTask } from '@/hooks/useTasks';
import { useActivities } from '@/hooks/useActivities';
import { useTasks } from '@/hooks/useTasks';
import { DropResult } from 'react-beautiful-dnd';

export function useBoardPage(boardId: string | undefined) {
  // UI state
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState<boolean>(false);
  const [isDependencyOverlayVisible, setIsDependencyOverlayVisible] = useState<boolean>(false);
  
  // Initialize task-related hooks
  const taskManagement = useTaskManagement(boardId);
  const columnManagement = useBoardColumns(boardId);
  
  // Get tasks and columns from respective hooks
  const { tasks } = taskManagement;
  const { columns } = columnManagement;
  
  // Initialize dependency management hook with tasks
  const dependencyManagement = useDependencyManagement(boardId);
  const { dependencies } = dependencyManagement;
  
  // Initialize drag-drop hook with all required data
  const dragDrop = useBoardDragDrop(boardId, tasks, dependencies, columns);
  
  // Access direct API functions for creating tasks and activities
  const { createTask, updateTask } = useTasks(boardId);
  const { createActivity } = useActivities(boardId);

  // Combined handlers for tasks with dependencies
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
        
        // Add dependencies if provided
        if (dependencyIds && dependencyIds.length > 0) {
          dependencyManagement.handleCreateDependencies(newTask, dependencyIds, tasks);
        }
      }
    });
  };
  
  const handleUpdateTask = (taskData: NewTask, dependencyIds?: string[]) => {
    if (taskManagement.currentTask) {
      updateTask({
        taskId: taskManagement.currentTask.id,
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
            task_id: taskManagement.currentTask!.id
          });
          
          // Handle dependencies if provided
          dependencyManagement.handleUpdateDependencies(taskManagement.currentTask!, dependencyIds, tasks);
        }
      });
    }
  };

  // Find the board data from tasks array to display board info
  const board = tasks && tasks.length > 0 
    ? { title: "Board", description: "Loading..." } // Default values
    : { title: "Board", description: "No tasks yet" };

  return {
    // State
    isAddTaskDialogOpen: taskManagement.isAddTaskDialogOpen,
    isEditTaskDialogOpen: taskManagement.isEditTaskDialogOpen,
    isAddColumnDialogOpen: columnManagement.isAddColumnDialogOpen,
    isDetailsPanelOpen,
    isDependencyOverlayVisible,
    currentColumnId: taskManagement.currentColumnId,
    currentTask: taskManagement.currentTask,
    
    // Data
    columns,
    tasks,
    dependencies,
    board,
    
    // Loading states
    isLoading: columnManagement.isColumnsLoading || taskManagement.isTasksLoading || dependencyManagement.isDependenciesLoading,
    isError: columnManagement.isColumnsError || taskManagement.isTasksError,
    
    // Action handlers
    setIsAddTaskDialogOpen: taskManagement.setIsAddTaskDialogOpen,
    setIsEditTaskDialogOpen: taskManagement.setIsEditTaskDialogOpen,
    setIsAddColumnDialogOpen: columnManagement.setIsAddColumnDialogOpen,
    setIsDetailsPanelOpen,
    setIsDependencyOverlayVisible,
    handleAddTaskClick: taskManagement.handleAddTaskClick,
    handleCreateTask,
    handleEditTask: taskManagement.handleEditTask,
    handleUpdateTask,
    handleDeleteTask: (taskId: string) => taskManagement.handleDeleteTask(taskId, columns),
    handleDeleteDependency: (dependencyId: string) => dependencyManagement.handleDeleteDependency(dependencyId, tasks),
    handleAddColumn: columnManagement.handleAddColumn,
    handleDragEnd: dragDrop.handleDragEnd,
    getTasksByColumn: taskManagement.getTasksByColumn
  };
}
