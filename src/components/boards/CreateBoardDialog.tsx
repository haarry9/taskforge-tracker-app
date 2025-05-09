
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBoards } from "@/hooks/useBoards";
import { useNavigate } from "react-router-dom";

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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new board</DialogTitle>
            <DialogDescription>
              Add a new board to organize your tasks and projects.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Enter board title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoFocus
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Input
                id="description"
                placeholder="Enter board description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lists">Lists (comma-separated)</Label>
              <Input
                id="lists"
                placeholder="To Do, In Progress, Done"
                value={lists}
                onChange={(e) => setLists(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!title.trim() || isPending}>
              {isPending ? "Creating..." : "Create Board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
