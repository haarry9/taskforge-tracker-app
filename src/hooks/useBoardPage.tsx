
import { useState, useCallback } from 'react';
import { useBoards } from '@/hooks/useBoards';
import { useTasks, Task, NewTask } from '@/hooks/useTasks';
import { useActivities } from '@/hooks/useActivities';
import { useDependencies } from '@/hooks/useDependencies';
import { toast } from '@/components/ui/use-toast';
import { DropResult } from 'react-beautiful-dnd';
import { getTransitiveDependencies } from '@/utils/dependency-utils';

export function useBoardPage(boardId: string | undefined) {
  const { useBoardColumns, useAddColumnMutation } = useBoards();
  
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState<boolean>(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState<boolean>(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState<boolean>(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState<boolean>(false);
  const [isDependencyOverlayVisible, setIsDependencyOverlayVisible] = useState<boolean>(false);
  const [currentColumnId, setCurrentColumnId] = useState<string>("");
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);

  // Fetch columns for this board
  const { data: columns, isLoading: isColumnsLoading, isError: isColumnsError } = useBoardColumns(boardId);
  
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

  // Fetch dependencies for this board
  const {
    dependencies,
    isLoading: isDependenciesLoading,
    createDependency,
    deleteDependency
  } = useDependencies(boardId);

  // Activities hook
  const { createActivity } = useActivities(boardId);

  // Mutation for adding a column
  const { mutate: addColumn, isPending: isAddingColumn } = useAddColumnMutation(boardId);

  // Handle opening the add task dialog for a specific column
  const handleAddTaskClick = (columnId: string) => {
    setCurrentColumnId(columnId);
    setIsAddTaskDialogOpen(true);
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
        
        // Add dependencies if provided
        if (dependencyIds && dependencyIds.length > 0) {
          dependencyIds.forEach(dependencyId => {
            createDependency({
              dependent_task_id: newTask.id,
              dependency_task_id: dependencyId
            }, {
              onSuccess: () => {
                // Log activity when dependency is created
                const dependencyTask = tasks.find(t => t.id === dependencyId);
                if (dependencyTask) {
                  createActivity({
                    board_id: boardId || "",
                    action_type: "create",
                    action_description: `Added dependency: "${newTask.title}" depends on "${dependencyTask.title}"`,
                    task_id: newTask.id,
                    metadata: {
                      dependency_task: dependencyTask.title
                    }
                  });
                }
              }
            });
          });
        }
      }
    });
  };
  
  // Handle editing a task
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setCurrentColumnId(task.column_id);
    setIsEditTaskDialogOpen(true);
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
          
          // Handle dependencies if provided
          if (dependencyIds) {
            // Get current dependencies
            const currentDeps = dependencies.filter(
              dep => dep.dependent_task_id === currentTask.id
            );
            const currentDepIds = currentDeps.map(dep => dep.dependency_task_id);
            
            // Find dependencies to add and remove
            const depsToAdd = dependencyIds.filter(
              id => !currentDepIds.includes(id)
            );
            const depsToRemove = currentDeps.filter(
              dep => !dependencyIds.includes(dep.dependency_task_id)
            );
            
            // Add new dependencies
            depsToAdd.forEach(depId => {
              createDependency({
                dependent_task_id: currentTask.id,
                dependency_task_id: depId
              }, {
                onSuccess: () => {
                  const dependencyTask = tasks.find(t => t.id === depId);
                  if (dependencyTask) {
                    createActivity({
                      board_id: boardId || "",
                      action_type: "create",
                      action_description: `Added dependency: "${currentTask.title}" depends on "${dependencyTask.title}"`,
                      task_id: currentTask.id,
                      metadata: {
                        dependency_task: dependencyTask.title
                      }
                    });
                  }
                }
              });
            });
            
            // Remove deleted dependencies
            depsToRemove.forEach(dep => {
              deleteDependency(dep.id, {
                onSuccess: () => {
                  const dependencyTask = tasks.find(t => t.id === dep.dependency_task_id);
                  if (dependencyTask) {
                    createActivity({
                      board_id: boardId || "",
                      action_type: "delete",
                      action_description: `Removed dependency: "${currentTask.title}" no longer depends on "${dependencyTask.title}"`,
                      task_id: currentTask.id,
                      metadata: {
                        dependency_task: dependencyTask.title
                      }
                    });
                  }
                }
              });
            });
          }
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

  // Handle deleting a dependency
  const handleDeleteDependency = (dependencyId: string) => {
    const dependency = dependencies.find(dep => dep.id === dependencyId);
    if (dependency) {
      const dependentTask = tasks.find(t => t.id === dependency.dependent_task_id);
      const dependencyTask = tasks.find(t => t.id === dependency.dependency_task_id);
      
      deleteDependency(dependencyId, {
        onSuccess: () => {
          // Log activity for dependency deletion
          if (dependentTask && dependencyTask) {
            createActivity({
              board_id: boardId || "",
              action_type: "delete",
              action_description: `Removed dependency: "${dependentTask.title}" no longer depends on "${dependencyTask.title}"`,
              task_id: dependentTask.id,
              metadata: {
                dependency_task: dependencyTask.title
              }
            });
          }
          
          toast({
            title: "Dependency removed",
            description: "The task dependency has been removed.",
          });
        }
      });
    }
  };

  // Handle adding a new column
  const handleAddColumn = (title: string) => {
    if (boardId) {
      addColumn(title);
    }
  };
  
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
    handleAddTaskClick,
    handleCreateTask,
    handleEditTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDeleteDependency,
    handleAddColumn,
    handleDragEnd,
    getTasksByColumn
  };
}
