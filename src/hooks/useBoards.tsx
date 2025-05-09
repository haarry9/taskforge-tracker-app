
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

  // Function to fetch columns for a specific board
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

  // New function to add a column to a board
  const addBoardColumn = async (boardId: string, title: string): Promise<BoardColumn> => {
    if (!user) throw new Error("User not authenticated");
    
    // Get the current highest position
    const { data: columns, error: countError } = await supabase
      .from("board_columns")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: false });
      
    if (countError) {
      console.error("Error fetching columns:", countError);
      throw countError;
    }
    
    const position = columns && columns.length > 0 ? columns[0].position + 1 : 0;

    // Insert the new column
    const { data, error } = await supabase
      .from("board_columns")
      .insert([{
        board_id: boardId,
        title,
        position
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding column:", error);
      toast({
        title: "Error adding column",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    toast({
      title: "Column added",
      description: "The column has been added successfully.",
    });

    return data;
  };

  // Hook to get columns for a specific board
  const useBoardColumns = (boardId: string | undefined) => {
    return useQuery({
      queryKey: ["boardColumns", boardId],
      queryFn: () => boardId ? fetchBoardColumns(boardId) : Promise.resolve([]),
      enabled: !!boardId && !!user,
    });
  };

  // Mutation for adding a new column
  const useAddColumnMutation = (boardId: string | undefined) => {
    return useMutation({
      mutationFn: (title: string) => boardId ? addBoardColumn(boardId, title) : Promise.reject("No board ID provided"),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["boardColumns", boardId] });
      },
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
    useAddColumnMutation,
  };
};
