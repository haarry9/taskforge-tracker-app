
import { useBoards } from '@/hooks/useBoards';

export function useColumnOperations(boardId: string | undefined) {
  // Fetch columns for this board
  const { useBoardColumns, useAddColumnMutation } = useBoards();
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
    handleAddColumn,
    isAddingColumn
  };
}
