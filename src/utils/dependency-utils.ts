
import { supabase } from "@/integrations/supabase/client";
import { TaskDependency, NewTaskDependency } from "@/types/dependency-types";
import { toast } from "@/components/ui/use-toast";

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
