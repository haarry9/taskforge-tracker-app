
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type Task = {
  id: string;
  board_id: string;
  column_id: string;
  title: string;
  description: string | null;
  priority: "Low" | "Medium" | "High";
  position: number;
  created_at: string;
  updated_at: string;
};

export type NewTask = {
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  board_id: string;
  column_id: string;
  position?: number;
};

export const useTasks = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchTasks = async (boardId: string): Promise<Task[]> => {
    if (!user || !boardId) return [];
    
    const { data, error } = await supabase
      .from("tasks")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      toast({
        title: "Error fetching tasks",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    return data || [];
  };

  const createTask = async (newTask: NewTask): Promise<Task> => {
    if (!user) throw new Error("User not authenticated");
    
    // If position is not provided, get the count of tasks in the column
    // and use that as the new position
    if (newTask.position === undefined) {
      const { count, error: countError } = await supabase
        .from("tasks")
        .select("*", { count: 'exact', head: true })
        .eq("column_id", newTask.column_id);
        
      if (countError) {
        console.error("Error counting tasks:", countError);
        throw countError;
      }
      
      newTask.position = count || 0;
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([newTask])
      .select()
      .single();

    if (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Task created",
      description: "Your task has been created successfully.",
    });

    return data;
  };

  const updateTask = async (taskId: string, updates: Partial<Omit<Task, 'id' | 'created_at'>>): Promise<Task> => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("tasks")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", taskId)
      .select()
      .single();

    if (error) {
      console.error("Error updating task:", error);
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Task updated",
      description: "Your task has been updated successfully.",
    });

    return data;
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");

    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) {
      console.error("Error deleting task:", error);
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Task deleted",
      description: "Your task has been deleted successfully.",
    });
  };

  const tasksQuery = useQuery({
    queryKey: ["tasks", boardId],
    queryFn: () => boardId ? fetchTasks(boardId) : Promise.resolve([]),
    enabled: !!user && !!boardId,
  });

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ taskId, updates }: { taskId: string; updates: Partial<Omit<Task, 'id' | 'created_at'>> }) => 
      updateTask(taskId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
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
    deleteTask: deleteTaskMutation.mutate,
    isPendingCreate: createTaskMutation.isPending,
    isPendingUpdate: updateTaskMutation.isPending,
    isPendingDelete: deleteTaskMutation.isPending,
    // Helper function to get tasks by column ID
    getTasksByColumn: (columnId: string) => {
      return (tasksQuery.data || []).filter(task => task.column_id === columnId);
    }
  };
};
