
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBoards } from '@/hooks/useBoards';
import { useTasks, Task, NewTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Users, Settings, Search, MoreHorizontal, ArrowLeft } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { AddColumnDialog } from '@/components/boards/AddColumnDialog';
import { BoardDetailsPanel } from '@/components/boards/BoardDetailsPanel';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { useBoardColumns, useAddColumnMutation } = useBoards();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState<boolean>(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState<boolean>(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState<boolean>(false);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState<boolean>(false);
  const [currentColumnId, setCurrentColumnId] = useState<string>("");
  const [currentTask, setCurrentTask] = useState<Task | undefined>(undefined);

  // Fetch columns for this board
  const { data: columns, isLoading: isColumnsLoading, isError: isColumnsError } = useBoardColumns(boardId);
  
  // Fetch tasks for this board
  const { tasks, isLoading: isTasksLoading, isError: isTasksError, createTask, updateTask, deleteTask, getTasksByColumn } = useTasks(boardId);

  // Mutation for adding a column
  const { mutate: addColumn, isPending: isAddingColumn } = useAddColumnMutation(boardId);
  
  // Handle opening the add task dialog for a specific column
  const handleAddTaskClick = (columnId: string) => {
    setCurrentColumnId(columnId);
    setIsAddTaskDialogOpen(true);
  };

  // Handle creating a new task
  const handleCreateTask = (taskData: NewTask) => {
    createTask(taskData);
  };
  
  // Handle editing a task
  const handleEditTask = (task: Task) => {
    setCurrentTask(task);
    setCurrentColumnId(task.column_id);
    setIsEditTaskDialogOpen(true);
  };
  
  // Handle updating a task
  const handleUpdateTask = (taskData: NewTask) => {
    if (currentTask) {
      updateTask({
        taskId: currentTask.id,
        updates: {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          // Fix: Convert Date object to ISO string if it exists
          due_date: taskData.due_date ? taskData.due_date.toISOString() : null
        }
      });
    }
  };

  // Handle adding a new column
  const handleAddColumn = (title: string) => {
    if (boardId) {
      addColumn(title);
    }
  };
  
  if (isColumnsLoading || isTasksLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-accent">
        <div className="text-center animate-pulse space-y-2">
          <div className="h-8 w-8 bg-primary/20 rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading board...</p>
        </div>
      </div>
    );
  }
  
  if (isColumnsError || isTasksError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-accent space-y-4">
        <p className="text-destructive">Failed to load board</p>
        <Button variant="outline" onClick={() => window.location.reload()}>
          Try again
        </Button>
      </div>
    );
  }

  // Find the board data from tasks array to display board info
  const board = tasks && tasks.length > 0 
    ? { title: "Board", description: "Loading..." } // Default values
    : { title: "Board", description: "No tasks yet" };

  return (
    <div className="flex h-screen overflow-hidden bg-accent">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-border/50 py-3 px-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 text-muted-foreground" 
                onClick={() => navigate('/dashboard')}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold truncate">{board.title}</h1>
                <p className="text-xs text-muted-foreground truncate">{board.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs hidden sm:flex items-center gap-1"
                onClick={() => setIsDetailsPanelOpen(!isDetailsPanelOpen)}
              >
                <Users className="h-4 w-4" />
                <span>Members</span>
              </Button>
              
              <div className="hidden sm:block">
                <Separator orientation="vertical" className="h-6" />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setIsAddColumnDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Column
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsDetailsPanelOpen(!isDetailsPanelOpen)}>
                    <Users className="h-4 w-4 mr-2" />
                    Members
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        
        {/* Board Content */}
        <div className="flex-1 overflow-x-auto p-4">
          <div className="flex space-x-4 h-full">
            {columns?.length === 0 ? (
              <div className="flex items-center justify-center w-full">
                <div className="text-center bg-white p-8 rounded-lg shadow-sm border border-border/40 max-w-md">
                  <div className="bg-primary/10 h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No columns found</h3>
                  <p className="text-muted-foreground mb-6">
                    Get started by creating your first column to organize tasks.
                  </p>
                  <Button 
                    onClick={() => setIsAddColumnDialogOpen(true)}
                    className="rounded-full"
                  >
                    <Plus className="h-4 w-4 mr-2" /> Add Your First Column
                  </Button>
                </div>
              </div>
            ) : (
              columns?.map((column) => {
                const columnTasks = getTasksByColumn(column.id);
                
                return (
                  <div 
                    key={column.id} 
                    className="board-column flex flex-col min-w-[280px] max-w-[280px]"
                  >
                    <div className="column-header text-foreground">
                      <div className="flex items-center">
                        <span className="font-medium truncate">{column.title}</span>
                        <span className="ml-2 text-xs bg-accent px-2 py-0.5 rounded-full text-muted-foreground">
                          {columnTasks.length}
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-accent" 
                        onClick={() => handleAddTaskClick(column.id)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex-1 p-2 overflow-y-auto bg-white/50" style={{ minHeight: "200px" }}>
                      {columnTasks.length > 0 ? (
                        columnTasks.map((task) => (
                          <TaskCard 
                            key={task.id}
                            task={task}
                            onEdit={handleEditTask}
                            onDelete={deleteTask}
                          />
                        ))
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                          <p className="text-sm text-muted-foreground">
                            No tasks yet
                          </p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="mt-2 text-xs" 
                            onClick={() => handleAddTaskClick(column.id)}
                          >
                            <Plus className="h-3 w-3 mr-1" />
                            Add task
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            
            {columns?.length > 0 && (
              <div className="min-w-[280px]">
                <Button 
                  variant="outline" 
                  className="h-12 flex items-center justify-center w-full border-dashed"
                  onClick={() => setIsAddColumnDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" /> 
                  Add Column
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Side panel */}
      {isDetailsPanelOpen && (
        <div className="w-80 h-full bg-white border-l border-border/50 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Board Details</h3>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setIsDetailsPanelOpen(false)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </div>
            {boardId && <BoardDetailsPanel boardId={boardId} />}
          </div>
        </div>
      )}

      {/* Task dialogs */}
      <TaskDialog 
        isOpen={isAddTaskDialogOpen}
        onClose={() => setIsAddTaskDialogOpen(false)}
        onSubmit={handleCreateTask}
        boardId={boardId || ""}
        columnId={currentColumnId}
        title="Add New Task"
      />
      
      <TaskDialog 
        isOpen={isEditTaskDialogOpen}
        onClose={() => setIsEditTaskDialogOpen(false)}
        onSubmit={handleUpdateTask}
        boardId={boardId || ""}
        columnId={currentColumnId}
        isEditing={true}
        task={currentTask}
        title="Edit Task"
      />
      
      {/* Add column dialog */}
      <AddColumnDialog
        isOpen={isAddColumnDialogOpen}
        onClose={() => setIsAddColumnDialogOpen(false)}
        onSubmit={handleAddColumn}
      />
    </div>
  );
}
