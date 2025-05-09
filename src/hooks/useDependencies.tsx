
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { TaskDependency, NewTaskDependency } from "@/types/dependency-types";
import {
  fetchDependencies,
  createDependency,
  deleteDependency,
  getTaskDependencies,
  getTaskDependents,
  checkCircularDependency
} from "@/utils/dependency-utils";

export type { TaskDependency, NewTaskDependency };

export const useDependencies = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Set up queries and mutations
  const dependenciesQuery = useQuery({
    queryKey: ["dependencies", boardId],
    queryFn: () => boardId ? fetchDependencies(boardId, user?.id) : Promise.resolve([]),
    enabled: !!user && !!boardId,
  });

  const createDependencyMutation = useMutation({
    mutationFn: (newDep: NewTaskDependency) => 
      createDependency(newDep, user?.id, checkCircularDependency),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dependencies", boardId] });
    },
    onError: (error) => {
      console.error("Error creating dependency:", error);
    }
  });

  const deleteDependencyMutation = useMutation({
    mutationFn: (dependencyId: string) => deleteDependency(dependencyId, user?.id),
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
    getTaskDependencies: (taskId: string) => getTaskDependencies(taskId, user?.id),
    getTaskDependents: (taskId: string) => getTaskDependents(taskId, user?.id),
    isPendingCreate: createDependencyMutation.isPending,
    isPendingDelete: deleteDependencyMutation.isPending,
  };
};
