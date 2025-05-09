
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBoards } from "@/hooks/useBoards";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

interface CreateBoardDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateBoardDialog({ isOpen, onClose }: CreateBoardDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [lists, setLists] = useState("");
  const { createBoard, isPending } = useBoards();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) return;
    
    // Parse the comma-separated list of column names
    const columns = lists
      ? lists.split(',').map(name => name.trim()).filter(name => name !== "")
      : ["To Do", "In Progress", "Done"]; // Default columns if nothing provided

    createBoard(
      { 
        title: title.trim(), 
        description: description.trim() || undefined,
        columns
      },
      {
        onSuccess: (board) => {
          setTitle("");
          setDescription("");
          setLists("");
          onClose();
          // Navigate to the new board page
          navigate(`/board/${board.id}`);
        },
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[475px] bg-white border-0 shadow-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl text-gray-800">Create new board</DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new board to organize your tasks and projects.
            </DialogDescription>
          </DialogHeader>

          <Separator className="my-4" />

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="text-gray-700">Board Title</Label>
              <Input
                id="title"
                placeholder="Enter board title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                autoFocus
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description" className="text-gray-700">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Enter board description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none min-h-[100px]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lists" className="text-gray-700">Lists (comma-separated)</Label>
              <Input
                id="lists"
                placeholder="To Do, In Progress, Done"
                value={lists}
                onChange={(e) => setLists(e.target.value)}
                className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Default columns will be created if left empty
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} 
              className="border-gray-300 text-gray-700 hover:bg-gray-50">
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending}
              className="bg-blue-600 hover:bg-blue-700">
              {isPending ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
