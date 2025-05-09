
import { BoardCard } from "@/components/boards/BoardCard";
import { useBoards } from "@/hooks/useBoards";
import { Button } from "@/components/ui/button";
import { Plus, RefreshCcw, Folder } from "lucide-react";
import { useState } from "react";
import { CreateBoardDialog } from "@/components/boards/CreateBoardDialog";

export function BoardsGrid() {
  const { boards, isLoading, isError } = useBoards();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 h-48 animate-pulse flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-1/2"></div>
              <div className="h-3 bg-gray-100 rounded w-2/3"></div>
              <div className="h-3 bg-gray-100 rounded w-3/4"></div>
            </div>
            <div className="flex justify-between items-center">
              <div className="h-6 bg-gray-200 rounded-full w-12"></div>
              <div className="h-8 bg-gray-200 rounded w-20"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8 text-center shadow">
        <p className="text-red-600 mb-4">Unable to load your boards</p>
        <Button variant="outline" onClick={() => window.location.reload()} className="flex items-center gap-2">
          <RefreshCcw className="h-4 w-4" />
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-medium text-gray-800">Your Boards</h2>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="rounded-full bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Board
        </Button>
      </div>

      {boards.length === 0 ? (
        <div className="bg-white rounded-lg border border-dashed border-gray-300 p-8 text-center shadow-sm">
          <div className="bg-blue-100 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
            <Folder className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="font-medium mb-2 text-gray-800">Create your first board</h3>
          <p className="text-gray-600 mb-6">
            Get started by creating a board to organize your tasks and projects
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="rounded-full bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Create Board
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))}
          <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center h-[220px] bg-white/50 hover:bg-white transition-colors cursor-pointer shadow-sm hover:shadow-md" onClick={() => setIsCreateDialogOpen(true)}>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium mb-2 text-gray-800">Create a new board</h3>
            <p className="text-sm text-gray-500">
              Add a new board for your next project
            </p>
          </div>
        </div>
      )}

      <CreateBoardDialog
        isOpen={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
      />
    </div>
  );
}
