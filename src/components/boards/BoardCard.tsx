
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { CalendarDays, Users, MoreHorizontal } from "lucide-react";
import { type Board } from "@/hooks/useBoards";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  const navigate = useNavigate();
  const createdDate = new Date(board.created_at).toLocaleDateString();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  // Get card colors to match sticky notes theme
  const getCardColor = () => {
    if (board.title.toLowerCase().includes('development') || board.title.toLowerCase().includes('dev')) {
      return "bg-blue-50 hover:bg-blue-100 border-blue-200";
    } else if (board.title.toLowerCase().includes('design')) {
      return "bg-purple-50 hover:bg-purple-100 border-purple-200";
    } else if (board.title.toLowerCase().includes('marketing')) {
      return "bg-green-50 hover:bg-green-100 border-green-200";
    } else if (board.title.toLowerCase().includes('research')) {
      return "bg-amber-50 hover:bg-amber-100 border-amber-200";
    } else {
      return "bg-yellow-50 hover:bg-yellow-100 border-yellow-200";
    }
  };

  const handleCardClick = () => {
    // Only navigate if menu isn't open
    if (!isMenuOpen) {
      navigate(`/board/${board.id}`);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement edit functionality here
    console.log('Edit board', board.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Implement delete functionality here
    console.log('Delete board', board.id);
  };

  return (
    <Card 
      className={cn(
        "h-full flex flex-col overflow-hidden border hover:shadow-md transition-all duration-200 transform hover:-rotate-1 cursor-default",
        getCardColor()
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          {/* Removed line-clamp-1 class to allow full title visibility */}
          <CardTitle className="break-words">{board.title}</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getBadgeColor(board.title)}>
              Active
            </Badge>
            
            {/* Three-dot menu */}
            <DropdownMenu onOpenChange={setIsMenuOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 rounded-full p-0 hover:bg-white/80"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={handleEdit}>Edit</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-600 focus:text-red-600"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {board.description && (
          <CardDescription className="mt-1 text-gray-600 break-words">
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
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/board/${board.id}`);
          }}
        >
          Open Board
        </Button>
      </CardFooter>
    </Card>
  );
}
