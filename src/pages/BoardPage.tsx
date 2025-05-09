
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBoards } from '@/hooks/useBoards';
import { useTasks, Task, NewTask } from '@/hooks/useTasks';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Plus, Users, Settings } from 'lucide-react';
import { TaskCard } from '@/components/tasks/TaskCard';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { AddColumnDialog } from '@/components/boards/AddColumnDialog';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const { useBoardColumns, useAddColumnMutation } = useBoards();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState<boolean>(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState<boolean>(false);
  const [isAddColumnDialogOpen, setIsAddColumnDialogOpen] = useState<boolean>(false);
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
          priority: taskData.priority
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
      <div className="flex items-center justify-center h-screen">
        <p className="text-muted-foreground">Loading board...</p>
      </div>
    );
  }
  
  if (isColumnsError || isTasksError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen space-y-4">
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
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center" 
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold">Board View</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user?.email}</span>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Board header with actions and info */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsAddColumnDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <Plus className="h-4 w-4" /> Add Column
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Members
            </Button>
            <Button variant="outline" className="flex items-center gap-1">
              <Settings className="h-4 w-4" /> Settings
            </Button>
          </div>
          
          <div className="text-right">
            <h2 className="text-xl font-bold">{board.title}</h2>
            {board.description && (
              <p className="text-sm text-muted-foreground">{board.description}</p>
            )}
          </div>
        </div>
        
        {/* Columns and task cards */}
        <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
          {columns?.map((column) => {
            const columnTasks = getTasksByColumn(column.id);
            
            return (
              <div 
                key={column.id} 
                className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border"
              >
                <div className="p-3 font-medium bg-gray-50 border-b rounded-t-lg flex justify-between items-center">
                  <span>{column.title}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8" 
                    onClick={() => handleAddTaskClick(column.id)}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="sr-only">Add task</span>
                  </Button>
                </div>
                <div className="p-2 h-full overflow-y-auto" style={{ maxHeight: 'calc(100vh - 16rem)' }}>
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
                    <div className="text-center text-sm text-muted-foreground p-4">
                      No tasks yet
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          
          {columns?.length === 0 && (
            <div className="w-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-muted-foreground mb-4">No columns found for this board.</p>
                <Button 
                  onClick={() => setIsAddColumnDialogOpen(true)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-4 w-4" /> Add Your First Column
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

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
