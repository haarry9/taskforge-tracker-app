
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type TaskDependency = {
  id: string;
  dependent_task_id: string;
  dependency_task_id: string;
  created_at: string;
  updated_at: string;
};

export type NewTaskDependency = {
  dependent_task_id: string;
  dependency_task_id: string;
};

export const useDependencies = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Fetch all dependencies for a board
  const fetchDependencies = async (boardId: string): Promise<TaskDependency[]> => {
    if (!user || !boardId) return [];
    
    // We join with tasks table to filter dependencies by board_id
    const { data, error } = await supabase
      .from("task_dependencies")
      .select("*")
      .in("dependent_task_id", function(query) {
        return query.from("tasks").select("id").eq("board_id", boardId);
      });

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
  const createDependency = async (newDependency: NewTaskDependency): Promise<TaskDependency> => {
    if (!user) throw new Error("User not authenticated");

    // Check for circular dependencies
    const circularCheck = await checkCircularDependency(
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
  const deleteDependency = async (dependencyId: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    
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
  const getTaskDependencies = async (taskId: string): Promise<TaskDependency[]> => {
    if (!user) return [];

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
  const getTaskDependents = async (taskId: string): Promise<TaskDependency[]> => {
    if (!user) return [];

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
  const checkCircularDependency = async (
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

  // Set up queries and mutations
  const dependenciesQuery = useQuery({
    queryKey: ["dependencies", boardId],
    queryFn: () => boardId ? fetchDependencies(boardId) : Promise.resolve([]),
    enabled: !!user && !!boardId,
  });

  const createDependencyMutation = useMutation({
    mutationFn: createDependency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependencies", boardId] });
    },
    onError: (error) => {
      console.error("Error creating dependency:", error);
    }
  });

  const deleteDependencyMutation = useMutation({
    mutationFn: deleteDependency,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependencies", boardId] });
    },
    onError: (error) => {
      console.error("Error deleting dependency:", error);
    }
  });

  return {
    dependencies: dependenciesQuery.data || [],
    isLoading: dependenciesQuery.isLoading,
    isError: dependenciesQuery.isError,
    error: dependenciesQuery.error,
    createDependency: createDependencyMutation.mutate,
    deleteDependency: deleteDependencyMutation.mutate,
    getTaskDependencies,
    getTaskDependents,
    isPendingCreate: createDependencyMutation.isPending,
    isPendingDelete: deleteDependencyMutation.isPending,
  };
};
