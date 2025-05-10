
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

export type BoardMember = {
  id: string;
  user_id: string;
  board_id: string;
  role: "manager" | "member" | "guest";
  email?: string;
  invitation_status: "pending" | "accepted" | "declined";
  invited_at: string;
  accepted_at?: string;
  created_at: string;
  updated_at: string;
};

export type NewBoardMember = {
  email: string;
  role: "member" | "guest";
  board_id: string;
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
    
    // Get boards where the user is a member (any role)
    const { data: membershipData, error: membershipError } = await supabase
      .from("board_members")
      .select("board_id")
      .eq("user_id", user.id)
      .eq("invitation_status", "accepted");

    if (membershipError) {
      console.error("Error fetching board memberships:", membershipError);
      toast({
        title: "Error fetching boards",
        description: membershipError.message,
        variant: "destructive",
      });
      throw membershipError;
    }

    // Extract board IDs from memberships
    const boardIds = membershipData?.map(membership => membership.board_id) || [];
    
    if (boardIds.length === 0) {
      return [];
    }

    // Fetch boards using the IDs we found
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .in("id", boardIds)
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

  // Function to get board details by ID
  const fetchBoardById = async (boardId: string): Promise<Board | null> => {
    if (!user || !boardId) return null;
    
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();
    
    if (error) {
      console.error("Error fetching board:", error);
      return null;
    }
    
    return data;
  };

  // Function to invite a new member to a board
  const inviteBoardMember = async (newMember: NewBoardMember): Promise<BoardMember> => {
    if (!user) throw new Error("User not authenticated");
    
    // First check if a user with this email exists
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", newMember.email)
      .maybeSingle();
    
    let userId = userData?.id;
    
    // If no user found with this email, we'll create just an invitation
    if (!userId) {
      console.log("No user found with email:", newMember.email);
    }
    
    // Insert the member record
    const { data, error } = await supabase
      .from("board_members")
      .insert([{
        user_id: userId || user.id, // If no user found, use current user temporarily (will be updated when user registers)
        board_id: newMember.board_id,
        role: newMember.role,
        email: newMember.email,
        invitation_status: userId ? 'pending' : 'pending' // If user exists, it's pending; otherwise it's pending too
      }])
      .select()
      .single();

    if (error) {
      // Check for duplicate invitations
      if (error.code === '23505') { // Unique violation
        toast({
          title: "Invitation already sent",
          description: "This user has already been invited to this board.",
          variant: "destructive",
        });
      } else {
        console.error("Error inviting member:", error);
        toast({
          title: "Error inviting member",
          description: error.message,
          variant: "destructive",
        });
      }
      throw error;
    }

    // Get the current user's profile information
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", user.id)
      .single();
    
    const inviterName = profile?.display_name || profile?.email || user.email || "A user";
    const inviterEmail = profile?.email || user.email || "";
    
    // Get board information
    const board = await fetchBoardById(newMember.board_id);
    const boardName = board?.title || "a board";

    // Send invitation email
    try {
      const emailResponse = await supabase.functions.invoke("send-invitation-email", {
        body: {
          inviteeEmail: newMember.email,
          boardName: boardName,
          inviterName: inviterName,
          inviterEmail: inviterEmail,
          role: newMember.role,
          invitationId: data.id
        }
      });
      
      console.log("Email invitation response:", emailResponse);
      
      if (emailResponse.error) {
        console.error("Error sending invitation email:", emailResponse.error);
        // Still continue as the database record was created successfully
      }
    } catch (emailError) {
      console.error("Failed to send invitation email:", emailError);
      // Don't throw here, as we want to continue even if email fails
    }

    toast({
      title: "Invitation sent",
      description: `An invitation has been sent to ${newMember.email}.`,
    });

    return data as BoardMember;
  };

  // Function to update invitation status
  const updateInvitationStatus = async (invitationId: string, status: "accepted" | "declined"): Promise<boolean> => {
    if (!user) throw new Error("User not authenticated");
    
    try {
      // First, get the invitation details
      const { data: invitation, error: invitationError } = await supabase
        .from("board_members")
        .select("*")
        .eq("id", invitationId)
        .single();
        
      if (invitationError || !invitation) {
        console.error("Invitation not found:", invitationError);
        toast({
          title: "Invitation not found",
          description: "The invitation you're trying to respond to doesn't exist or has expired.",
          variant: "destructive"
        });
        return false;
      }
      
      // Check if this invitation is for the current user's email
      if (invitation.email !== user.email) {
        toast({
          title: "Invalid invitation",
          description: "This invitation was not sent to your email address.",
          variant: "destructive"
        });
        return false;
      }
      
      // Update invitation status and link to current user
      const { error: updateError } = await supabase
        .from("board_members")
        .update({ 
          invitation_status: status,
          user_id: user.id,
          accepted_at: status === "accepted" ? new Date().toISOString() : null
        })
        .eq("id", invitationId);
        
      if (updateError) {
        console.error("Error updating invitation:", updateError);
        toast({
          title: "Error responding to invitation",
          description: updateError.message,
          variant: "destructive"
        });
        return false;
      }
      
      // Create activity entry
      if (invitation.board_id) {
        await supabase
          .from("board_activities")
          .insert({
            board_id: invitation.board_id,
            user_id: user.id,
            action_type: status === "accepted" ? "join" : "decline",
            action_description: `${user.email} ${status === "accepted" ? "joined" : "declined"} the board invitation`,
          });
      }
      
      toast({
        title: status === "accepted" ? "Invitation accepted" : "Invitation declined",
        description: status === "accepted" 
          ? "You have successfully joined the board" 
          : "You have declined the invitation"
      });
      
      // If accepted, refresh the boards list
      if (status === "accepted") {
        queryClient.invalidateQueries({ queryKey: ["boards"] });
      }
      
      return true;
    } catch (error) {
      console.error("Error processing invitation response:", error);
      return false;
    }
  };

  // Function to fetch members of a board
  const fetchBoardMembers = async (boardId: string): Promise<BoardMember[]> => {
    if (!user || !boardId) return [];

    const { data, error } = await supabase
      .from("board_members")
      .select("*")
      .eq("board_id", boardId);

    if (error) {
      console.error("Error fetching board members:", error);
      toast({
        title: "Error fetching members",
        description: error.message,
        variant: "destructive",
      });
      throw error;
    }

    return data as BoardMember[];
  };

  // Hook to get columns for a specific board
  const useBoardColumns = (boardId: string | undefined) => {
    return useQuery({
      queryKey: ["boardColumns", boardId],
      queryFn: () => boardId ? fetchBoardColumns(boardId) : Promise.resolve([]),
      enabled: !!boardId && !!user,
    });
  };

  // Hook to get members of a board
  const useBoardMembers = (boardId: string | undefined) => {
    return useQuery({
      queryKey: ["boardMembers", boardId],
      queryFn: () => boardId ? fetchBoardMembers(boardId) : Promise.resolve([]),
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

  // Mutation for inviting a new member
  const useInviteMemberMutation = (boardId: string | undefined) => {
    return useMutation({
      mutationFn: (memberData: Omit<NewBoardMember, "board_id">) => 
        boardId ? inviteBoardMember({ ...memberData, board_id: boardId }) : Promise.reject("No board ID provided"),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["boardMembers", boardId] });
      },
    });
  };

  // Mutation for updating invitation status
  const useUpdateInvitationStatusMutation = () => {
    return useMutation({
      mutationFn: ({ invitationId, status }: { invitationId: string, status: "accepted" | "declined" }) => 
        updateInvitationStatus(invitationId, status),
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
    useBoardMembers,
    useInviteMemberMutation,
    useUpdateInvitationStatusMutation,
    updateInvitationStatus,
  };
};
