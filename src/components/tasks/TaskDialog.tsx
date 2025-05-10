
import React from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Task, NewTask } from '@/types/task-types';
import { TaskDialogForm } from './TaskDialogForm';
import { TaskDependenciesField } from './TaskDependenciesField';
import { useTaskDialog } from '@/hooks/useTaskDialog';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: NewTask, dependencyIds?: string[]) => void;
  boardId: string;
  columnId: string;
  isEditing?: boolean;
  task?: Task;
  title?: string;
  allTasks?: Task[];
}

export function TaskDialog({
  isOpen,
  onClose,
  onSubmit,
  boardId,
  columnId,
  isEditing = false,
  task,
  title = "Add New Task",
  allTasks = []
}: TaskDialogProps) {
  const {
    selectedDependencyIds,
    setSelectedDependencyIds,
    handleFormSubmit
  } = useTaskDialog(
    boardId, 
    columnId, 
    isEditing, 
    task, 
    isOpen, 
    onSubmit, 
    onClose
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] rounded-lg bg-white shadow-lg border-blue-100">
        <DialogHeader>
          <DialogTitle className="text-blue-800">{title}</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edit the task details below." : "Fill in the details to create a new task."}
          </DialogDescription>
        </DialogHeader>

        <TaskDialogForm
          onSubmit={handleFormSubmit}
          onCancel={onClose}
          isEditing={isEditing}
          task={task}
          isOpen={isOpen}
        >
          <TaskDependenciesField
            boardId={boardId}
            columnId={columnId}
            availableTasks={allTasks}
            selectedTaskIds={selectedDependencyIds}
            currentTaskId={task?.id}
            onSelectDependencies={setSelectedDependencyIds}
          />
        </TaskDialogForm>
      </DialogContent>
    </Dialog>
  );
}
