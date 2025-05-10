
import React from 'react';
import { FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import DependencySelect from './DependencySelect';
import { Task } from '@/types/task-types';

interface TaskDependenciesFieldProps {
  boardId: string;
  columnId: string;
  availableTasks: Task[];
  selectedTaskIds: string[];
  currentTaskId?: string;
  onSelectDependencies: (taskIds: string[]) => void;
}

export function TaskDependenciesField({
  boardId,
  columnId,
  availableTasks,
  selectedTaskIds,
  currentTaskId,
  onSelectDependencies
}: TaskDependenciesFieldProps) {
  return (
    <FormItem>
      <FormLabel className="text-blue-700">Dependencies</FormLabel>
      <DependencySelect
        boardId={boardId}
        columnId={columnId}
        availableTasks={availableTasks}
        selectedTaskIds={selectedTaskIds}
        currentTaskId={currentTaskId}
        onSelectDependencies={onSelectDependencies}
      />
      <FormMessage />
    </FormItem>
  );
}
