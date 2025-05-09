
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export type Board = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  manager_id: string;
};

export type NewBoard = {
  title: string;
  description?: string;
};

export const useBoards = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const fetchBoards = async (): Promise<Board[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching boards:", error);
      toast({
        title: "Error fetching boards",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    return data || [];
  };

  const createBoard = async (newBoard: NewBoard): Promise<Board> => {
    if (!user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from("boards")
      .insert([{ ...newBoard, manager_id: user.id }])
      .select()
      .single();

    if (error) {
      console.error("Error creating board:", error);
      toast({
        title: "Error creating board",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Board created",
      description: "Your new board has been created successfully.",
    });

    return data;
  };

  const boardsQuery = useQuery({
    queryKey: ["boards"],
    queryFn: fetchBoards,
    enabled: !!user,
  });

  const createBoardMutation = useMutation({
    mutationFn: createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["boards"] });
    },
  });

  return {
    boards: boardsQuery.data || [],
    isLoading: boardsQuery.isLoading,
    isError: boardsQuery.isError,
    error: boardsQuery.error,
    createBoard: createBoardMutation.mutate,
    isPending: createBoardMutation.isPending,
  };
};
