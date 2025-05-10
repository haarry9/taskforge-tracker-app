import { supabase } from "@/integrations/supabase/client";
import { TaskDependency, NewTaskDependency } from "@/types/dependency-types";
import { toast } from "@/components/ui/use-toast";
import { Task } from "@/types/task-types";

// Fetch all dependencies for a board
export const fetchDependencies = async (boardId: string, userId: string | undefined): Promise<TaskDependency[]> => {
  if (!userId || !boardId) return [];
  
  // First get all task IDs belonging to this board
  const { data: taskIds, error: taskError } = await supabase
    .from("tasks")
    .select("id")
    .eq("board_id", boardId);
    
  if (taskError) {
    console.error("Error fetching task IDs:", taskError);
    return [];
  }
  
  if (!taskIds || taskIds.length === 0) {
    return [];
  }
  
  // Extract the IDs into an array
  const ids = taskIds.map(task => task.id);
  
  // Then get dependencies where the dependent_task_id is in our list
  const { data, error } = await supabase
    .from("task_dependencies")
    .select("*")
    .in("dependent_task_id", ids);

  if (error) {
    console.error("Error fetching dependencies:", error);
    toast({
      title: "Error fetching dependencies",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }

  return data as TaskDependency[];
};

// Create a new dependency relationship
export const createDependency = async (
  newDependency: NewTaskDependency,
  userId: string | undefined,
  checkCircular: (dependentId: string, dependencyId: string) => Promise<boolean>
): Promise<TaskDependency> => {
  if (!userId) throw new Error("User not authenticated");

  // Check for circular dependencies
  const circularCheck = await checkCircular(
    newDependency.dependent_task_id, 
    newDependency.dependency_task_id
  );

  if (circularCheck) {
    throw new Error("Cannot create circular dependency");
  }

  const { data, error } = await supabase
    .from("task_dependencies")
    .insert([newDependency])
    .select()
    .single();

  if (error) {
    console.error("Error creating dependency:", error);
    toast({
      title: "Error creating dependency",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }

  toast({
    title: "Dependency created",
    description: "Task dependency has been created successfully.",
  });

  return data as TaskDependency;
};

// Delete a dependency relationship
export const deleteDependency = async (dependencyId: string, userId: string | undefined): Promise<void> => {
  if (!userId) throw new Error("User not authenticated");
  
  const { error } = await supabase
    .from("task_dependencies")
    .delete()
    .eq("id", dependencyId);

  if (error) {
    console.error("Error deleting dependency:", error);
    toast({
      title: "Error deleting dependency",
      description: error.message,
      variant: "destructive",
    });
    throw error;
  }

  toast({
    title: "Dependency deleted",
    description: "Task dependency has been deleted successfully.",
  });
};

// Get dependencies for a specific task
export const getTaskDependencies = async (taskId: string, userId: string | undefined): Promise<TaskDependency[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("task_dependencies")
    .select("*")
    .eq("dependent_task_id", taskId);

  if (error) {
    console.error("Error fetching task dependencies:", error);
    return [];
  }

  return data as TaskDependency[];
};

// Get tasks that depend on a specific task
export const getTaskDependents = async (taskId: string, userId: string | undefined): Promise<TaskDependency[]> => {
  if (!userId) return [];

  const { data, error } = await supabase
    .from("task_dependencies")
    .select("*")
    .eq("dependency_task_id", taskId);

  if (error) {
    console.error("Error fetching task dependents:", error);
    return [];
  }

  return data as TaskDependency[];
};

// Check if adding a dependency would create a circular reference
export const checkCircularDependency = async (
  dependentTaskId: string, 
  dependencyTaskId: string
): Promise<boolean> => {
  // Simple case: direct circular reference
  if (dependentTaskId === dependencyTaskId) {
    return true;
  }

  // Check if the dependency task (B) already depends on the dependent task (A)
  // A -> B and we're checking if B -> A would create a circle
  const { data, error } = await supabase
    .from("task_dependencies")
    .select("*")
    .eq("dependent_task_id", dependencyTaskId)
    .eq("dependency_task_id", dependentTaskId);

  if (error) {
    console.error("Error checking circular dependency:", error);
    return false;
  }

  return data && data.length > 0;
  
  // Note: This is a simplified circular dependency check. A complete check
  // would need to traverse the full graph to find indirect circular references.
};

/**
 * Check if a task can be moved to the last column
 * @param taskId - The ID of the task being moved
 * @param allTasks - All tasks in the board
 * @param dependencies - All dependencies in the board
 * @param lastColumnId - ID of the last column
 * @returns An object with canMove (boolean) and blockingDependencies (array of task names)
 */
export const canMoveToLastColumn = (
  taskId: string,
  allTasks: Task[],
  dependencies: TaskDependency[],
  lastColumnId: string
): { 
  canMove: boolean; 
  blockingDependencies: string[] 
} => {
  // Find all tasks that the current task depends on
  const taskDependencies = dependencies.filter(
    dep => dep.dependent_task_id === taskId
  );
  
  if (taskDependencies.length === 0) {
    // If the task has no dependencies, it can be moved to the last column
    return { canMove: true, blockingDependencies: [] };
  }

  // Check if all dependencies are in the last column
  const blockingDependencies: string[] = [];
  
  for (const dependency of taskDependencies) {
    // Find the dependency task
    const dependencyTask = allTasks.find(task => task.id === dependency.dependency_task_id);
    
    if (!dependencyTask || dependencyTask.column_id !== lastColumnId) {
      // If dependency task doesn't exist or is not in the last column,
      // add it to the blocking dependencies
      if (dependencyTask) {
        blockingDependencies.push(dependencyTask.title);
      }
    }
  }

  return {
    canMove: blockingDependencies.length === 0,
    blockingDependencies
  };
};

/**
 * Get all transitive dependencies for a task
 * This recursively finds all dependencies, including dependencies of dependencies
 */
export const getTransitiveDependencies = (
  taskId: string,
  allTasks: Task[],
  dependencies: TaskDependency[],
  lastColumnId: string
): { 
  canMove: boolean; 
  blockingDependencies: string[] 
} => {
  let result: { canMove: boolean; blockingDependencies: string[] } = { 
    canMove: true, 
    blockingDependencies: [] 
  };
  
  // Set to track visited tasks to prevent infinite recursion on circular dependencies
  const visited = new Set<string>();
  
  // Queue for breadth-first search
  const queue: string[] = [taskId];
  
  while (queue.length > 0) {
    const currentTaskId = queue.shift()!;
    
    if (visited.has(currentTaskId)) {
      continue; // Skip if already visited
    }
    visited.add(currentTaskId);
    
    // Find all immediate dependencies of the current task
    const currentDependencies = dependencies.filter(
      dep => dep.dependent_task_id === currentTaskId
    );
    
    for (const dependency of currentDependencies) {
      const dependencyTask = allTasks.find(task => task.id === dependency.dependency_task_id);
      
      if (!dependencyTask) {
        continue; // Skip if dependency task doesn't exist
      }
      
      if (dependencyTask.column_id !== lastColumnId) {
        // If dependency task is not in the last column, add it to blocking dependencies
        result.blockingDependencies.push(dependencyTask.title);
        result.canMove = false;
      }
      
      // Add this dependency to the queue to check its dependencies too
      queue.push(dependency.dependency_task_id);
    }
  }
  
  return result;
};
