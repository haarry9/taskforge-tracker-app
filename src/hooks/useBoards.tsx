
import React from 'react';
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

export type BoardColumn = {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
  updated_at: string;
};

export type NewBoard = {
  title: string;
  description?: string;
  columns?: string[];
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
    
    // Start a transaction by using supabase
    const { data: boardData, error: boardError } = await supabase
      .from("boards")
      .insert([{ 
        title: newBoard.title, 
        description: newBoard.description,
        manager_id: user.id 
      }])
      .select()
      .single();

    if (boardError) {
      console.error("Error creating board:", boardError);
      toast({
        title: "Error creating board",
        description: boardError.message,
        variant: "destructive",
      });
      throw boardError;
    }

    // If columns were provided, create them
    if (newBoard.columns && newBoard.columns.length > 0) {
      const columnsToInsert = newBoard.columns.map((title, index) => ({
        board_id: boardData.id,
        title,
        position: index
      }));

      const { error: columnsError } = await supabase
        .from("board_columns")
        .insert(columnsToInsert);

      if (columnsError) {
        console.error("Error creating columns:", columnsError);
        toast({
          title: "Error creating columns",
          description: columnsError.message,
          variant: "destructive",
        });
        throw columnsError;
      }
    }

    toast({
      title: "Board created",
      description: "Your new board has been created successfully.",
    });

    return boardData;
  };

  // New function to fetch columns for a specific board
  const fetchBoardColumns = async (boardId: string): Promise<BoardColumn[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .from("board_columns")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching board columns:", error);
      toast({
        title: "Error fetching columns",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    return data || [];
  };

  // New hook to get columns for a specific board
  const useBoardColumns = (boardId: string | undefined) => {
    return useQuery({
      queryKey: ["boardColumns", boardId],
      queryFn: () => boardId ? fetchBoardColumns(boardId) : Promise.resolve([]),
      enabled: !!boardId && !!user,
    });
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
    useBoardColumns,
  };
};
