
import React from 'react';
import { useParams } from 'react-router-dom';
import { useBoardPage } from '@/hooks/useBoardPage';
import { BoardHeader } from '@/components/boards/BoardHeader';
import { BoardContent } from '@/components/boards/BoardContent';
import { BoardSidePanel } from '@/components/boards/BoardSidePanel';
import { BoardLoadingState } from '@/components/boards/BoardLoadingState';
import { TaskDialog } from '@/components/tasks/TaskDialog';
import { AddColumnDialog } from '@/components/boards/AddColumnDialog';

export default function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>();
  const {
    // State
    isAddTaskDialogOpen,
    isEditTaskDialogOpen,
    isAddColumnDialogOpen,
    isDetailsPanelOpen,
    isDependencyOverlayVisible,
    currentColumnId,
    currentTask,
    
    // Data
    columns,
    tasks,
    dependencies,
    board,
    
    // Loading states
    isLoading,
    isError,
    
    // Action handlers
    setIsAddTaskDialogOpen,
    setIsEditTaskDialogOpen,
    setIsAddColumnDialogOpen,
    setIsDetailsPanelOpen,
    setIsDependencyOverlayVisible,
    handleAddTaskClick,
    handleCreateTask,
    handleEditTask,
    handleUpdateTask,
    handleDeleteTask,
    handleDeleteDependency,
    handleAddColumn,
    handleDragEnd,
    getTasksByColumn
  } = useBoardPage(boardId);

  // Render loading or error state
  if (isLoading || isError) {
    return <BoardLoadingState isLoading={isLoading} isError={isError} />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-accent">
      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <BoardHeader 
          boardTitle={board.title}
          boardDescription={board.description}
          boardId={boardId}
          isDependencyOverlayVisible={isDependencyOverlayVisible}
          setIsDependencyOverlayVisible={setIsDependencyOverlayVisible}
          setIsAddColumnDialogOpen={setIsAddColumnDialogOpen}
          setIsDetailsPanelOpen={setIsDetailsPanelOpen}
        />
        
        <BoardContent 
          columns={columns}
          tasks={tasks}
          dependencies={dependencies}
          getTasksByColumn={getTasksByColumn}
          isDependencyOverlayVisible={isDependencyOverlayVisible}
          onDragEnd={handleDragEnd}
          onAddTask={handleAddTaskClick}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
          onAddColumn={() => setIsAddColumnDialogOpen(true)}
          onDeleteDependency={handleDeleteDependency}
          setIsDependencyOverlayVisible={setIsDependencyOverlayVisible}
        />
      </div>
      
      {/* Side panel */}
      <BoardSidePanel 
        isOpen={isDetailsPanelOpen}
        boardId={boardId || ''}
        onClose={() => setIsDetailsPanelOpen(false)}
      />

      {/* Task dialogs */}
      <TaskDialog 
        isOpen={isAddTaskDialogOpen}
        onClose={() => setIsAddTaskDialogOpen(false)}
        onSubmit={handleCreateTask}
        boardId={boardId || ""}
        columnId={currentColumnId}
        title="Add New Task"
        allTasks={tasks}
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
        allTasks={tasks}
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
