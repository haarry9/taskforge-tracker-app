
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/components/ui/use-toast";
import { Task, NewTask } from "@/types/task-types";
import { 
  fetchTasks, 
  createTask as createTaskUtil, 
  updateTask as updateTaskUtil,
  moveTask as moveTaskUtil,
  deleteTask as deleteTaskUtil
} from "@/utils/task-utils";

// Export types from the types file
export type { Task, NewTask };

export const useTasks = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Queries
  const tasksQuery = useQuery({
    queryKey: ["tasks", boardId],
    queryFn: () => boardId ? fetchTasks(boardId, user?.id) : Promise.resolve([]),
    enabled: !!user && !!boardId,
  });

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: (newTask: NewTask) => createTaskUtil(newTask, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (params: { taskId: string; updates: Partial<Omit<Task, 'id' | 'created_at'>> }) => 
      updateTaskUtil(params, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: (params: { 
      taskId: string; 
      newColumnId: string;
      oldColumnId: string;
      newPosition: number;
    }) => moveTaskUtil(params, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
    onError: (error) => {
      console.error("Move task mutation error:", error);
      toast({
        title: "Failed to move task",
        description: "There was an error moving the task. Please try again.",
        variant: "destructive",
      });
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: (taskId: string) => deleteTaskUtil(taskId, user?.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  return {
    tasks: tasksQuery.data || [],
    isLoading: tasksQuery.isLoading,
    isError: tasksQuery.isError,
    error: tasksQuery.error,
    createTask: createTaskMutation.mutate,
    updateTask: updateTaskMutation.mutate,
    moveTask: moveTaskMutation.mutate,
    deleteTask: deleteTaskMutation.mutate,
    isPendingCreate: createTaskMutation.isPending,
    isPendingUpdate: updateTaskMutation.isPending,
    isPendingDelete: deleteTaskMutation.isPending,
    // Helper function to get tasks by column ID
    getTasksByColumn: (columnId: string) => {
      return (tasksQuery.data || [])
        .filter(task => task.column_id === columnId)
        .sort((a, b) => a.position - b.position);
    }
  };
};
