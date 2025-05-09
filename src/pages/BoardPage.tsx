
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
          priority: taskData.priority,
          due_date: taskData.due_date
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-xl font-bold text-blue-800">Board View</h1>
            <p className="text-sm text-blue-600 hidden sm:block">
              {board.description && board.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50" 
              onClick={() => navigate('/dashboard')}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Dashboard
            </Button>
            <span className="text-sm text-muted-foreground hidden sm:inline">{user?.email}</span>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Board header with actions and info - SWAPPED POSITIONS */}
        <div className="flex flex-col sm:flex-row justify-between items-start mb-6 gap-4">
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-blue-800">{board.title}</h2>
            {board.description && (
              <p className="text-sm text-blue-600 sm:hidden">{board.description}</p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setIsAddColumnDialogOpen(true)}
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 rounded-full"
            >
              <Plus className="h-4 w-4" /> Add Column
            </Button>
            <Button variant="outline" className="flex items-center gap-1 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-full">
              <Users className="h-4 w-4" /> Members
            </Button>
            <Button variant="outline" className="flex items-center gap-1 border-blue-300 text-blue-700 hover:bg-blue-50 rounded-full">
              <Settings className="h-4 w-4" /> Settings
            </Button>
          </div>
        </div>
        
        {/* Columns and task cards */}
        <div className="flex space-x-4 overflow-x-auto pb-4 h-[calc(100vh-12rem)]">
          {columns?.map((column) => {
            const columnTasks = getTasksByColumn(column.id);
            
            return (
              <div 
                key={column.id} 
                className="flex-shrink-0 w-80 bg-white rounded-lg shadow-sm border border-blue-100"
              >
                <div className="p-3 font-medium bg-blue-50 border-b border-blue-100 rounded-t-lg flex justify-between items-center">
                  <span className="text-blue-800">{column.title}</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-blue-600 hover:bg-blue-100 hover:text-blue-800" 
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
                    <div className="text-center text-sm text-blue-400 p-4 italic">
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
                <p className="text-blue-500 mb-4">No columns found for this board.</p>
                <Button 
                  onClick={() => setIsAddColumnDialogOpen(true)}
                  className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 rounded-full"
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
