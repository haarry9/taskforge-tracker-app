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
  due_date?: string | null;
  position: number;
  created_at: string;
  updated_at: string;
  assignee_id?: string | null;
};

export type NewTask = {
  title: string;
  description?: string;
  priority: "Low" | "Medium" | "High";
  due_date?: Date | null;
  board_id: string;
  column_id: string;
  position?: number;
  assignee_id?: string | null;
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

    // Cast the data to ensure priority is of the correct type
    return (data || []).map(task => ({
      ...task,
      priority: task.priority as "Low" | "Medium" | "High"
    }));
  };

  const createTask = async (newTask: NewTask): Promise<Task> => {
    if (!user) throw new Error("User not authenticated");
    
    // Format the due date properly for Supabase if it exists
    const formattedTask = {
      ...newTask,
      due_date: newTask.due_date ? newTask.due_date.toISOString() : null,
    };
    
    // If position is not provided, get the count of tasks in the column
    // and use that as the new position
    if (formattedTask.position === undefined) {
      const { count, error: countError } = await supabase
        .from("tasks")
        .select("*", { count: 'exact', head: true })
        .eq("column_id", formattedTask.column_id);
        
      if (countError) {
        console.error("Error counting tasks:", countError);
        throw countError;
      }
      
      formattedTask.position = count || 0;
    }

    const { data, error } = await supabase
      .from("tasks")
      .insert([formattedTask])
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

    // Cast the data to ensure priority is of the correct type
    return {
      ...data,
      priority: data.priority as "Low" | "Medium" | "High"
    };
  };

  const updateTask = async ({ taskId, updates }: { taskId: string; updates: Partial<Omit<Task, 'id' | 'created_at'>> }): Promise<Task> => {
    if (!user) throw new Error("User not authenticated");
    if (!taskId) throw new Error("Task ID is required");
    
    console.log("Updating task with ID:", taskId);
    console.log("Updates:", updates);

    // Format the due date properly for Supabase if it exists
    const formattedUpdates = {
      ...updates,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("tasks")
      .update(formattedUpdates)
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

    // Cast the data to ensure priority is of the correct type
    return {
      ...data,
      priority: data.priority as "Low" | "Medium" | "High"
    };
  };

  const moveTask = async ({ 
    taskId, 
    newColumnId, 
    oldColumnId,
    newPosition 
  }: { 
    taskId: string; 
    newColumnId: string;
    oldColumnId: string;
    newPosition: number;
  }): Promise<Task> => {
    if (!user) throw new Error("User not authenticated");
    
    console.log("Moving task:", taskId);
    console.log("From column:", oldColumnId, "to column:", newColumnId);
    console.log("New position:", newPosition);
    
    const updates = {
      column_id: newColumnId,
      position: newPosition,
      updated_at: new Date().toISOString(),
    };

    // Optimistic update
    const previousTasks = queryClient.getQueryData<Task[]>(["tasks", boardId]);
    if (previousTasks) {
      const updatedTasks = previousTasks.map(task => 
        task.id === taskId 
          ? { ...task, ...updates } 
          : task
      );
      queryClient.setQueryData(["tasks", boardId], updatedTasks);
    }

    try {
      const { data, error } = await supabase
        .from("tasks")
        .update(updates)
        .eq("id", taskId)
        .select()
        .single();

      if (error) {
        console.error("Error moving task:", error);
        
        // Revert optimistic update on error
        if (previousTasks) {
          queryClient.setQueryData(["tasks", boardId], previousTasks);
        }
        
        toast({
          title: "Error moving task",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      // Cast the data to ensure priority is of the correct type
      return {
        ...data,
        priority: data.priority as "Low" | "Medium" | "High"
      };
    } catch (error) {
      console.error("Unexpected error moving task:", error);
      // Revert optimistic update on any error
      if (previousTasks) {
        queryClient.setQueryData(["tasks", boardId], previousTasks);
      }
      throw error;
    }
  };

  const deleteTask = async (taskId: string): Promise<void> => {
    if (!user) throw new Error("User not authenticated");
    if (!taskId) throw new Error("Task ID is required");

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
    mutationFn: updateTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
    },
  });

  const moveTaskMutation = useMutation({
    mutationFn: moveTask,
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
