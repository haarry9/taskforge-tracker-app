
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarDays } from "lucide-react";
import { type Board } from "@/hooks/useBoards";

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate();
  const createdDate = new Date(board.created_at).toLocaleDateString();

  return (
    <Card className="h-full flex flex-col overflow-hidden border-2 hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <CardTitle className="line-clamp-1">{board.title}</CardTitle>
        {board.description && (
          <CardDescription className="line-clamp-2">
            {board.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="flex items-center text-xs text-muted-foreground">
          <CalendarDays className="h-3.5 w-3.5 mr-1" />
          <span>Created {createdDate}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigate(`/board/${board.id}`)}
        >
          Open Board
        </Button>
      </CardFooter>
    </Card>
  );
}
