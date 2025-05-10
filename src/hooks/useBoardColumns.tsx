
import { useState } from 'react';
import { useBoards } from '@/hooks/useBoards';

export function useBoardColumns(boardId: string | undefined) {
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState<boolean>(false);
  
  const { useBoardColumns, useAddColumnMutation } = useBoards();
  
  // Fetch columns for this board
  const { data: columns, isLoading: isColumnsLoading, isError: isColumnsError } = useBoardColumns(boardId);
  
  // Mutation for adding a column
  const { mutate: addColumn, isPending: isAddingColumn } = useAddColumnMutation(boardId);

  // Handle adding a new column
  const handleAddColumn = (title: string) => {
    if (boardId) {
      addColumn(title);
    }
  };

  return {
    columns,
    isColumnsLoading,
    isColumnsError,
    isAddColumnDialogOpen,
    setIsAddColumnDialogOpen,
    handleAddColumn,
    isAddingColumn
  };
}
