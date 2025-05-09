
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users } from "lucide-react";
import { type Board } from "@/hooks/useBoards";
import { Badge } from "@/components/ui/badge";

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate();
  const createdDate = new Date(board.created_at).toLocaleDateString();

  // Determine badge colors based on board title
  const getBadgeColor = (title: string) => {
    if (title.toLowerCase().includes('development') || title.toLowerCase().includes('dev')) {
      return "bg-blue-500 hover:bg-blue-600";
    } else if (title.toLowerCase().includes('design')) {
      return "bg-purple-500 hover:bg-purple-600";
    } else if (title.toLowerCase().includes('marketing')) {
      return "bg-green-500 hover:bg-green-600";
    } else if (title.toLowerCase().includes('research')) {
      return "bg-amber-500 hover:bg-amber-600";
    } else {
      return "bg-gray-500 hover:bg-gray-600";
    }
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden border hover:shadow-md transition-all duration-200 hover:border-blue-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="line-clamp-1">{board.title}</CardTitle>
          <Badge className={getBadgeColor(board.title)}>
            Active
          </Badge>
        </div>
        {board.description && (
          <CardDescription className="line-clamp-2 mt-1 text-gray-600">
            {board.description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="flex-grow space-y-3 text-sm">
        <div className="flex items-center text-gray-500">
          <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
          <span>Created {createdDate}</span>
        </div>
        <div className="flex items-center text-gray-500">
          <Users className="h-3.5 w-3.5 mr-1.5" />
          <span>8 members</span>
        </div>
      </CardContent>
      <CardFooter className="pt-2 border-t">
        <Button 
          variant="default" 
          size="sm" 
          className="w-full bg-blue-600 hover:bg-blue-700"
          onClick={() => navigate(`/board/${board.id}`)}
        >
          Open Board
        </Button>
      </CardFooter>
    </Card>
  );
}
