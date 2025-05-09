import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type Activity = {
  id: string;
  board_id: string;
  user_id: string | null;
  action_type: "create" | "update" | "delete" | "move" | "assign";
  action_description: string;
  task_id: string | null;
  created_at: string;
  metadata: {
    from_column?: string;
    to_column?: string;
    column_name?: string;
    field_name?: string;
    old_value?: string;
    new_value?: string;
    assignee_name?: string;
    dependency_task?: string;
  } | null;
};

export type NewActivity = {
  board_id: string;
  action_type: "create" | "update" | "delete" | "move" | "assign";
  action_description: string;
  task_id?: string | null;
  metadata?: {
    from_column?: string;
    to_column?: string;
    column_name?: string;
    field_name?: string;
    old_value?: string;
    new_value?: string;
    assignee_name?: string;
    dependency_task?: string;
  } | null;
};

export const useActivities = (boardId?: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchActivities = async (boardId: string): Promise<Activity[]> => {
    if (!user || !boardId) return [];
    
    const { data, error } = await supabase
      .from("board_activities")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error fetching activities",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    // Ensure we're casting the data to match our Activity type
    return (data || []) as Activity[];
  };

  const createActivity = async (newActivity: NewActivity): Promise<Activity> => {
    if (!user) throw new Error("User not authenticated");
    
    const activityData = {
      ...newActivity,
      user_id: user.id,
    };

    const { data, error } = await supabase
      .from("board_activities")
      .insert([activityData])
      .select()
      .single();

    if (error) {
      console.error("Error creating activity:", error);
      toast({
        title: "Error logging activity",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    return data as Activity;
  };

  const activitiesQuery = useQuery({
    queryKey: ["activities", boardId],
    queryFn: () => boardId ? fetchActivities(boardId) : Promise.resolve([]),
    enabled: !!user && !!boardId,
  });

  const createActivityMutation = useMutation({
    mutationFn: createActivity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["activities", boardId] });
    },
  });

  return {
    activities: activitiesQuery.data || [],
    isLoading: activitiesQuery.isLoading,
    isError: activitiesQuery.isError,
    error: activitiesQuery.error,
    createActivity: createActivityMutation.mutate,
    isPendingCreate: createActivityMutation.isPending,
  };
};
