
import { useState, useEffect } from 'react';
import { NewTask, Task } from '@/types/task-types';
import { useDependencies } from '@/hooks/useDependencies';
import { TaskFormValues } from '@/components/tasks/TaskDialogForm';

export function useTaskDialog(
  boardId: string,
  columnId: string,
  isEditing: boolean,
  task: Task | undefined,
  isOpen: boolean,
  onSubmit: (data: NewTask, dependencyIds?: string[]) => void,
  onClose: () => void
) {
  const [selectedDependencyIds, setSelectedDependencyIds] = useState<string[]>([]);
  const { getTaskDependencies } = useDependencies(boardId);

  // Load existing dependencies when editing
  useEffect(() => {
    const loadDependencies = async () => {
      if (isEditing && task) {
        try {
          const dependencies = await getTaskDependencies(task.id);
          const dependencyIds = dependencies.map(dep => dep.dependency_task_id);
          setSelectedDependencyIds(dependencyIds);
        } catch (error) {
          console.error("Error loading dependencies:", error);
        }
      } else {
        // Reset dependencies when creating new task
        setSelectedDependencyIds([]);
      }
    };
    
    if (isOpen) {
      loadDependencies();
    }
  }, [isOpen, isEditing, task, getTaskDependencies]);

  function handleFormSubmit(values: TaskFormValues) {
    const taskData: NewTask = {
      title: values.title,
      description: values.description,
      priority: values.priority,
      due_date: values.due_date,
      board_id: boardId,
      column_id: columnId,
    };
    
    onSubmit(taskData, selectedDependencyIds);
    setSelectedDependencyIds([]);
    onClose();
  }

  return {
    selectedDependencyIds,
    setSelectedDependencyIds,
    handleFormSubmit
  };
}
