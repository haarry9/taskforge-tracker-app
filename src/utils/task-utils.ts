
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Task, NewTask } from "@/types/task-types";

// Fetch all tasks for a board
export const fetchTasks = async (boardId: string, userId?: string): Promise<Task[]> => {
  if (!userId || !boardId) return [];
  
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

// Create a new task
export const createTask = async (newTask: NewTask, userId?: string): Promise<Task> => {
  if (!userId) throw new Error("User not authenticated");
  
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

// Update an existing task
export const updateTask = async (
  { taskId, updates }: { taskId: string; updates: Partial<Omit<Task, 'id' | 'created_at'>> },
  userId?: string
): Promise<Task> => {
  if (!userId) throw new Error("User not authenticated");
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

// Move a task to a new column/position
export const moveTask = async (
  { 
    taskId, 
    newColumnId, 
    oldColumnId,
    newPosition 
  }: { 
    taskId: string; 
    newColumnId: string;
    oldColumnId: string;
    newPosition: number;
  },
  userId?: string
): Promise<Task> => {
  if (!userId) throw new Error("User not authenticated");
  
  console.log("Moving task:", taskId);
  console.log("From column:", oldColumnId, "to column:", newColumnId);
  console.log("New position:", newPosition);
  
  const updates = {
    column_id: newColumnId,
    position: newPosition,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    console.error("Error moving task:", error);
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
};

// Delete a task
export const deleteTask = async (taskId: string, userId?: string): Promise<void> => {
  if (!userId) throw new Error("User not authenticated");
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
