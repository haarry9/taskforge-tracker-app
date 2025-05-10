
import { useDependencies } from '@/hooks/useDependencies';
import { useActivities } from '@/hooks/useActivities';
import { Task } from '@/hooks/useTasks';
import { toast } from '@/components/ui/use-toast';

export function useDependencyOperations(boardId: string | undefined, tasks: Task[]) {
  const {
    dependencies,
    isLoading: isDependenciesLoading,
    createDependency,
    deleteDependency
  } = useDependencies(boardId);

  // Activities hook for logging actions
  const { createActivity } = useActivities(boardId);

  // Handle creating dependencies for a task
  const handleCreateDependencies = (taskId: string, dependencyIds: string[]) => {
    if (!dependencyIds || dependencyIds.length === 0) return;
    
    console.log(`Creating dependencies for task ${taskId}:`, dependencyIds);
    
    dependencyIds.forEach(dependencyId => {
      createDependency({
        dependent_task_id: taskId,
        dependency_task_id: dependencyId
      }, {
        onSuccess: () => {
          // Log activity when dependency is created
          const dependencyTask = tasks.find(t => t.id === dependencyId);
          const dependentTask = tasks.find(t => t.id === taskId);
          if (dependencyTask && dependentTask) {
            createActivity({
              board_id: boardId || "",
              action_type: "create",
              action_description: `Added dependency: "${dependentTask.title}" depends on "${dependencyTask.title}"`,
              task_id: taskId,
              metadata: {
                dependency_task: dependencyTask.title
              }
            });
          }
        }
      });
    });
  };

  // Handle updating dependencies for a task
  const handleUpdateDependencies = (taskId: string, dependencyIds: string[]) => {
    if (!dependencyIds) return;
    
    console.log(`Updating dependencies for task ${taskId}:`, dependencyIds);
    
    // Get current dependencies
    const currentDeps = dependencies.filter(
      dep => dep.dependent_task_id === taskId
    );
    const currentDepIds = currentDeps.map(dep => dep.dependency_task_id);
    
    // Find dependencies to add and remove
    const depsToAdd = dependencyIds.filter(
      id => !currentDepIds.includes(id)
    );
    const depsToRemove = currentDeps.filter(
      dep => !dependencyIds.includes(dep.dependency_task_id)
    );
    
    console.log('Dependencies to add:', depsToAdd);
    console.log('Dependencies to remove:', depsToRemove);
    
    // Add new dependencies
    depsToAdd.forEach(depId => {
      createDependency({
        dependent_task_id: taskId,
        dependency_task_id: depId
      }, {
        onSuccess: () => {
          const dependencyTask = tasks.find(t => t.id === depId);
          const dependentTask = tasks.find(t => t.id === taskId);
          if (dependencyTask && dependentTask) {
            createActivity({
              board_id: boardId || "",
              action_type: "create",
              action_description: `Added dependency: "${dependentTask.title}" depends on "${dependencyTask.title}"`,
              task_id: taskId,
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
      handleDeleteDependency(dep.id);
    });
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

  return {
    dependencies,
    isDependenciesLoading,
    handleCreateDependencies,
    handleUpdateDependencies,
    handleDeleteDependency
  };
}
