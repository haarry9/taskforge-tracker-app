
import { useDependencies } from '@/hooks/useDependencies';
import { useActivities } from '@/hooks/useActivities';
import { toast } from '@/components/ui/use-toast';
import { Task } from '@/types/task-types';

export function useDependencyManagement(boardId: string | undefined) {
  // Fetch dependencies for this board
  const {
    dependencies,
    isLoading: isDependenciesLoading,
    createDependency,
    deleteDependency
  } = useDependencies(boardId);

  // Activities hook
  const { createActivity } = useActivities(boardId);

  // Handle creating task dependencies
  const handleCreateDependencies = (task: Task, dependencyIds?: string[], allTasks?: Task[]) => {
    if (!dependencyIds || dependencyIds.length === 0) return;
    
    dependencyIds.forEach(dependencyId => {
      createDependency({
        dependent_task_id: task.id,
        dependency_task_id: dependencyId
      }, {
        onSuccess: () => {
          // Log activity when dependency is created
          const dependencyTask = allTasks?.find(t => t.id === dependencyId);
          if (dependencyTask) {
            createActivity({
              board_id: boardId || "",
              action_type: "create",
              action_description: `Added dependency: "${task.title}" depends on "${dependencyTask.title}"`,
              task_id: task.id,
              metadata: {
                dependency_task: dependencyTask.title
              }
            });
          }
        }
      });
    });
  };

  // Handle updating task dependencies
  const handleUpdateDependencies = (task: Task, dependencyIds?: string[], allTasks?: Task[]) => {
    if (!dependencyIds) return;
    
    // Get current dependencies
    const currentDeps = dependencies.filter(
      dep => dep.dependent_task_id === task.id
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
        dependent_task_id: task.id,
        dependency_task_id: depId
      }, {
        onSuccess: () => {
          const dependencyTask = allTasks?.find(t => t.id === depId);
          if (dependencyTask) {
            createActivity({
              board_id: boardId || "",
              action_type: "create",
              action_description: `Added dependency: "${task.title}" depends on "${dependencyTask.title}"`,
              task_id: task.id,
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
          const dependencyTask = allTasks?.find(t => t.id === dep.dependency_task_id);
          if (dependencyTask) {
            createActivity({
              board_id: boardId || "",
              action_type: "delete",
              action_description: `Removed dependency: "${task.title}" no longer depends on "${dependencyTask.title}"`,
              task_id: task.id,
              metadata: {
                dependency_task: dependencyTask.title
              }
            });
          }
        }
      });
    });
  };

  // Handle deleting a dependency
  const handleDeleteDependency = (dependencyId: string, allTasks?: Task[]) => {
    const dependency = dependencies.find(dep => dep.id === dependencyId);
    if (dependency) {
      const dependentTask = allTasks?.find(t => t.id === dependency.dependent_task_id);
      const dependencyTask = allTasks?.find(t => t.id === dependency.dependency_task_id);
      
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

  return {
    dependencies,
    isDependenciesLoading,
    handleCreateDependencies,
    handleUpdateDependencies,
    handleDeleteDependency
  };
}
